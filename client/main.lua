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
RegisterCommand('auctiontablet', function() openTablet() end, false)