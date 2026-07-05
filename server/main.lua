-- ox_inventory: tablet item kullanımı
exports('useTablet', function(event, item, inventory)
  if event ~= 'usingItem' then return end
  TriggerClientEvent('teke_auction:open', inventory.id)
end)

-- Genel state (Faz 2'de auction listeleri de buradan gelecek)
lib.callback.register('teke_auction:getState', function(source)
  local player = exports.qbx_core:GetPlayer(source)
  if not player then return {} end
  local info = player.PlayerData.charinfo
  return {
    citizenid = player.PlayerData.citizenid,
    name = ('%s %s'):format(info.firstname, info.lastname),
    bank = player.PlayerData.money.bank,
    cash = player.PlayerData.money.cash,
  }
end)