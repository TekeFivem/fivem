-- Aktif double-bid hedefleri: [auctionId][targetCid] = { multiplier, attacker, expires }
DoubleBidTargets = DoubleBidTargets or {}

lib.callback.register('teke_auction:hackDoubleBid', function(source, data)
  local player = exports.qbx_core:GetPlayer(source)
  if not player then return { ok = false, reason = 'noplayer' } end

  local auctionId = data and tonumber(data.auctionId)
  local targetCid = data and data.targetCid
  if not auctionId or not targetCid then return { ok = false, reason = 'args' } end

  local cfg = Config.Hack.doubleBid
  -- hack ücreti: hack yapanın bankasından
  if (player.PlayerData.money.bank or 0) < cfg.cost then
    return { ok = false, reason = 'money' }
  end
  player.Functions.RemoveMoney('bank', cfg.cost, 'auction-hack-doublebid')

  DoubleBidTargets[auctionId] = DoubleBidTargets[auctionId] or {}
  DoubleBidTargets[auctionId][targetCid] = {
    multiplier = cfg.multiplier,
    attacker   = player.PlayerData.citizenid,
    expires    = (cfg.duration and cfg.duration > 0) and (os.time() + cfg.duration) or 0,
  }
  return { ok = true, cost = cfg.cost }
end)

-- placeBid tarafından çağrılır: hedefse miktarı çarpar ve hedefi tüketir
function ConsumeDoubleBid(auctionId, cid, amount)
  local t = DoubleBidTargets[auctionId] and DoubleBidTargets[auctionId][cid]
  if not t then return amount, false end
  if t.expires ~= 0 and os.time() > t.expires then
    DoubleBidTargets[auctionId][cid] = nil
    return amount, false
  end
  DoubleBidTargets[auctionId][cid] = nil -- tek seferlik
  return math.floor(amount * (t.multiplier or 2)), true
end