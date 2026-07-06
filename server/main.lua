-- ox_inventory tablet item
exports('useTablet', function(event, _, inventory)
  if event ~= 'usingItem' then return end
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
RegisterNetEvent('teke_auction:subscribe',   function() Viewers[source] = true end)
RegisterNetEvent('teke_auction:unsubscribe', function() Viewers[source] = nil end)
AddEventHandler('playerDropped', function() Viewers[source] = nil end)

function NotifyViewers(action, data)
  for src in pairs(Viewers) do
    TriggerClientEvent('teke_auction:' .. action, src, data)
  end
end