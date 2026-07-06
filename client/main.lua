local isOpen = false

local function openTablet()
  if isOpen then return end
  isOpen = true
  SetNuiFocus(true, true)
  SendNUIMessage({ action = 'setVisible', data = true })
end

local function closeTablet()
  if not isOpen then return end
  isOpen = false
  SetNuiFocus(false, false)
  SendNUIMessage({ action = 'setVisible', data = false })
end

-- Server: tablet item kullanıldı
RegisterNetEvent('teke_auction:open', function()
  openTablet()
end)

-- NUI: kapat (ESC ya da X)
RegisterNUICallback('close', function(_, cb)
  closeTablet()
  cb(true)
end)

-- NUI: genel state isteği → server callback
RegisterNUICallback('getState', function(_, cb)
  local data = lib.callback.await('teke_auction:getState', false)
  cb(data or {})
end)

-- (Geliştirme için) test komutu
RegisterCommand('useTablet', function() openTablet() end, false)

RegisterNUICallback('getAuctions', function(data, cb)
  local list = (data and data.list) or 'ongoing'
  cb(lib.callback.await('teke_auction:getAuctions', false, list) or {})
end)

-- Karar A: girişte bir kez abone
-- Karar A: girişte bir kez abone (Qbox event'i güvenli)
RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function() TriggerServerEvent('teke_auction:subscribe') end)
CreateThread(function()
  Wait(1500)
  if LocalPlayer.state.isLoggedIn then TriggerServerEvent('teke_auction:subscribe') end
end)

-- Sunucudan güncel snapshot push'u
RegisterNetEvent('teke_auction:snapshot', function(d) SendNUIMessage({ action = 'auctionSnapshot', data = d }) end)

-- NUI çağrıları
RegisterNUICallback('getSnapshot', function(_, cb)
  cb(lib.callback.await('teke_auction:getSnapshot', false) or {})
end)
RegisterNUICallback('getRecent', function(data, cb)
  cb(lib.callback.await('teke_auction:getRecent', false, data) or { items = {}, total = 0 })
end)

-- Delta relay
RegisterNetEvent('teke_auction:stats',   function(d) SendNUIMessage({ action='auctionStats',  data=d }) end)
RegisterNetEvent('teke_auction:new',     function(d) SendNUIMessage({ action='auctionNew',    data=d }) end)
RegisterNetEvent('teke_auction:started', function(d) SendNUIMessage({ action='auctionOpen',   data=d }) end)
RegisterNetEvent('teke_auction:ended',   function(d) SendNUIMessage({ action='auctionEnded',  data=d }) end)