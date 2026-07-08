Vault = Vault or {}

local function stashId(boxId) return ('vault_%s'):format(boxId) end

-- Kutunun kendi konumu (auction oluştururken belirlenip vault_boxes'a kopyalanır)
local function boxLocation(row)
  if row.loc_x == nil then return nil end
  return vec3(row.loc_x + 0.0, row.loc_y + 0.0, row.loc_z + 0.0)
end

-- Oyuncu, KUTUNUN konumuna yakın mı? (sunucu otoritesi — client'a güvenme)
local function nearBox(src, loc)
  if not loc then return false end
  local ped = GetPlayerPed(src)
  if not ped or ped == 0 then return false end
  local pc = GetEntityCoords(ped)
  return #(pc - loc) <= (Config.Vault.radius + 2.0)
end

-- UI güvenlik etiketi: DB 'unprotected' -> UI 'none'
local function uiSecurity(s)
  return (s == 'unprotected') and 'none' or s
end

-- TINYINT(1) oxmysql'de boolean dönebilir → 0/1, true/false, "0"/"1" hepsini güvenle çöz
local function truthy(v)
  return v == 1 or v == true or v == '1'
end

local PREFIX = { storage = 'STR', container = 'CNT', itembox = 'TMB' }

-- Oyuncunun açılmamış kutuları
lib.callback.register('teke_auction:getVault', function(source)
  local player = exports.qbx_core:GetPlayer(source)
  if not player then return {} end
  local cid = player.PlayerData.citizenid
  local rows = MySQL.query.await([[
    SELECT id, name, kind, tier, est_value, security, end_time, loc_x, loc_y, loc_z
    FROM vault_boxes WHERE owner_id = ? AND opened = 0
    ORDER BY end_time ASC
  ]], { cid })
  local out = {}
  for _, r in ipairs(rows or {}) do
    local remaining = math.max(0, r.end_time - os.time())
    out[#out+1] = {
      id           = tostring(r.id),
      kind         = r.kind,
      tier         = r.tier,
      name         = r.name or ((PREFIX[r.kind] or 'BOX') .. '-' .. r.id), -- isim korunur
      estValue     = r.est_value,
      bid          = r.est_value,
      security     = uiSecurity(r.security),
      endTime      = os.date('!%H:%M:%S', remaining),
      participants = 0,
      loc          = (r.loc_x ~= nil) and { x = r.loc_x, y = r.loc_y, z = r.loc_z } or nil,
    }
  end
  return out
end)

-- Kutuyu stash olarak aç (lokasyon + sahiplik + tek-seferlik seed)
lib.callback.register('teke_auction:openBox', function(source, data)
  print('[vault] openBox ÇAĞRILDI id=', data and data.id) -- TEŞHİS (test sonrası kaldır)
  local src = source
  local player = exports.qbx_core:GetPlayer(src)
  if not player then return { ok = false, reason = 'noplayer' } end
  local cid = player.PlayerData.citizenid
  local boxId = tonumber(data and data.id)
  if not boxId then return { ok = false, reason = 'badid' } end

  -- sahiplik + durum + konum
  local row = MySQL.query.await([[
    SELECT id, security, end_time, seeded, contents_json, loc_x, loc_y, loc_z
    FROM vault_boxes WHERE id = ? AND owner_id = ? AND opened = 0
  ]], { boxId, cid })
  row = row and row[1]
  if not row then return { ok = false, reason = 'notfound' } end
  if row.end_time <= os.time() then return { ok = false, reason = 'expired' } end

  -- konum kontrolü (client mesafesine GÜVENME) — kutunun KENDİ noktasına
  if not nearBox(src, boxLocation(row)) then return { ok = false, reason = 'toofar' } end

  local sid = stashId(boxId)

  -- stash'i kaydet (idempotent, owner = cid)
  exports.ox_inventory:RegisterStash(
    sid, ('Kutu #%s'):format(boxId), Config.Vault.stashSlots, Config.Vault.stashWeight, cid)

  -- ilk açılışta bir kez doldur (TINYINT(1) boolean dönebilir → truthy ile güvenli kontrol)
  if not truthy(row.seeded) then
    local upd = MySQL.update.await(
      'UPDATE vault_boxes SET seeded = 1 WHERE id = ? AND seeded = 0', { boxId })
    if upd and upd > 0 then
      local contents = row.contents_json and json.decode(row.contents_json) or {}
      print('[vault] box #' .. boxId .. ' contents count = ' .. #contents) -- TEŞHİS
      for _, it in ipairs(contents) do
        local item  = it.item or it.name
        local count = tonumber(it.count or it.amount) or 1
        print('[vault]   +', tostring(item), count) -- TEŞHİS
        if item and count > 0 then
          exports.ox_inventory:AddItem(sid, item, count, it.metadata)
        end
      end
    end
  end

  -- oyuncuya stash'i aç
  exports.ox_inventory:forceOpenInventory(src, 'stash', sid)
  return { ok = true }
end)

-- Stash boşaldıysa kutuyu kapat/temizle
local function finalizeIfEmpty(boxId)
  local sid = stashId(boxId)
  local items = exports.ox_inventory:GetInventoryItems(sid) or {}
  for _, v in pairs(items) do
    if v and (v.count or 0) > 0 then return end -- hâlâ item var
  end
  local upd = MySQL.update.await(
    'UPDATE vault_boxes SET opened = 1, contents_json = NULL WHERE id = ? AND opened = 0', { boxId })
  if upd and upd > 0 then
    local owner = MySQL.scalar.await('SELECT owner_id FROM vault_boxes WHERE id = ?', { boxId })
    local wp = owner and exports.qbx_core:GetPlayerByCitizenId(owner)
    if wp then
      TriggerClientEvent('teke_auction:vaultBoxOpened', wp.PlayerData.source, { id = tostring(boxId) })
    end
  end
end

-- ox_inventory stash kapanınca kontrol et (versiyona göre imza değişebilir)
AddEventHandler('ox_inventory:closedInventory', function(playerId, inventoryId)
  if type(inventoryId) == 'string' then
    local boxId = inventoryId:match('^vault_(%d+)$')
    if boxId then finalizeIfEmpty(tonumber(boxId)) end
  end
end)

-- GÜVENLİK AĞI: seed edilmiş ama açık kalmış kutuları periyodik süpür
CreateThread(function()
  while true do
    Wait(60000)
    local rows = MySQL.query.await('SELECT id FROM vault_boxes WHERE seeded = 1 AND opened = 0')
    for _, r in ipairs(rows or {}) do finalizeIfEmpty(r.id) end
  end
end)