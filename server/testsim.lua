if not Config.Debug then
    return
end -- sadece debug modda

TestSim = {}

local BOT_NAMES = {'Mike_T', 'Kaan_99', 'Deniz', 'Aria', 'Berkay', 'Cem', 'Elif', 'Sarp'}
local rivals = {} -- auctionId -> senin bid'ine karşılık ver
local loops = {} -- auctionId -> periyodik bot

-- Fake bid (para DÜŞMEZ), fiyatı artırır + yayınlar
function TestSim.fakeBid(id, amount, hidden, name)
    local a = MySQL.query.await("SELECT tier, current_price, base_bid, status FROM auctions WHERE id = ?", {id})
    if not (a and a[1]) then
        return
    end
    local row = a[1]
    if row.status ~= 'open' and row.status ~= 'final' then
        return
    end

    name = name or BOT_NAMES[math.random(#BOT_NAMES)]
    amount = amount or ((Config.MinBid[row.tier] or 150) * math.random(1, 4))
    local cur = (row.current_price and row.current_price > 0) and row.current_price or row.base_bid
    local newPrice = cur + amount

    MySQL.update.await("UPDATE auctions SET current_price = ? WHERE id = ?", {newPrice, id})
    local bidId = MySQL.insert.await(
        "INSERT INTO auction_bids (auction_id, citizenid, bidder_name, amount, hidden, is_final) VALUES (?, ?, ?, ?, ?, ?)",
        {id, 'BOT_' .. name, name, amount, hidden and 1 or 0, (row.status == 'final') and 1 or 0})

    NotifyViewers('stats', {
        id = tostring(id),
        bid = newPrice
    })
    if row.status ~= 'final' then
        NotifyViewers('auctionBid', {
            id = tostring(id),
            entry = {
                id = tostring(bidId),
                player = name,
                amount = amount,
                hidden = hidden or false
            }
        })
    end
    print(('[sim] bot %s +%d$ → #%d = %d$'):format(name, amount, id, newPrice))
end

-- Gerçek oyuncu bid verince (placeBid sonunda) çağrılır
function TestSim.onRealBid(id)
    if not rivals[id] then
        return
    end
    SetTimeout(math.random(1500, 3500), function()
        TestSim.fakeBid(id)
    end)
end

-- ---- KOMUTLAR ----

-- Aktif auctionları id'leriyle listele
lib.addCommand('simlist', {
    help = 'Aktif auctionları listele'
}, function()
    local rows = MySQL.query.await(
        "SELECT id, name, tier, status, current_price FROM auctions WHERE status IN ('upcoming','open','final') ORDER BY id")
    for _, r in ipairs(rows or {}) do
        print(('[sim] #%d  %s  %s  %s  %d$'):format(r.id, r.name, r.tier, r.status, r.current_price))
    end
end)

-- Tek fake bid
lib.addCommand('simbid', {
    help = 'Fake bid',
    params = {{
        name = 'id',
        type = 'number'
    }, {
        name = 'amount',
        type = 'number',
        optional = true
    }}
}, function(_, args)
    TestSim.fakeBid(args.id, args.amount)
end)

-- Rakip bot aç/kapat: sen bid verince ~2-3 sn sonra karşılık verir
lib.addCommand('simrival', {
    help = 'Rakip bot aç/kapat',
    params = {{
        name = 'id',
        type = 'number'
    }}
}, function(_, args)
    rivals[args.id] = not rivals[args.id]
    print(('[sim] rival #%d = %s'):format(args.id, tostring(rivals[args.id])))
end)

-- Periyodik bot: her N sn otomatik bid
lib.addCommand('simstart', {
    help = 'Otomatik bot bid',
    params = {{
        name = 'id',
        type = 'number'
    }, {
        name = 'sec',
        type = 'number',
        optional = true
    }}
}, function(_, args)
    local id, sec = args.id, (args.sec or 4)
    loops[id] = true
    CreateThread(function()
        while loops[id] do
            TestSim.fakeBid(id)
            Wait(sec * 1000)
        end
    end)
    print(('[sim] loop #%d her %d sn'):format(id, sec))
end)
lib.addCommand('simstop', {
    help = 'Botu durdur',
    params = {{
        name = 'id',
        type = 'number'
    }}
}, function(_, args)
    loops[args.id] = nil
    print(('[sim] loop #%d durdu'):format(args.id))
end)

-- Fake katılımcı ekle (participant tabelasını şişir)
lib.addCommand('simjoin', {
    help = 'Fake katılımcı',
    params = {{
        name = 'id',
        type = 'number'
    }, {
        name = 'count',
        type = 'number',
        optional = true
    }}
}, function(_, args)
    local id, n = args.id, (args.count or 1)
    for _ = 1, n do
        MySQL.insert.await('INSERT IGNORE INTO auction_participants (auction_id, citizenid) VALUES (?, ?)',
            {id, 'BOT_' .. math.random(100000, 999999)})
    end
    local c = MySQL.query.await('SELECT COUNT(*) AS c FROM auction_participants WHERE auction_id = ?', {id})
    NotifyViewers('stats', {
        id = tostring(id),
        participants = (c and c[1] and c[1].c) or 0
    })
end)

-- Süreyi kısalt: bitişe X sn kala ayarla (final/settle testine hızlı ulaş)
lib.addCommand('simfast', {
    help = 'Bitişe X sn kala',
    params = {{
        name = 'id',
        type = 'number'
    }, {
        name = 'sec',
        type = 'number',
        optional = true
    }}
}, function(_, args)
    local sec = args.sec or 15
    MySQL.update.await("UPDATE auctions SET end_time = ? WHERE id = ?", {os.time() + sec, args.id})
    local item = Db.GetOne(args.id)
    if item then
        NotifyViewers('stats', {
            id = tostring(args.id),
            endTime = item.endTime
        })
    end -- ✅ canlı ilet
    print(('[sim] #%d bitişe %d sn'):format(args.id, sec))
end)

-- Toplu auction üret
lib.addCommand('simfill', {
    help = 'N auction üret',
    params = {{
        name = 'count',
        type = 'number',
        optional = true
    }}
}, function(_, args)
    local KINDS, TIERS = {'storage', 'container', 'itembox'}, {'bronze', 'silver', 'gold'}
    for _ = 1, (args.count or 5) do
        local kind, tier = KINDS[math.random(3)], TIERS[math.random(3)]
        local id = Db.CreateAuction({
            kind = kind,
            name = (kind:upper():sub(1, 3)) .. '-' .. math.random(10, 99),
            tier = tier,
            base_bid = Config.Tiers[tier].base,
            duration = math.random(300, 8 * 3600)
        })
        local item = Db.GetOne(id)
        if item then
            NotifyViewers('new', {
                list = 'ongoing',
                item = item
            })
        end
    end
end)

-- Tüm auction verisini temizle (temiz başlangıç)
lib.addCommand('simclear', {
    help = 'Auction verilerini temizle'
}, function()
    MySQL.query.await('DELETE FROM auction_bids')
    MySQL.query.await('DELETE FROM auction_participants')
    MySQL.query.await('DELETE FROM auctions')
    print('[sim] auction verileri temizlendi')
end)

-- /hackme <auctionId>  → kendini double-bid hedefi yap, sonra normal teklif ver → 2x düşer
RegisterCommand('hackme', function(source, args)
    local id = args[1] -- string kalsın! tonumber yok
    if not id then
        print('kullanım: /hackme <auctionId>');
        return
    end
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return
    end
    local cid = player.PlayerData.citizenid
    DoubleBidTargets[tostring(id)] = DoubleBidTargets[tostring(id)] or {}
    DoubleBidTargets[tostring(id)][cid] = {
        multiplier = (Config.Hack.multiplier or 2),
        attacker = 'TEST',
        expires = 0
    }
    print(('[hacktest] %s auction #%s için double-bid hedefi (test)'):format(cid, tostring(id)))
end, false)

-- /lockme <auctionId> [sn] → kendini test için bid-kilitli yap
RegisterCommand('lockme', function(source, args)
    local auctionId = tonumber(args[1])
    if not auctionId then
        print('kullanım: /lockme <auctionId> [saniye]');
        return
    end
    local sec = tonumber(args[2]) or (Config.Hack.lockBidder and Config.Hack.lockBidder.duration) or 30
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return
    end
    local cid = player.PlayerData.citizenid
    LockBidder(auctionId, cid, sec)
    TriggerClientEvent('teke_auction:bidLocked', source, {
        id = tostring(auctionId),
        secondsLeft = sec
    })
    print(('[hacktest] %s auction #%d %d sn bid-kilitli'):format(cid, auctionId, sec))
end, false)

-- /blindme <auctionId> [sn] → kendini süreli "kör" yap
RegisterCommand('blindme', function(source, args)
    local id = args[1];
    if not id then
        print('kullanım: /blindme <auctionId> [sn]');
        return
    end
    local sec = tonumber(args[2]) or (Config.Hack.blindBidder and Config.Hack.blindBidder.duration) or 20
    TriggerClientEvent('teke_auction:bidBlinded', source, {
        id = tostring(id),
        secondsLeft = sec
    })
    print(('[hacktest] blind #%s %ds'):format(tostring(id), sec))
end, false)

-- /freezeme <auctionId> [sn] → fiyatı süreli dondur (herkese)
RegisterCommand('freezeme', function(source, args)
    local id = args[1];
    if not id then
        print('kullanım: /freezeme <auctionId> [sn]');
        return
    end
    local sec = tonumber(args[2]) or (Config.Hack.freezePrice and Config.Hack.freezePrice.duration) or 15
    FreezeAuction(id, sec)
    NotifyViewers('priceFrozen', {
        id = tostring(id),
        secondsLeft = sec
    })
    print(('[hacktest] freeze #%s %ds'):format(tostring(id), sec))
end, false)

-- /fakeme <auctionId> → sıradaki teklifin sahte olur
RegisterCommand('fakeme', function(source, args)
    local id = args[1];
    if not id then
        print('kullanım: /fakeme <auctionId>');
        return
    end
    local player = exports.qbx_core:GetPlayer(source);
    if not player then
        return
    end
    SetFakeBid(id, player.PlayerData.citizenid)
    TriggerClientEvent('teke_auction:fakeArmed', source, {
        id = tostring(id)
    })
    print(('[hacktest] fake armed #%s'):format(tostring(id)))
end, false)

-- /revealme <auctionId> → o auction'daki SON gizli teklifin sahibini öğren
RegisterCommand('revealme', function(source, args)
    local id = args[1];
    if not id then
        print('kullanım: /revealme <auctionId>');
        return
    end
    local row = MySQL.query.await(
        "SELECT bidder_name FROM auction_bids WHERE auction_id = ? AND hidden = 1 ORDER BY id DESC LIMIT 1", {id})
    if not (row and row[1]) then
        print('[hacktest] gizli teklif yok');
        return
    end
    TriggerClientEvent('teke_auction:hiddenRevealed', source, {
        id = tostring(id),
        name = row[1].bidder_name
    })
    print(('[hacktest] reveal #%s → %s'):format(tostring(id), row[1].bidder_name))
end, false)
