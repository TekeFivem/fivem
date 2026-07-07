Payouts = {}

function Payouts.nameOf(cid)
  local p = exports.qbx_core:GetPlayerByCitizenId(cid)
  if p then
    return ('%s %s'):format(p.PlayerData.charinfo.firstname, p.PlayerData.charinfo.lastname)
  end
  local r = MySQL.query.await("SELECT charinfo FROM players WHERE citizenid = ?", { cid })
  if r and r[1] and r[1].charinfo then
    local ci = json.decode(r[1].charinfo)
    if ci then return ('%s %s'):format(ci.firstname or '?', ci.lastname or '') end
  end
  return 'Bilinmiyor'
end

function Payouts.refund(cid, amount, reason)
  amount = tonumber(amount) or 0           
  if amount <= 0 then return end
  local p = exports.qbx_core:GetPlayerByCitizenId(cid)
  if p then
    p.Functions.AddMoney('bank', amount, reason or 'auction-refund')
  else
    MySQL.insert.await("INSERT INTO pending_payouts (citizenid, amount, reason) VALUES (?, ?, ?)", { cid, amount, reason or 'auction-refund' })
  end
end

-- girişte bekleyen iadeleri öde
local function flush(src, cid)
  local rows = MySQL.query.await("SELECT SUM(amount) AS total FROM pending_payouts WHERE citizenid = ?", { cid })
  local total = tonumber(rows and rows[1] and rows[1].total) or 0   -- ✅
  if total <= 0 then return end
  local p = exports.qbx_core:GetPlayer(src)
  if not p then return end
  p.Functions.AddMoney('bank', total, 'auction-refund')
  MySQL.query.await("DELETE FROM pending_payouts WHERE citizenid = ?", { cid })
end

AddEventHandler('QBCore:Server:PlayerLoaded', function(player)
  flush(player.PlayerData.source, player.PlayerData.citizenid)
end)