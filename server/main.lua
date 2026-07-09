-- ox_inventory tablet item
exports('useTablet', function(event, _, inventory)
    if event ~= 'usingItem' then
        return
    end
    TriggerClientEvent('teke_auction:open', inventory.id)
end)

-- Snapshot: sadece canlı listeler (ongoing + upcoming)
lib.callback.register('teke_auction:getSnapshot', function()
    return Db.GetSnapshot()
end)

-- Recent: sunucu-tarafı sayfalı
lib.callback.register('teke_auction:getRecent', function(_, data)
    return Db.GetRecentPage(data)
end)

-- Viewer sistemi (karar A: girişte abone, oyun boyu)
local Viewers = {}
RegisterNetEvent('teke_auction:subscribe', function()
    local src = source
    Viewers[src] = true
    TriggerClientEvent('teke_auction:snapshot', src, Db.GetSnapshot())
end)
RegisterNetEvent('teke_auction:unsubscribe', function()
    Viewers[source] = nil
end)
AddEventHandler('playerDropped', function()
    Viewers[source] = nil
end)

function NotifyViewers(action, data, exclude)
    for src in pairs(Viewers) do
        if src ~= exclude then
            TriggerClientEvent('teke_auction:' .. action, src, data)
        end
    end
end

lib.callback.register('teke_auction:joinAuction', function(source, data)
    local src = source
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        return false
    end
    local cid = player.PlayerData.citizenid
    local id = data and data.id
    if not id then
        return false
    end

    -- sadece aktif (open/final) auction'a katılınır
    local a = MySQL.query.await("SELECT status FROM auctions WHERE id = ?", {id})
    if not (a and a[1]) then
        return false
    end
    if a[1].status ~= 'open' and a[1].status ~= 'final' then
        return false
    end

    -- katılımcı ekle (zaten varsa yok say)
    MySQL.insert.await('INSERT IGNORE INTO auction_participants (auction_id, citizenid) VALUES (?, ?)', {id, cid})

    -- güncel sayı → tüm viewer'lara canlı ilet
    local c = MySQL.query.await('SELECT COUNT(*) AS c FROM auction_participants WHERE auction_id = ?', {id})
    local count = (c and c[1] and c[1].c) or 0
    NotifyViewers('stats', {
        id = tostring(id),
        participants = count
    })

    return {
        ok = true,
        participants = count
    }
end)

lib.callback.register('teke_auction:placeBid', function(source, data)
    local src = source
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        return {
            ok = false
        }
    end
    local cid = player.PlayerData.citizenid

    local id = data and data.id
    local amount = math.floor(tonumber(data and data.amount) or 0)
    local hidden = (data and data.hidden) and true or false
    if not id or amount <= 0 then
        return {
            ok = false
        }
    end

    -- ▼ Lock Bidder hack: hedef kilitliyse teklif engelle ▼
    do
        local locked, secLeft = IsBidLocked(tonumber(id) or id, cid)
        if locked then
            if Config.Debug then
                print(('[hack] LOCKED cid=%s auction=%s %ds'):format(cid, tostring(id), secLeft))
            end
            return {
                ok = false,
                reason = 'locked',
                secondsLeft = secLeft
            }
        end
    end
    -- ▲ ▲

    local a = MySQL.query.await("SELECT tier, current_price, base_bid, status FROM auctions WHERE id = ?", {id})
    if not (a and a[1]) then
        return {
            ok = false
        }
    end
    local row = a[1]
    if row.status ~= 'open' and row.status ~= 'final' then
        return {
            ok = false,
            reason = 'phase'
        }
    end

    local minInc = (Config.MinBid and Config.MinBid[row.tier]) or 1
    if amount < minInc then
        return {
            ok = false,
            reason = 'min'
        }
    end

    -- ▼ Double-bid hack: hedefse teklif miktarını çarp (tek seferlik) ▼
    -- id string gelir; hedefler tonumber ile yazıldığı için tonumber ile oku
    local doubled = false
    amount, doubled = ConsumeDoubleBid(tonumber(id) or id, cid, amount)
    if Config.Debug then
        print(('[hack] placeBid id=%s cid=%s amount=%d doubled=%s'):format(tostring(id), cid, amount, tostring(doubled)))
    end
    -- ▲ ▲

    -- para kontrol + düş (amount artık 2x olabilir) — TEK BLOK
    if (player.PlayerData.money.bank or 0) < amount then
        return {
            ok = false,
            reason = 'money'
        }
    end
    player.Functions.RemoveMoney('bank', amount, 'auction-bid')

    -- isim + güncel fiyat
    local name = ('%s %s'):format(player.PlayerData.charinfo.firstname, player.PlayerData.charinfo.lastname)
    local cur = (row.current_price and row.current_price > 0) and row.current_price or row.base_bid
    local newPrice = cur + amount

    MySQL.update.await("UPDATE auctions SET current_price = ? WHERE id = ?", {newPrice, id})
    local bidId = MySQL.insert.await(
        "INSERT INTO auction_bids (auction_id, citizenid, bidder_name, amount, hidden, is_final) VALUES (?, ?, ?, ?, ?, ?)",
        {id, cid, name, amount, hidden and 1 or 0, (row.status == 'final') and 1 or 0})

    -- kartlar (herkes)
    NotifyViewers('stats', {
        id = tostring(id),
        bid = newPrice
    })

    -- son 5 bid listesi: final değilse ve bidder hariç
    if row.status ~= 'final' then
        NotifyViewers('auctionBid', {
            id = tostring(id),
            entry = {
                id = tostring(bidId),
                player = name,
                amount = amount,
                hidden = hidden,
                doubled = doubled
            }
        }, src)
    end

    -- remove this on prod
    if Config.Debug and TestSim and TestSim.onRealBid then
        TestSim.onRealBid(id)
    end

    return {
        ok = true,
        price = newPrice,
        doubled = doubled
    }
end)

lib.callback.register('teke_auction:getBids', function(_, data)
    local id = data and data.id
    if not id then
        return {}
    end
    local rows = MySQL.query.await(
        "SELECT id, bidder_name, amount, hidden FROM auction_bids WHERE auction_id = ? ORDER BY id DESC LIMIT 5", {id})
    local out = {}
    for _, r in ipairs(rows or {}) do
        out[#out + 1] = {
            id = tostring(r.id),
            player = r.bidder_name,
            amount = r.amount,
            hidden = (r.hidden == 1)
        }
    end
    return out
end)
