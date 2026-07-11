Vault = Vault or {}

local VC = Config.Vault
local function vmoney(n)
    return math.floor((n or 0) + 0.5)
end
local function vacc()
    return VC.account or 'bank'
end
local function truthy(v)
    return v == 1 or v == true or v == '1'
end

local PREFIX = {
    storage = 'STR',
    container = 'CNT',
    itembox = 'TMB'
}

local function boxLocation(row)
    if row.loc_x == nil then
        return nil
    end
    return vec3(row.loc_x + 0.0, row.loc_y + 0.0, row.loc_z + 0.0)
end
local function nearBox(src, loc)
    if not loc then
        return false
    end
    local ped = GetPlayerPed(src)
    if not ped or ped == 0 then
        return false
    end
    return #(GetEntityCoords(ped) - loc) <= (VC.radius + 2.0)
end
local function playersNear(a, b, radius)
    local pa, pb = GetPlayerPed(a), GetPlayerPed(b)
    if not pa or pa == 0 or not pb or pb == 0 then
        return false
    end
    return #(GetEntityCoords(pa) - GetEntityCoords(pb)) <= radius
end
local function nearestPlayer(src, radius)
    local ped = GetPlayerPed(src)
    if not ped or ped == 0 then
        return nil
    end
    local origin = GetEntityCoords(ped)
    local best, bestDist
    for _, pid in ipairs(GetPlayers()) do
        local sid = tonumber(pid)
        if sid and sid ~= src then
            local tped = GetPlayerPed(sid)
            if tped and tped ~= 0 then
                local d = #(origin - GetEntityCoords(tped))
                if d <= radius and (not bestDist or d < bestDist) then
                    best, bestDist = sid, d
                end
            end
        end
    end
    return best
end

local function uiSecurity(s)
    return (s == 'unprotected') and 'none' or s
end

local function labelOf(name)
    local ok, def = pcall(function()
        return exports.ox_inventory:Items(name)
    end)
    if ok and def and def.label then
        return def.label
    end
    return name
end

local function ownedOpenBox(cid, boxId)
    local row = MySQL.query.await([[
    SELECT id, name, est_value, security, end_time, opened
    FROM vault_boxes WHERE id = ? AND owner_id = ? AND opened = 0
  ]], {boxId, cid})
    return row and row[1]
end

-- ===== Loot seviyesi üretimi =====
local LV = {'low', 'mid', 'high'}
local function rollLevel(w)
    local r, acc = math.random(), 0
    for _, k in ipairs(LV) do
        acc = acc + (w[k] or 0)
        if r <= acc then
            return k
        end
    end
    return 'mid'
end
local function genLevels(tier)
    local bias = (Config.LootGen.tierBias or {})[tier] or Config.LootGen.neutral
    local neu = Config.LootGen.neutral
    return {
        value = rollLevel(bias),
        rarity = rollLevel(bias),
        clean = rollLevel(neu),
        repair = rollLevel(neu),
        authentic = rollLevel(neu),
        demand = rollLevel(neu),
        legal = rollLevel(neu)
    }
end
-- DB satırı → frontend LootItem
local function lootObj(r)
    return {
        id = tostring(r.id),
        item = r.item,
        count = r.cnt,
        name = labelOf(r.item),
        image = ('nui://ox_inventory/web/images/%s.png'):format(r.item),
        inspected = true,
        identified = true,
        levels = json.decode(r.levels_json)
    }
end

local function markDoneIfEmpty(src, cid, boxId)
  if not boxId then return end
  local left = MySQL.scalar.await(
    'SELECT COUNT(*) FROM vault_box_loot WHERE box_id = ? AND owner_id = ?', { boxId, cid }) or 0
  if left == 0 then
    MySQL.update.await('UPDATE vault_boxes SET done = 1 WHERE id = ? AND owner_id = ?', { boxId, cid })
    TriggerClientEvent('teke_auction:vaultRefresh', src)   -- kart canlı 'cleaned' olur
  end
end

