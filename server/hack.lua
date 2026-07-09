DoubleBidTargets = DoubleBidTargets or {}
BidLocks = BidLocks or {}
FakeBidTargets = FakeBidTargets or {}
FrozenAuctions = FrozenAuctions or {}

local function akey(id)
    return tostring(id)
end -- ⚠️ anahtar HEP string
local function cfgCost()
    return (Config.Hack.cost and Config.Hack.cost.double) or 1000
end
local function cfgMult()
    return Config.Hack.multiplier or 2
end
local function lockCfg()
    return Config.Hack.lockBidder or {
        cost = 4000,
        duration = 30
    }
end
local function blindCfg()
    return Config.Hack.blindBidder or {
        cost = 3000,
        duration = 20
    }
end
local function revealCfg()
    return Config.Hack.revealHidden or {
        cost = 3500
    }
end
local function fakeCfg()
    return Config.Hack.fakeBid or {
        cost = 2500
    }
end
local function freezeCfg()
    return Config.Hack.freezePrice or {
        cost = 6000,
        duration = 15
    }
end

-- ortak: hedef online ise ona event gönder
local function notifyCid(cid, event, payload)
    local target = exports.qbx_core:GetPlayerByCitizenId(cid)
    if target then
        TriggerClientEvent(event, target.PlayerData.source, payload)
    end
end

-- ============================ DOUBLE BID ============================--
lib.callback.register('teke_auction:hackDoubleBid', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local id, tcid = data and data.auctionId, data and data.targetCid
    if not id or not tcid then
        return {
            ok = false,
            reason = 'args'
        }
    end

    local cost = cfgCost()
    if (player.PlayerData.money.bank or 0) < cost then
        return {
            ok = false,
            reason = 'money'
        }
    end
    player.Functions.RemoveMoney('bank', cost, 'auction-hack-doublebid')

    DoubleBidTargets[akey(id)] = DoubleBidTargets[akey(id)] or {}
    DoubleBidTargets[akey(id)][tcid] = {
        multiplier = cfgMult(),
        attacker = player.PlayerData.citizenid,
        expires = 0
    }
    return {
        ok = true,
        cost = cost
    }
end)

function ConsumeDoubleBid(auctionId, cid, amount)
    local bucket = DoubleBidTargets[akey(auctionId)]
    local t = bucket and bucket[cid]
    if not t then
        if Config.Debug then
            print(('[hack] hedef YOK  auction=%s cid=%s'):format(akey(auctionId), cid))
        end
        return amount, false
    end
    if t.expires ~= 0 and os.time() > t.expires then
        bucket[cid] = nil;
        return amount, false
    end
    bucket[cid] = nil
    local mult = t.multiplier or cfgMult()
    local newAmount = math.floor(amount * mult)
    if Config.Debug then
        print(('[hack] DOUBLE! cid=%s  %d x%d = %d'):format(cid, amount, mult, newAmount))
    end
    return newAmount, true
end

-- ============================ LOCK BIDDER ===========================--
function LockBidder(auctionId, cid, seconds)
    seconds = seconds or lockCfg().duration or 30
    BidLocks[akey(auctionId)] = BidLocks[akey(auctionId)] or {}
    BidLocks[akey(auctionId)][cid] = os.time() + seconds
    return seconds
end

function IsBidLocked(auctionId, cid)
    local bucket = BidLocks[akey(auctionId)]
    local exp = bucket and bucket[cid]
    if not exp then
        return false
    end
    if os.time() >= exp then
        bucket[cid] = nil;
        return false
    end
    return true, (exp - os.time())
end

lib.callback.register('teke_auction:hackLockBidder', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local id, tcid = data and data.auctionId, data and data.targetCid
    if not id or not tcid then
        return {
            ok = false,
            reason = 'args'
        }
    end

    local cfg = lockCfg()
    if (player.PlayerData.money.bank or 0) < cfg.cost then
        return {
            ok = false,
            reason = 'money'
        }
    end
    player.Functions.RemoveMoney('bank', cfg.cost, 'auction-hack-lockbidder')

    local seconds = LockBidder(id, tcid, cfg.duration)
    notifyCid(tcid, 'teke_auction:bidLocked', {
        id = tostring(id),
        secondsLeft = seconds
    })
    if Config.Debug then
        print(('[hack] LOCK target=%s auction=%s %ds'):format(tcid, tostring(id), seconds))
    end
    return {
        ok = true,
        cost = cfg.cost,
        secondsLeft = seconds
    }
end)

-- ============================ BLIND BIDDER =========================--
-- Hedef belirli süre yapılan teklifleri göremez (client görsel)
lib.callback.register('teke_auction:hackBlindBidder', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local id, tcid = data and data.auctionId, data and data.targetCid
    if not id or not tcid then
        return {
            ok = false,
            reason = 'args'
        }
    end

    local cfg = blindCfg()
    if (player.PlayerData.money.bank or 0) < cfg.cost then
        return {
            ok = false,
            reason = 'money'
        }
    end
    player.Functions.RemoveMoney('bank', cfg.cost, 'auction-hack-blind')

    notifyCid(tcid, 'teke_auction:bidBlinded', {
        id = tostring(id),
        secondsLeft = cfg.duration
    })
    if Config.Debug then
        print(('[hack] BLIND target=%s auction=%s %ds'):format(tcid, tostring(id), cfg.duration))
    end
    return {
        ok = true,
        cost = cfg.cost,
        secondsLeft = cfg.duration
    }
end)

