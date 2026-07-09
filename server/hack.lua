DoubleBidTargets = DoubleBidTargets or {}
BidLocks = BidLocks or {}

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

-- ============================ DOUBLE BID ============================--
lib.callback.register('teke_auction:hackDoubleBid', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local id = data and data.auctionId
    local tcid = data and data.targetCid
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
-- Hedefi belirli süre teklif veremez yapar
function LockBidder(auctionId, cid, seconds)
    seconds = seconds or lockCfg().duration or 30
    BidLocks[akey(auctionId)] = BidLocks[akey(auctionId)] or {}
    BidLocks[akey(auctionId)][cid] = os.time() + seconds
    return seconds
end

-- placeBid tarafından çağrılır → (kilitli_mi, kalan_saniye)
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
    local id = data and data.auctionId
    local tcid = data and data.targetCid
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

    -- hedef online ise anında bildir → UI kilitlensin
    local target = exports.qbx_core:GetPlayerByCitizenId(tcid)
    if target then
        TriggerClientEvent('teke_auction:bidLocked', target.PlayerData.source, {
            id = tostring(id),
            secondsLeft = seconds
        })
    end
    if Config.Debug then
        print(('[hack] LOCK attacker=%s target=%s auction=%s %ds'):format(player.PlayerData.citizenid, tcid,
            tostring(id), seconds))
    end
    return {
        ok = true,
        cost = cfg.cost,
        secondsLeft = seconds
    }
end)