-- ===== Vault listesi =====
lib.callback.register('teke_auction:getVault', function(source)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {}
    end
    local cid = player.PlayerData.citizenid
    local rows = MySQL.query.await([[
    SELECT b.id, b.name, b.kind, b.tier, b.est_value, b.security, b.end_time,
           b.opened, b.done, b.loc_x, b.loc_y, b.loc_z,
           COUNT(bl.id) AS pending
    FROM vault_boxes b
    LEFT JOIN vault_box_loot bl ON bl.box_id = b.id AND bl.owner_id = b.owner_id
    WHERE b.owner_id = ?
    GROUP BY b.id
    ORDER BY b.done ASC, b.end_time ASC
    LIMIT 20
  ]], {cid})
    local out = {}
    for _, r in ipairs(rows or {}) do
        local pending = tonumber(r.pending) or 0
        local cleaned = truthy(r.done) -- tüm loot işlendi mi
        local remaining = math.max(0, r.end_time - os.time())
        out[#out + 1] = {
            id = tostring(r.id),
            kind = r.kind,
            tier = r.tier,
            name = r.name or ((PREFIX[r.kind] or 'BOX') .. '-' .. r.id),
            estValue = r.est_value,
            bid = r.est_value,
            security = uiSecurity(r.security),
            endTime = os.date('!%H:%M:%S', remaining), -- gerçek geri sayım (expired için gerekli)
            participants = 0,
            cleaned = cleaned,
            opened = truthy(r.opened),
            pending = pending,
            loc = (r.loc_x ~= nil) and {
                x = r.loc_x,
                y = r.loc_y,
                z = r.loc_z
            } or nil
        }
    end
    return out
end)

-- ===== TEMİZLE: kutu içeriğinden loot üret (envantere GİTMEZ, reveal modalına gider) =====
-- data = { id, method = 'self'|'cleaner', tier? }
lib.callback.register('teke_auction:cleanBox', function(source, data)
    local src = source
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local cid = player.PlayerData.citizenid
    local boxId = tonumber(data and data.id)
    local method = (data and data.method) or 'self'
    local tier = data and data.tier
    if not boxId then
        return {
            ok = false,
            reason = 'badid'
        }
    end

    local row = MySQL.query.await([[
    SELECT id, tier, end_time, opened, contents_json, loc_x, loc_y, loc_z
    FROM vault_boxes WHERE id = ? AND owner_id = ? AND opened = 0
  ]], {boxId, cid})
    row = row and row[1]
    if not row then
        return {
            ok = false,
            reason = 'notfound'
        }
    end
    if row.end_time <= os.time() then
        return {
            ok = false,
            reason = 'expired'
        }
    end

    local cost, theft = 0, 0.0
    if method == 'cleaner' then
        local c = (VC.cleaners or {})[tier]
        if not c then
            return {
                ok = false,
                reason = 'badtier'
            }
        end
        cost, theft = c.price or 0, c.theft or 0
        if (player.PlayerData.money[vacc()] or 0) < cost then
            return {
                ok = false,
                reason = 'money',
                cost = cost
            }
        end
    else
        if not nearBox(src, boxLocation(row)) then
            return {
                ok = false,
                reason = 'toofar'
            }
        end
    end

    -- ATOMİK: kutuyu temizlenmiş işaretle (çift temizleme yok)
    local upd = MySQL.update.await(
        'UPDATE vault_boxes SET opened = 1, contents_json = NULL WHERE id = ? AND owner_id = ? AND opened = 0',
        {boxId, cid})
    if not upd or upd < 1 then
        return {
            ok = false,
            reason = 'notfound'
        }
    end

    if cost > 0 then
        player.Functions.RemoveMoney(vacc(), cost, 'vault-clean')
    end

    -- içerikten loot üret (temizlikçi çalabilir → o item hiç düşmez)
    local contents = row.contents_json and json.decode(row.contents_json) or {}
    local made = 0
    for _, it in ipairs(contents) do
        local item = it.item or it.name
        local cnt = tonumber(it.count or it.amount) or 1
        if item and cnt > 0 and not (theft > 0 and math.random() < theft) then
            MySQL.insert.await([[
        INSERT INTO vault_box_loot (box_id, owner_id, item, cnt, levels_json, identified)
        VALUES (?, ?, ?, ?, ?, 0)
      ]], {boxId, cid, item, cnt, json.encode(genLevels(row.tier))})
            made = made + 1
        end
    end
    -- hiç loot düşmediyse işlenecek bir şey yok → kutu tamamlandı
    if made == 0 then
        MySQL.update.await('UPDATE vault_boxes SET done = 1 WHERE id = ? AND owner_id = ?', {boxId, cid})
    end
    TriggerClientEvent('teke_auction:vaultBoxOpened', src, {
        id = tostring(boxId)
    })
    return {
        ok = true,
        boxId = tostring(boxId),
        made = made
    }
end)

