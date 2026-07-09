local isOpen = false

local function openTablet()
    if isOpen then
        return
    end
    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'setVisible',
        data = true
    })
end

local function closeTablet()
    if not isOpen then
        return
    end
    isOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = 'setVisible',
        data = false
    })
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
RegisterCommand('useTablet', function()
    openTablet()
end, false)

RegisterNUICallback('getAuctions', function(data, cb)
    local list = (data and data.list) or 'ongoing'
    cb(lib.callback.await('teke_auction:getAuctions', false, list) or {})
end)

-- Karar A: girişte bir kez abone
-- Karar A: girişte bir kez abone (Qbox event'i güvenli)
RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    TriggerServerEvent('teke_auction:subscribe')
end)
CreateThread(function()
    Wait(1500)
    if LocalPlayer.state.isLoggedIn then
        TriggerServerEvent('teke_auction:subscribe')
    end
end)

-- Sunucudan güncel snapshot push'u
RegisterNetEvent('teke_auction:snapshot', function(d)
    SendNUIMessage({
        action = 'auctionSnapshot',
        data = d
    })
end)

-- NUI çağrıları
RegisterNUICallback('getSnapshot', function(_, cb)
    cb(lib.callback.await('teke_auction:getSnapshot', false) or {})
end)
RegisterNUICallback('getRecent', function(data, cb)
    cb(lib.callback.await('teke_auction:getRecent', false, data) or {
        items = {},
        total = 0
    })
end)

-- Delta relay
RegisterNetEvent('teke_auction:stats', function(d)
    SendNUIMessage({
        action = 'auctionStats',
        data = d
    })
end)
RegisterNetEvent('teke_auction:new', function(d)
    SendNUIMessage({
        action = 'auctionNew',
        data = d
    })
end)
RegisterNetEvent('teke_auction:started', function(d)
    SendNUIMessage({
        action = 'auctionOpen',
        data = d
    })
end)
RegisterNetEvent('teke_auction:ended', function(d)
    SendNUIMessage({
        action = 'auctionEnded',
        data = d
    })
end)

RegisterNUICallback('joinAuction', function(data, cb)
    cb(lib.callback.await('teke_auction:joinAuction', false, data))
end)

RegisterNUICallback('placeBid', function(data, cb)
    cb(lib.callback.await('teke_auction:placeBid', false, data))
end)
RegisterNUICallback('getBids', function(data, cb)
    cb(lib.callback.await('teke_auction:getBids', false, data) or {})
end)
RegisterNetEvent('teke_auction:auctionBid', function(d)
    SendNUIMessage({
        action = 'auctionBid',
        data = d
    })
end)

RegisterNetEvent('teke_auction:won', function(d)
    SendNUIMessage({
        action = 'auctionWon',
        data = d
    })
end)

-- Vault listesi
RegisterNUICallback('getVault', function(_, cb)
    cb(lib.callback.await('teke_auction:getVault', false) or {})
end)

-- Kutuyu aç (stash) — başarılıysa tablet kapanır, ox_inventory açılır
RegisterNUICallback('openBox', function(data, cb)
    local res = lib.callback.await('teke_auction:openBox', false, data)
    if res and res.ok then
        closeTablet() -- stash açılırken tablet arayüzü kapansın
    end
    cb(res or {
        ok = false
    })
end)

-- Kutu tamamen boşaldı → NUI'ya bildir (liste güncellensin)
RegisterNetEvent('teke_auction:vaultBoxOpened', function(d)
    SendNUIMessage({
        action = 'vaultBoxOpened',
        data = d
    })
end)

RegisterNUICallback('hackDoubleBid', function(data, cb)
    cb(lib.callback.await('teke_auction:hackDoubleBid', false, data) or {
        ok = false
    })
end)

-- Lock Bidder hack tetikleyici (NUI → server)
RegisterNUICallback('hackLockBidder', function(data, cb)
    cb(lib.callback.await('teke_auction:hackLockBidder', false, data) or {
        ok = false
    })
end)

-- Server → hedefe: teklifin kilitlendi
RegisterNetEvent('teke_auction:bidLocked', function(d)
    SendNUIMessage({
        action = 'bidLocked',
        data = d
    })
end)

-- Yeni hack tetikleyicileri (NUI → server)
RegisterNUICallback('hackBlindBidder', function(data, cb)
    cb(lib.callback.await('teke_auction:hackBlindBidder', false, data) or {
        ok = false
    })
end)
RegisterNUICallback('hackRevealHidden', function(data, cb)
    cb(lib.callback.await('teke_auction:hackRevealHidden', false, data) or {
        ok = false
    })
end)
RegisterNUICallback('hackFakeBid', function(data, cb)
    cb(lib.callback.await('teke_auction:hackFakeBid', false, data) or {
        ok = false
    })
end)
RegisterNUICallback('hackFreezePrice', function(data, cb)
    cb(lib.callback.await('teke_auction:hackFreezePrice', false, data) or {
        ok = false
    })
end)

-- Server → client bildirimleri
RegisterNetEvent('teke_auction:bidBlinded', function(d)
    SendNUIMessage({
        action = 'bidBlinded',
        data = d
    })
end)
RegisterNetEvent('teke_auction:priceFrozen', function(d)
    SendNUIMessage({
        action = 'priceFrozen',
        data = d
    })
end)
RegisterNetEvent('teke_auction:hiddenRevealed', function(d)
    SendNUIMessage({
        action = 'hiddenRevealed',
        data = d
    })
end)
RegisterNetEvent('teke_auction:fakeArmed', function(d)
    SendNUIMessage({
        action = 'fakeArmed',
        data = d
    })
end)
