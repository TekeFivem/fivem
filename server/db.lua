Db = {}

local function remainingStr(endTime)
  local rem = math.max(0, (endTime or 0) - os.time())
  return string.format('%02d:%02d:%02d', math.floor(rem/3600), math.floor((rem%3600)/60), rem%60)
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
    paid = row.paid,
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
    if r.status == 'upcoming' then upcoming[#upcoming+1] = item else ongoing[#ongoing+1] = item end
  end
  return { ongoing = ongoing, upcoming = upcoming }
end

-- Tek item (delta yayını için)
function Db.GetOne(id)
  local rows = MySQL.query.await([[
    SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants
    FROM auctions a WHERE a.id = ?
  ]], { id })
  return (rows and rows[1]) and rowToItem(rows[1]) or nil
end

-- Recent → sunucu-tarafı pagination + filtre
function Db.GetRecentPage(f)
  f = f or {}
  local pageSize = f.pageSize or Config.PageSize
  local page = math.max(0, f.page or 0)

  local where, params = { "status = 'ended'" }, {}

  if f.tiers and #f.tiers > 0 then
    local m = {}
    for _, t in ipairs(f.tiers) do m[#m+1] = '?'; params[#params+1] = t end
    where[#where+1] = 'tier IN (' .. table.concat(m, ',') .. ')'
  end
  if f.kinds and #f.kinds > 0 then
    local m = {}
    for _, k in ipairs(f.kinds) do m[#m+1] = '?'; params[#params+1] = k end
    where[#where+1] = 'kind IN (' .. table.concat(m, ',') .. ')'
  end
  if f.bidPreset then
    where[#where+1] = (f.bidDir == 'lte') and 'paid <= ?' or 'paid >= ?'
    params[#params+1] = f.bidPreset
  end
  if f.nameQuery and f.nameQuery ~= '' then
    where[#where+1] = '(name LIKE ? OR winner_name LIKE ?)'
    params[#params+1] = '%' .. f.nameQuery .. '%'
    params[#params+1] = '%' .. f.nameQuery .. '%'
  end

  local whereSql = table.concat(where, ' AND ')

  local totalRow = MySQL.query.await('SELECT COUNT(*) AS c FROM auctions WHERE ' .. whereSql, params)
  local total = (totalRow and totalRow[1] and totalRow[1].c) or 0

  local col = ({ bid = 'paid', part = 'participants', time = 'end_time' })[f.sortKey] or 'end_time'
  local dir = (f.sortDir == 'asc') and 'ASC' or 'DESC'  -- varsayılan: en yeni biten önce (DESC)

  local qp = {}
  for i = 1, #params do qp[i] = params[i] end
  qp[#qp+1] = pageSize
  qp[#qp+1] = page * pageSize

  local rows = MySQL.query.await(
    ('SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants ' ..
     'FROM auctions a WHERE %s ORDER BY %s %s LIMIT ? OFFSET ?'):format(whereSql, col, dir), qp)

  local items = {}
  for _, r in ipairs(rows or {}) do items[#items+1] = rowToItem(r) end
  return { items = items, total = total }
end

function Db.CreateAuction(d)
  local now = os.time()
  local endTime = now + (d.duration or 3600)
  local status = (endTime - now > Config.GoLiveSeconds) and 'upcoming' or 'open'
  local contents = json.encode(Db.GenerateContents(d.kind, d.tier))
  local id = MySQL.insert.await([[
    INSERT INTO auctions (kind, name, tier, base_bid, current_price, start_time, end_time, status, contents_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ]], { d.kind, d.name, d.tier, d.base_bid, d.base_bid, now, endTime, status, contents })
  return id, status
end

function Db.CountActive()
  local r = MySQL.query.await("SELECT COUNT(*) AS c FROM auctions WHERE status IN ('upcoming','open','final')")
  return (r and r[1] and r[1].c) or 0
end


function Db.GenerateContents(kind, tier)
  local pool = (Config.Loot[kind] or {})[tier]
  if not pool then return {} end
  local out = {}
  for _, e in ipairs(pool) do
    out[#out+1] = { item = e.item, count = math.random(e.min, e.max) }
  end
  return out
end

function Db.SettleAuction(id)
  local a = MySQL.query.await("SELECT kind, tier, contents_json FROM auctions WHERE id = ?", { id })
  local info = a and a[1]

  local rows = MySQL.query.await([[
    SELECT citizenid, SUM(amount) AS total, MAX(id) AS last_bid
    FROM auction_bids WHERE auction_id = ?
    GROUP BY citizenid ORDER BY total DESC, last_bid DESC
  ]], { id })

  local winnerCid, winnerTotal, winnerName
  if rows and rows[1] then
    winnerCid   = rows[1].citizenid
    winnerTotal = tonumber(rows[1].total) or 0   -- ✅ string → number
    winnerName  = Payouts.nameOf(winnerCid)
  end

  -- KAZANAN HARİÇ herkese iade
  for _, r in ipairs(rows or {}) do
    if r.citizenid ~= winnerCid then
      Payouts.refund(r.citizenid, tonumber(r.total) or 0, 'auction-refund')
    end
  end

  -- Kazanan: ödül kutusu
  if winnerCid and info then
    MySQL.insert.await([[
      INSERT INTO vault_boxes (owner_id, kind, tier, est_value, security, end_time, contents_json)
      VALUES (?, ?, ?, ?, 'unprotected', ?, ?)
    ]], { winnerCid, info.kind, info.tier, winnerTotal, os.time() + 24 * 3600, info.contents_json })
  end

  MySQL.update.await([[
    UPDATE auctions SET status='ended', winner_id=?, winner_name=?, paid=?, contents_json=NULL WHERE id=?
  ]], { winnerCid, winnerName, winnerTotal, id })

  return { winner = winnerName, paid = winnerTotal, winnerCid = winnerCid }
end