-- ============================ REVEAL HIDDEN ========================--
-- Bir gizli teklifin gerçek sahibini öğren (saldırgana döner)
lib.callback.register('teke_auction:hackRevealHidden', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local id = data and data.auctionId
    local bidId = data and data.bidId
    local tcid = data and data.targetCid
    if not id then
        return {
            ok = false,
            reason = 'args'
        }
    end

    local row
    if bidId then
        row = MySQL.query.await(
            "SELECT bidder_name, citizenid FROM auction_bids WHERE id = ? AND auction_id = ? LIMIT 1", {bidId, id})
    elseif tcid then
        row = MySQL.query.await(
            "SELECT bidder_name, citizenid FROM auction_bids WHERE citizenid = ? AND auction_id = ? ORDER BY id DESC LIMIT 1",
            {tcid, id})
    end
    if not (row and row[1]) then
        return {
            ok = false,
            reason = 'notfound'
        }
    end

    local cfg = revealCfg()
    if (player.PlayerData.money.bank or 0) < cfg.cost then
        return {
            ok = false,
            reason = 'money'
        }
    end
    player.Functions.RemoveMoney('bank', cfg.cost, 'auction-hack-reveal')

    local name = row[1].bidder_name
    TriggerClientEvent('teke_auction:hiddenRevealed', source, {
        id = tostring(id),
        bidId = bidId and tostring(bidId) or nil,
        name = name
    })
    if Config.Debug then
        print(('[hack] REVEAL auction=%s → %s'):format(tostring(id), name))
    end
    return {
        ok = true,
        cost = cfg.cost,
        name = name,
        citizenid = row[1].citizenid
    }
end)

-- ============================ FAKE BID =============================--
-- Oyuncunun bir sonraki teklifi sahte olur (para düşmez, kazanamaz) — tek seferlik
function SetFakeBid(auctionId, cid)
    FakeBidTargets[akey(auctionId)] = FakeBidTargets[akey(auctionId)] or {}
    FakeBidTargets[akey(auctionId)][cid] = true
end

function ConsumeFakeBid(auctionId, cid)
    local bucket = FakeBidTargets[akey(auctionId)]
    if bucket and bucket[cid] then
        bucket[cid] = nil
        if Config.Debug then
            print(('[hack] FAKE bid cid=%s auction=%s'):format(cid, akey(auctionId)))
        end
        return true
    end
    return false
end

lib.callback.register('teke_auction:hackFakeBid', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local id = data and data.auctionId
    if not id then
        return {
            ok = false,
            reason = 'args'
        }
    end
    local tcid = (data and data.targetCid) or player.PlayerData.citizenid -- hedef yoksa kendine (bluff)

    local cfg = fakeCfg()
    if (player.PlayerData.money.bank or 0) < cfg.cost then
        return {
            ok = false,
            reason = 'money'
        }
    end
    player.Functions.RemoveMoney('bank', cfg.cost, 'auction-hack-fakebid')

    SetFakeBid(id, tcid)
    notifyCid(tcid, 'teke_auction:fakeArmed', {
        id = tostring(id)
    })
    return {
        ok = true,
        cost = cfg.cost
    }
end)

-- ============================ FREEZE PRICE =========================--
function FreezeAuction(auctionId, seconds)
    seconds = seconds or freezeCfg().duration or 15
    FrozenAuctions[akey(auctionId)] = os.time() + seconds
    return seconds
end

function IsFrozen(auctionId)
    local exp = FrozenAuctions[akey(auctionId)]
    if not exp then
        return false
    end
    if os.time() >= exp then
        FrozenAuctions[akey(auctionId)] = nil;
        return false
    end
    return true, (exp - os.time())
end

lib.callback.register('teke_auction:hackFreezePrice', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local id = data and data.auctionId
    if not id then
        return {
            ok = false,
            reason = 'args'
        }
    end

    local cfg = freezeCfg()
    if (player.PlayerData.money.bank or 0) < cfg.cost then
        return {
            ok = false,
            reason = 'money'
        }
    end
    player.Functions.RemoveMoney('bank', cfg.cost, 'auction-hack-freeze')

    local seconds = FreezeAuction(id, cfg.duration)
    NotifyViewers('priceFrozen', {
        id = tostring(id),
        secondsLeft = seconds
    }) -- herkese ilan
    if Config.Debug then
        print(('[hack] FREEZE auction=%s %ds'):format(tostring(id), seconds))
    end
    return {
        ok = true,
        cost = cfg.cost,
        secondsLeft = seconds
    }
end)
