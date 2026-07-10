Db = {}

local function remainingStr(endTime)
    local rem = math.max(0, (endTime or 0) - os.time())
    return string.format('%02d:%02d:%02d', math.floor(rem / 3600), math.floor((rem % 3600) / 60), rem % 60)
end

local function rowToItem(row)
    return {
        id = tostring(row.id),
        kind = row.kind,
        name = row.name,
        tier = row.tier,
        bid = (row.current_price and row.current_price > 0) and row.current_price or row.base_bid,
        endTime = remainingStr(row.end_time),
        participants = row.participants or 0,
        winner = row.winner_name,
        paid = row.paid
    }
end

-- Canlı listeler (bounded) → snapshot
function Db.GetSnapshot()
    local rows = MySQL.query.await([[
    SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants
    FROM auctions a WHERE a.status IN ('upcoming','open','final') ORDER BY a.end_time ASC
  ]])
    local ongoing, upcoming = {}, {}
    for _, r in ipairs(rows or {}) do
        local item = rowToItem(r)
        if r.status == 'upcoming' then
            upcoming[#upcoming + 1] = item
        else
            ongoing[#ongoing + 1] = item
        end
    end
    return {
        ongoing = ongoing,
        upcoming = upcoming
    }
end

-- Tek item (delta yayını için)
function Db.GetOne(id)
    local rows = MySQL.query.await([[
    SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants
    FROM auctions a WHERE a.id = ?
  ]], {id})
    return (rows and rows[1]) and rowToItem(rows[1]) or nil
end

-- Recent → sunucu-tarafı pagination + filtre
function Db.GetRecentPage(f)
    f = f or {}
    local pageSize = f.pageSize or Config.PageSize
    local page = math.max(0, f.page or 0)

    local where, params = {"status = 'ended'"}, {}

    if f.tiers and #f.tiers > 0 then
        local m = {}
        for _, t in ipairs(f.tiers) do
            m[#m + 1] = '?';
            params[#params + 1] = t
        end
        where[#where + 1] = 'tier IN (' .. table.concat(m, ',') .. ')'
    end
    if f.kinds and #f.kinds > 0 then
        local m = {}
        for _, k in ipairs(f.kinds) do
            m[#m + 1] = '?';
            params[#params + 1] = k
        end
        where[#where + 1] = 'kind IN (' .. table.concat(m, ',') .. ')'
    end
    if f.bidPreset then
        where[#where + 1] = (f.bidDir == 'lte') and 'paid <= ?' or 'paid >= ?'
        params[#params + 1] = f.bidPreset
    end
    if f.nameQuery and f.nameQuery ~= '' then
        where[#where + 1] = '(name LIKE ? OR winner_name LIKE ?)'
        params[#params + 1] = '%' .. f.nameQuery .. '%'
        params[#params + 1] = '%' .. f.nameQuery .. '%'
    end

    local whereSql = table.concat(where, ' AND ')

    local totalRow = MySQL.query.await('SELECT COUNT(*) AS c FROM auctions WHERE ' .. whereSql, params)
    local total = (totalRow and totalRow[1] and totalRow[1].c) or 0

    local col = ({
        bid = 'paid',
        part = 'participants',
        time = 'end_time'
    })[f.sortKey] or 'end_time'
    local dir = (f.sortDir == 'asc') and 'ASC' or 'DESC' -- varsayılan: en yeni biten önce (DESC)

    local qp = {}
    for i = 1, #params do
        qp[i] = params[i]
    end
    qp[#qp + 1] = pageSize
    qp[#qp + 1] = page * pageSize

    local rows = MySQL.query.await(
        ('SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants ' ..
            'FROM auctions a WHERE %s ORDER BY %s %s LIMIT ? OFFSET ?'):format(whereSql, col, dir), qp)

    local items = {}
    for _, r in ipairs(rows or {}) do
        items[#items + 1] = rowToItem(r)
    end
    return {
        items = items,
        total = total
    }
end

function Db.CreateAuction(d)
    local now = os.time()
    local endTime = now + (d.duration or 3600)
    local status = (endTime - now > Config.GoLiveSeconds) and 'upcoming' or 'open'
    local contents = json.encode(Db.GenerateContents(d.kind, d.tier))

    -- KONUM: admin verdiyse onu kullan; yoksa türe göre havuzdan RASTGELE seç
    local loc = d.location
    if not loc then
        local pool = Config.VaultSpots and Config.VaultSpots[d.kind]
        if pool and #pool > 0 then
            loc = pool[math.random(#pool)]
        end
    end

    local id = MySQL.insert.await([[
    INSERT INTO auctions
      (kind, name, tier, base_bid, current_price, start_time, end_time, status, contents_json, loc_x, loc_y, loc_z)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ]], {d.kind, d.name, d.tier, d.base_bid, d.base_bid, now, endTime, status, contents, loc and loc.x or nil,
       loc and loc.y or nil, loc and loc.z or nil})
    return id, status
end

function Db.CountActive()
    local r = MySQL.query.await("SELECT COUNT(*) AS c FROM auctions WHERE status IN ('upcoming','open','final')")
    return (r and r[1] and r[1].c) or 0
end

function Db.GenerateContents(kind, tier)
    local pool = (Config.Loot[kind] or {})[tier]
    if not pool or #pool == 0 then
        return {}
    end

    local roll = (Config.LootRoll and Config.LootRoll[tier]) or {}
    local baseChance = roll.chance or 40
    local minTypes = roll.minTypes or 1
    local maxTypes = roll.maxTypes or 6
    local rarity = Config.LootRarity or {}

    -- havuzu karıştır (her auction farklı sıra → farklı seçim)
    local idx = {}
    for i = 1, #pool do
        idx[i] = i
    end
    for i = #idx, 2, -1 do
        local j = math.random(i)
        idx[i], idx[j] = idx[j], idx[i]
    end

    -- 1) şans zarı (maxTypes ile sınırlı)
    local out = {}
    for _, k in ipairs(idx) do
        if #out >= maxTypes then
            break
        end
        local e = pool[k]
        local chance = e.chance or rarity[e.item] or baseChance
        if math.random(100) <= chance then
            out[#out + 1] = {
                item = e.item,
                count = math.random(e.min or 1, e.max or 1)
            }
        end
    end

    -- 2) minTypes garanti (auction boş/az kalmasın): kalan itemlerden tamamla
    if #out < minTypes then
        local have = {}
        for _, o in ipairs(out) do
            have[o.item] = true
        end
        for _, k in ipairs(idx) do
            if #out >= minTypes then
                break
            end
            local e = pool[k]
            if not have[e.item] then
                have[e.item] = true
                out[#out + 1] = {
                    item = e.item,
                    count = math.random(e.min or 1, e.max or 1)
                }
            end
        end
    end

    return out
end

function Db.SettleAuction(id)
    local a = MySQL.query.await(
        "SELECT kind, name, tier, contents_json, current_price, base_bid, loc_x, loc_y, loc_z FROM auctions WHERE id = ?",
        {id})
    local info = a and a[1]

    -- satış fiyatı = son güncel fiyat
    local finalPrice = info and
                           ((info.current_price and info.current_price > 0) and info.current_price or info.base_bid) or
                           0

    -- KAZANAN (final tur) — SONUNA "AND fake = 0" eklendi
    local wrow = MySQL.query.await([[
  SELECT citizenid FROM auction_bids
  WHERE auction_id = ? AND is_final = 1 AND fake = 0
  ORDER BY amount DESC, id DESC LIMIT 1
]], {id})
    if not (wrow and wrow[1]) then
        wrow = MySQL.query.await([[
    SELECT citizenid FROM auction_bids
    WHERE auction_id = ? AND fake = 0
    ORDER BY id DESC LIMIT 1
  ]], {id})
    end

    local winnerCid, winnerName
    if wrow and wrow[1] then
        winnerCid = wrow[1].citizenid
        winnerName = Payouts.nameOf(winnerCid)
    end

    -- İADE — SONUNA "AND fake = 0" eklendi (sahte teklife iade yok)
    local totals = MySQL.query.await([[
  SELECT citizenid, SUM(amount) AS total FROM auction_bids
  WHERE auction_id = ? AND fake = 0 GROUP BY citizenid
]], {id})
    for _, r in ipairs(totals or {}) do
        if r.citizenid ~= winnerCid then
            Payouts.refund(r.citizenid, tonumber(r.total) or 0, 'auction-refund')
        end
    end

    -- Kazanan: ödül kutusu (konum da kopyalanıyor)
    if winnerCid and info then
        MySQL.insert.await([[
    INSERT INTO vault_boxes (owner_id, name, kind, tier, est_value, security, end_time, contents_json, loc_x, loc_y, loc_z)
    VALUES (?, ?, ?, ?, ?, 'unprotected', ?, ?, ?, ?, ?)
  ]], {winnerCid, info.name, info.kind, info.tier, finalPrice, os.time() + 24 * 3600, info.contents_json, info.loc_x,
       info.loc_y, info.loc_z})
    end

    MySQL.update.await([[
    UPDATE auctions SET status='ended', winner_id=?, winner_name=?, paid=?, contents_json=NULL WHERE id=?
  ]], {winnerCid, winnerName, finalPrice, id})

    return {
        winner = winnerName,
        paid = finalPrice,
        winnerCid = winnerCid
    }
end


-- Bu oyuncunun katıldığı auction'lar → restart/relog sonrası Joined sekmesini geri yükler
function Db.GetJoined(cid)
    local rows = MySQL.query.await([[
    SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants
    FROM auctions a
    JOIN auction_participants jp ON jp.auction_id = a.id AND jp.citizenid = ?
    ORDER BY a.end_time DESC
  ]], { cid })

    local items = {}
    for _, r in ipairs(rows or {}) do
        local item = rowToItem(r)
        item.deadline = (r.end_time or 0) * 1000        -- mutlak bitiş (ms) → sayaç doğru devam etsin
        if r.status == 'ended' then
            item.result = (r.winner_id == cid) and 'won' or 'lost'
            item.decidedAt = (r.end_time or 0) * 1000
        end
        items[#items + 1] = item
    end
    return items
end