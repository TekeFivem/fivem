DoubleBidTargets = DoubleBidTargets or {}

local function akey(id) return tostring(id) end                  -- ⚠️ anahtar HEP string
local function cfgCost() return (Config.Hack.cost and Config.Hack.cost.double) or 1000 end
local function cfgMult() return Config.Hack.multiplier or 2 end

lib.callback.register('teke_auction:hackDoubleBid', function(source, data)
  local player = exports.qbx_core:GetPlayer(source)
  if not player then return { ok = false, reason = 'noplayer' } end
  local id   = data and data.auctionId
  local tcid = data and data.targetCid
  if not id or not tcid then return { ok = false, reason = 'args' } end

  local cost = cfgCost()
  if (player.PlayerData.money.bank or 0) < cost then return { ok = false, reason = 'money' } end
  player.Functions.RemoveMoney('bank', cost, 'auction-hack-doublebid')

  DoubleBidTargets[akey(id)] = DoubleBidTargets[akey(id)] or {}
  DoubleBidTargets[akey(id)][tcid] = { multiplier = cfgMult(), attacker = player.PlayerData.citizenid, expires = 0 }
  return { ok = true, cost = cost }
end)

-- placeBid tarafından çağrılır
function ConsumeDoubleBid(auctionId, cid, amount)
  local bucket = DoubleBidTargets[akey(auctionId)]
  local t = bucket and bucket[cid]
  if not t then
    if Config.Debug then print(('[hack] hedef YOK  auction=%s cid=%s'):format(akey(auctionId), cid)) end
    return amount, false
  end
  if t.expires ~= 0 and os.time() > t.expires then bucket[cid] = nil; return amount, false end
  bucket[cid] = nil                                              -- tek seferlik
  local mult = t.multiplier or cfgMult()
  local newAmount = math.floor(amount * mult)
  if Config.Debug then print(('[hack] DOUBLE! cid=%s  %d x%d = %d'):format(cid, amount, mult, newAmount)) end
  return newAmount, true
end