-- Reveal modalı verisi (tanımsızlar gizli, tanımlılar tam)
lib.callback.register('teke_auction:getBoxLoot', function(source, data)
    local secs = (Config.LootGen and Config.LootGen.identifySeconds) or 4
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            items = {},
            identifySeconds = secs
        }
    end
    local cid = player.PlayerData.citizenid
    local boxId = tonumber(data and data.id)
    if not boxId then
        return {
            items = {},
            identifySeconds = secs
        }
    end
    local rows = MySQL.query.await(
        'SELECT id, item, cnt, levels_json, identified FROM vault_box_loot WHERE box_id = ? AND owner_id = ?',
        {boxId, cid})
    local items = {}
    for _, r in ipairs(rows or {}) do
        if truthy(r.identified) then
            items[#items + 1] = lootObj(r)
        else
            items[#items + 1] = {
                id = tostring(r.id),
                identified = false
            }
        end
    end
    return {
        items = items,
        identifySeconds = secs
    }
end)

-- Tek item tanımla (client progress bar süresini bekledikten sonra çağırır)
lib.callback.register('teke_auction:identifyLoot', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false
        }
    end
    local cid = player.PlayerData.citizenid
    local lid = tonumber(data and data.lid)
    if not lid then
        return {
            ok = false
        }
    end
    local rows = MySQL.query.await(
        'SELECT id, item, cnt, levels_json, identified FROM vault_box_loot WHERE id = ? AND owner_id = ?', {lid, cid})
    local r = rows and rows[1]
    if not r then
        return {
            ok = false
        }
    end
    if not truthy(r.identified) then
        MySQL.update.await('UPDATE vault_box_loot SET identified = 1 WHERE id = ? AND owner_id = ?', {lid, cid})
    end
    return {
        ok = true,
        item = lootObj(r)
    }
end)

-- Loot tab'a gönder (kalıcı) — sadece tanımlı item
lib.callback.register('teke_auction:lootToTab', function(source, data)
  local player = exports.qbx_core:GetPlayer(source)
  if not player then return { ok = false } end
  local cid = player.PlayerData.citizenid
  local lid = tonumber(data and data.lid)
  if not lid then return { ok = false } end
  local rows = MySQL.query.await(
    'SELECT id, box_id, item, cnt, levels_json, identified FROM vault_box_loot WHERE id = ? AND owner_id = ?', { lid, cid })
  local r = rows and rows[1]
  if not r or not truthy(r.identified) then return { ok = false, reason = 'notidentified' } end
  local newId = MySQL.insert.await(
    'INSERT INTO player_loot (owner_id, item, cnt, levels_json) VALUES (?, ?, ?, ?)',
    { cid, r.item, r.cnt, r.levels_json })
  MySQL.update.await('DELETE FROM vault_box_loot WHERE id = ? AND owner_id = ?', { lid, cid })
  markDoneIfEmpty(source, cid, r.box_id)
  TriggerClientEvent('teke_auction:lootRefresh', source)
  return { ok = true, id = tostring(newId) }
end)

-- Çöpe at
lib.callback.register('teke_auction:lootTrash', function(source, data)
  local player = exports.qbx_core:GetPlayer(source)
  if not player then return { ok = false } end
  local cid = player.PlayerData.citizenid
  local lid = tonumber(data and data.lid)
  if not lid then return { ok = false } end
  local rows = MySQL.query.await(
    'SELECT id, box_id FROM vault_box_loot WHERE id = ? AND owner_id = ?', { lid, cid })
  local r = rows and rows[1]
  if not r then return { ok = false } end
  MySQL.update.await('DELETE FROM vault_box_loot WHERE id = ? AND owner_id = ?', { lid, cid })
  markDoneIfEmpty(source, cid, r.box_id)
  return { ok = true }
end)

