local isOpen = false
local vaultLocGen = 0
local vaultBlip = nil

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
    if not isOpen then return end
    isOpen = false
    clearVaultLoc()
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
-- Scratch Card (NUI → server)
RegisterNUICallback('getScratch', function(data, cb)
    cb(lib.callback.await('teke_auction:getScratch', false, data) or {})
end)
RegisterNUICallback('scratchOpen', function(data, cb)
    cb(lib.callback.await('teke_auction:scratchOpen', false, data) or {
        ok = false
    })
end)

RegisterNUICallback('getJoined', function(_, cb)
    cb(lib.callback.await('teke_auction:getJoined', false) or {})
end)

-- Chat (NUI → server)
RegisterNUICallback('getParticipants', function(data, cb)
    cb(lib.callback.await('teke_auction:getParticipants', false, data) or {})
end)
RegisterNUICallback('getChat', function(data, cb)
    cb(lib.callback.await('teke_auction:getChat', false, data) or {})
end)
RegisterNUICallback('sendChat', function(data, cb)
    cb(lib.callback.await('teke_auction:sendChat', false, data) or {
        ok = false
    })
end)

-- Server → client: yeni mesaj
RegisterNetEvent('teke_auction:chat', function(d)
    SendNUIMessage({
        action = 'auctionChat',
        data = d
    })
end)

-- Temizle (tablet içi; item'lar doğrudan envantere) — tablet AÇIK kalır (sonuç tablette gösterilir)
RegisterNUICallback('cleanBox', function(data, cb)
    cb(lib.callback.await('teke_auction:cleanBox', false, data) or {
        ok = false
    })
end)

-- Vault: sigorta / güvenlik / uzatma / sisteme satış
RegisterNUICallback('vaultInsure', function(data, cb)
    cb(lib.callback.await('teke_auction:vaultInsure', false, data) or {
        ok = false
    })
end)
RegisterNUICallback('vaultSecure', function(data, cb)
    cb(lib.callback.await('teke_auction:vaultSecure', false, data) or {
        ok = false
    })
end)
RegisterNUICallback('vaultExtend', function(data, cb)
    cb(lib.callback.await('teke_auction:vaultExtend', false, data) or {
        ok = false
    })
end)
RegisterNUICallback('vaultSellSystem', function(data, cb)
    cb(lib.callback.await('teke_auction:vaultSellSystem', false, data) or {
        ok = false
    })
end)

-- Vault: oyuncuya sat (konumda devir teklifi)
RegisterNUICallback('vaultSellPlayer', function(data, cb)
    cb(lib.callback.await('teke_auction:vaultSellPlayer', false, data) or {
        ok = false
    })
end)

-- Alıcıya gelen devir teklifi → ox_lib onay
RegisterNetEvent('teke_auction:vaultOffer', function(d)
    local accepted = lib.alertDialog({
        header = 'Kutu Devri',
        content = ('**%s**, sana **%s** kutusunu **$%s** karşılığında devretmek istiyor. Kabul ediyor musun?'):format(
            d.seller or '?', d.name or ('#' .. tostring(d.boxId)), tostring(d.price)),
        centered = true,
        cancel = true
    })
    TriggerServerEvent('teke_auction:vaultOfferResponse', accepted == 'confirm')
end)

-- Devir sonrası vault listesini tazele
RegisterNetEvent('teke_auction:vaultRefresh', function()
    SendNUIMessage({
        action = 'vaultRefresh'
    })
end)

-- Basit sunucu bildirimi
RegisterNetEvent('teke_auction:vaultToast', function(d)
    lib.notify({
        type = (d and d.type) or 'inform',
        description = (d and d.msg) or ''
    })
end)

-- Reveal modalı verisi + tanımlama + gönder/çöp
RegisterNUICallback('getBoxLoot', function(data, cb)
    cb(lib.callback.await('teke_auction:getBoxLoot', false, data) or { items = {}, identifySeconds = 4 })
end)
RegisterNUICallback('identifyLoot', function(data, cb)
    cb(lib.callback.await('teke_auction:identifyLoot', false, data) or { ok = false })
end)
RegisterNUICallback('lootToTab', function(data, cb)
    cb(lib.callback.await('teke_auction:lootToTab', false, data) or { ok = false })
end)
RegisterNUICallback('lootTrash', function(data, cb)
    cb(lib.callback.await('teke_auction:lootTrash', false, data) or { ok = false })
end)

-- Loot tab (kalıcı liste)
RegisterNUICallback('getLoot', function(_, cb)
    cb(lib.callback.await('teke_auction:getLoot', false) or {})
end)
RegisterNetEvent('teke_auction:lootRefresh', function()
    SendNUIMessage({ action = 'lootRefresh' })
end)

RegisterNUICallback('vaultMarkLocation', function(data, cb)
    local loc = data and data.loc
    local id  = data and data.id
    if not loc or loc.x == nil then cb({ ok = false }); return end

    clearVaultLoc()
    local target = vec3(loc.x + 0.0, loc.y + 0.0, loc.z + 0.0)

    -- Harita: GPS rotası + kalıcı blip
    SetNewWaypoint(target.x, target.y)
    vaultBlip = AddBlipForCoord(target.x, target.y, target.z)
    SetBlipSprite(vaultBlip, 478)          -- kutu ikonu
    SetBlipColour(vaultBlip, 5)            -- sarı
    SetBlipScale(vaultBlip, 0.9)
    SetBlipAsShortRange(vaultBlip, false)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentSubstringPlayerName('Vault Kutusu')
    EndTextCommandSetBlipName(vaultBlip)

    vaultLocGen = vaultLocGen + 1
    local myGen  = vaultLocGen
    local radius = ((Config.Vault and Config.Vault.radius) or 3.0) + 2.0
    local wasAt  = nil

    CreateThread(function()
        while myGen == vaultLocGen do
            local ped    = PlayerPedId()
            local coords = GetEntityCoords(ped)
            local dist   = #(coords - target)
            local near   = dist <= 20.0

            if near then
                -- yerde nerede duracağını gösteren silindir marker
                DrawMarker(1, target.x, target.y, target.z - 0.98,
                    0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                    1.5, 1.5, 0.6,
                    60, 170, 255, 130,
                    false, true, 2, false, nil, nil, false)
            end

            local at = dist <= radius
            if at ~= wasAt then
                wasAt = at
                SendNUIMessage({ action = 'vaultAtLocation', data = { id = id, at = at } })
            end

            Wait(near and 0 or 500)   -- marker için near iken her frame, uzakta 500ms
        end
    end)

    cb({ ok = true })
end)


local function clearVaultLoc()
    vaultLocGen = vaultLocGen + 1        -- çalışan takip thread'ini durdur
    if vaultBlip then
        RemoveBlip(vaultBlip)
        vaultBlip = nil
    end
end