-- Loot tab listesi (kalıcı)
lib.callback.register('teke_auction:getLoot', function(source)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {}
    end
    local cid = player.PlayerData.citizenid
    local rows = MySQL.query.await(
        'SELECT id, item, cnt, levels_json FROM player_loot WHERE owner_id = ? ORDER BY id DESC', {cid})
    local out = {}
    for _, r in ipairs(rows or {}) do
        out[#out + 1] = lootObj(r)
    end
    return out
end)

-- ===== Sigorta / Güvenlik / Uzatma / Sisteme satış =====
lib.callback.register('teke_auction:vaultInsure', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local cid = player.PlayerData.citizenid
    local boxId = tonumber(data and data.id)
    if not boxId then
        return {
            ok = false,
            reason = 'badid'
        }
    end
    local row = ownedOpenBox(cid, boxId)
    if not row then
        return {
            ok = false,
            reason = 'notfound'
        }
    end
    if row.security ~= 'unprotected' then
        return {
            ok = false,
            reason = 'already'
        }
    end
    local cost = vmoney(row.est_value * (VC.insuranceRate or 0.15))
    if (player.PlayerData.money[vacc()] or 0) < cost then
        return {
            ok = false,
            reason = 'money',
            cost = cost
        }
    end
    player.Functions.RemoveMoney(vacc(), cost, 'vault-insurance')
    MySQL.update.await("UPDATE vault_boxes SET security = 'insured' WHERE id = ? AND owner_id = ?", {boxId, cid})
    return {
        ok = true,
        security = 'insured',
        paid = cost
    }
end)

lib.callback.register('teke_auction:vaultSecure', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local cid = player.PlayerData.citizenid
    local boxId = tonumber(data and data.id)
    if not boxId then
        return {
            ok = false,
            reason = 'badid'
        }
    end
    local row = ownedOpenBox(cid, boxId)
    if not row then
        return {
            ok = false,
            reason = 'notfound'
        }
    end
    if row.security == 'secured' then
        return {
            ok = false,
            reason = 'already'
        }
    end
    if row.security ~= 'insured' then
        return {
            ok = false,
            reason = 'needinsurance'
        }
    end
    local cost = vmoney(row.est_value * (VC.securityRate or 0.25))
    if (player.PlayerData.money[vacc()] or 0) < cost then
        return {
            ok = false,
            reason = 'money',
            cost = cost
        }
    end
    player.Functions.RemoveMoney(vacc(), cost, 'vault-security')
    MySQL.update.await("UPDATE vault_boxes SET security = 'secured' WHERE id = ? AND owner_id = ?", {boxId, cid})
    return {
        ok = true,
        security = 'secured',
        paid = cost
    }
end)

lib.callback.register('teke_auction:vaultExtend', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local cid = player.PlayerData.citizenid
    local boxId = tonumber(data and data.id)
    if not boxId then
        return {
            ok = false,
            reason = 'badid'
        }
    end
    local row = ownedOpenBox(cid, boxId)
    if not row then
        return {
            ok = false,
            reason = 'notfound'
        }
    end
    local cost = vmoney(row.est_value * (VC.extendRate or 0.05))
    if (player.PlayerData.money[vacc()] or 0) < cost then
        return {
            ok = false,
            reason = 'money',
            cost = cost
        }
    end
    player.Functions.RemoveMoney(vacc(), cost, 'vault-extend')
    local newEnd = math.max(row.end_time, os.time()) + (VC.extendHours or 6) * 3600
    MySQL.update.await("UPDATE vault_boxes SET end_time = ? WHERE id = ? AND owner_id = ?", {newEnd, boxId, cid})
    return {
        ok = true,
        endTime = newEnd,
        paid = cost
    }
end)

lib.callback.register('teke_auction:vaultSellSystem', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local cid = player.PlayerData.citizenid
    local boxId = tonumber(data and data.id)
    if not boxId then
        return {
            ok = false,
            reason = 'badid'
        }
    end
    local row = ownedOpenBox(cid, boxId)
    if not row then
        return {
            ok = false,
            reason = 'notfound'
        }
    end
    local offer = vmoney(row.est_value * (VC.systemOffer or 0.90))
    local del = MySQL.update.await("DELETE FROM vault_boxes WHERE id = ? AND owner_id = ? AND opened = 0", {boxId, cid})
    if not del or del < 1 then
        return {
            ok = false,
            reason = 'notfound'
        }
    end
    player.Functions.AddMoney(vacc(), offer, 'vault-sell-system')
    return {
        ok = true,
        paid = offer
    }
end)

-- ===== OYUNCUYA SAT (konumda devir) =====
local pendingOffers = {}
lib.callback.register('teke_auction:vaultSellPlayer', function(source, data)
    local src = source
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        return {
            ok = false,
            reason = 'noplayer'
        }
    end
    local cid = player.PlayerData.citizenid
    local boxId = tonumber(data and data.id)
    local price = math.max(0, math.floor(tonumber(data and data.price) or 0))
    if not boxId then
        return {
            ok = false,
            reason = 'badid'
        }
    end
    local row = ownedOpenBox(cid, boxId)
    if not row then
        return {
            ok = false,
            reason = 'notfound'
        }
    end
    local buyer = nearestPlayer(src, VC.transferRadius or 3.0)
    if not buyer or not exports.qbx_core:GetPlayer(buyer) then
        return {
            ok = false,
            reason = 'nobuyer'
        }
    end
    pendingOffers[buyer] = {
        boxId = boxId,
        price = price,
        sellerCid = cid,
        sellerSrc = src,
        expires = os.time() + 30
    }
    TriggerClientEvent('teke_auction:vaultOffer', buyer, {
        boxId = tostring(boxId),
        name = row.name,
        price = price,
        seller = Payouts.nameOf(cid)
    })
    return {
        ok = true,
        pending = true
    }
end)

RegisterNetEvent('teke_auction:vaultOfferResponse', function(accepted)
    local buyer = source
    local offer = pendingOffers[buyer];
    pendingOffers[buyer] = nil
    if not offer or os.time() > offer.expires or not accepted then
        return
    end
    local bp = exports.qbx_core:GetPlayer(buyer)
    local sp = exports.qbx_core:GetPlayer(offer.sellerSrc)
    if not bp or not sp then
        return
    end
    local buyerCid = bp.PlayerData.citizenid
    local row = ownedOpenBox(offer.sellerCid, offer.boxId)
    if not row then
        return
    end
    if not playersNear(offer.sellerSrc, buyer, VC.transferRadius or 3.0) then
        TriggerClientEvent('teke_auction:vaultToast', offer.sellerSrc, {
            type = 'error',
            msg = 'Alıcı uzaklaştı, devir iptal.'
        })
        return
    end
    if offer.price > 0 then
        if (bp.PlayerData.money[vacc()] or 0) < offer.price then
            TriggerClientEvent('teke_auction:vaultToast', offer.sellerSrc, {
                type = 'error',
                msg = 'Alıcının parası yetmedi.'
            })
            return
        end
        bp.Functions.RemoveMoney(vacc(), offer.price, 'vault-buy')
        sp.Functions.AddMoney(vacc(), offer.price, 'vault-sell-player')
    end
    MySQL.update.await('UPDATE vault_boxes SET owner_id = ? WHERE id = ? AND owner_id = ? AND opened = 0',
        {buyerCid, offer.boxId, offer.sellerCid})
    TriggerClientEvent('teke_auction:vaultRefresh', offer.sellerSrc)
    TriggerClientEvent('teke_auction:vaultRefresh', buyer)
end)

-- ===== Süre dolan kutuların pending loot'unu süpür =====
CreateThread(function()
    while true do
        Wait(60000)
        MySQL.update.await([[
      DELETE bl FROM vault_box_loot bl
      JOIN vault_boxes b ON b.id = bl.box_id
      WHERE b.end_time <= ?
    ]], {os.time()})
    end
end)
