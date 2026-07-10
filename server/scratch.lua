-- server/scratch.lua
-- Scratch Card: auction içeriğinden türeyen, FİKİR amaçlı kutular.
-- • İçerik seti (hangi itemler + kaç boş) tüm katılımcılar için AYNI (auction seed).
-- • Kutulardaki sıralar her oyuncu için FARKLI (auction+cid seed ile karıştırılır).
-- • Kazanç yok; para ödeyip içeriği görürsün. Her açılışta sıradaki fiyat artar.

local function Cfg() return Config.Scratch or {} end

-- Deterministik PRNG (Park–Miller LCG) → aynı seed = aynı sonuç
local function makeRng(seed)
    local s = math.floor(seed) % 2147483647
    if s <= 0 then s = s + 2147483646 end
    return function()
        s = (s * 16807) % 2147483647
        return s / 2147483647
    end
end

local function strHash(str)
    local h = 5381
    for i = 1, #str do
        h = (h * 33 + str:byte(i)) % 2147483647
    end
    return h
end

-- Fisher–Yates (deterministik rng ile)
local function shuffle(list, rng)
    for i = #list, 2, -1 do
        local j = math.floor(rng() * i) + 1
        list[i], list[j] = list[j], list[i]
    end
    return list
end

-- Açılan kutular: ScratchOpened[auctionId][cid] = { [cellIndex]=true, ... }
local ScratchOpened = {}

local function openedSet(id, cid)
    local key = tostring(id)
    ScratchOpened[key] = ScratchOpened[key] or {}
    ScratchOpened[key][cid] = ScratchOpened[key][cid] or {}
    return ScratchOpened[key][cid]
end

local function openedCountOf(set)
    local n = 0
    for _ in pairs(set) do n = n + 1 end
    return n
end

-- Fiyat: baseCost * growth^opened (yuvarlanmış)
local function scratchCost(opened)
    local c = Cfg()
    return math.floor((c.baseCost or 250) * ((c.growth or 1.6) ^ opened) + 0.5)
end

-- Item etiketi (ad + emoji) — config.labels, yoksa güvenli fallback
local function labelOf(itemId)
    local l = (Cfg().labels or {})[itemId]
    return {
        id = itemId,
        name = (l and l.name) or itemId,
        emoji = (l and l.emoji) or '📦'
    }
end

-- Auction contents_json → distinct item id listesi
local function auctionItems(id)
    local row = MySQL.query.await("SELECT contents_json FROM auctions WHERE id = ?", {id})
    local seen, list = {}, {}
    local raw = row and row[1] and row[1].contents_json
    if raw then
        local ok, decoded = pcall(json.decode, raw)
        if ok and type(decoded) == 'table' then
            for _, e in ipairs(decoded) do
                if e.item and not seen[e.item] then
                    seen[e.item] = true
                    list[#list + 1] = e.item
                end
            end
        end
    end
    return list
end

-- Auction için KANONİK içerik seti (herkes için AYNI multiset)
-- Kural: SADECE auction içeriğindeki itemler; her item en fazla 1 kez.
-- Havuz/uydurma YOK. İçerik azsa → boş kutular. Boşluk olasılığı içerik zenginliğine göre.
local function canonicalBag(id)
    local c = Cfg()
    local cellCount = c.cellCount or 6
    local rng = makeRng(tonumber(id) or strHash(tostring(id)))

    -- yalnızca auction içeriğindeki DISTINCT itemler (karışık sırayla)
    local items = auctionItems(id)
    shuffle(items, rng)
    local D = #items

    -- içerik doygunluğu 0..1 : içerik ne kadar fazlaysa 1'e yaklaşır
    local ref = c.fullnessRef or cellCount
    if ref < 1 then
        ref = 1
    end
    local fullness = math.min(D, ref) / ref

    -- her doldurulabilir kutunun boş kalma olasılığı:
    -- fullness→1 (içerik zengin) → emptyChanceMin, fullness→0 (içerik az) → emptyChanceMax
    local emin = c.emptyChanceMin or 0.0
    local emax = c.emptyChanceMax or 0.6
    local emptyChance = emin + (emax - emin) * (1 - fullness)

    -- kutuları doldur: item varsa ve boş olasılığı tutmadıysa gerçek item, aksi halde boş
    local bag = {}
    local used = 0
    for i = 1, cellCount do
        if used < D and rng() >= emptyChance then
            used = used + 1
            bag[i] = items[used] -- içerikten gerçek item (her biri 1 kez)
        else
            bag[i] = false -- boş: ya item kalmadı ya da boş olasılığı tuttu (UYDURMA YOK)
        end
    end
    return bag, cellCount
end

-- Oyuncuya özel DÜZEN (aynı multiset, farklı sıralar)
local function playerLayout(id, cid)
    local bag, cellCount = canonicalBag(id)
    local rng = makeRng(strHash(tostring(id) .. ':' .. tostring(cid)))
    shuffle(bag, rng)
    return bag, cellCount
end

local function isParticipant(id, cid)
    local r = MySQL.query.await(
        "SELECT 1 FROM auction_participants WHERE auction_id = ? AND citizenid = ? LIMIT 1", {id, cid})
    return (r and r[1]) and true or false
end

local function auctionOpen(id)
    local r = MySQL.query.await("SELECT status FROM auctions WHERE id = ?", {id})
    local st = r and r[1] and r[1].status
    return st == 'open' or st == 'final'
end

-- NUI: mevcut scratch durumu
lib.callback.register('teke_auction:getScratch', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return { ok = false, reason = 'noplayer' } end
    local cid = player.PlayerData.citizenid
    local id = data and data.auctionId
    if not id then return { ok = false, reason = 'args' } end

    if not isParticipant(id, cid) then
        return { ok = false, reason = 'notparticipant', cellCount = (Cfg().cellCount or 6) }
    end

    local bag, cellCount = playerLayout(id, cid)
    local set = openedSet(id, cid)
    local opened = openedCountOf(set)

    local cells = {}
    for i = 1, cellCount do
        local idx = i - 1
        if set[idx] then
            local v = bag[i]
            cells[#cells + 1] = {
                index = idx,
                opened = true,
                empty = (v == false),
                item = (v ~= false) and labelOf(v) or nil
            }
        else
            cells[#cells + 1] = { index = idx, opened = false }
        end
    end

    return {
        ok = true,
        cellCount = cellCount,
        openedCount = opened,
        nextCost = scratchCost(opened),
        cells = cells
    }
end)

-- NUI: bir kutuyu aç (para öde → içeriği gör)
lib.callback.register('teke_auction:scratchOpen', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return { ok = false, reason = 'noplayer' } end
    local cid = player.PlayerData.citizenid
    local id = data and data.auctionId
    local idx = data and tonumber(data.cellIndex)
    if not id or idx == nil then return { ok = false, reason = 'args' } end

    if not auctionOpen(id) then return { ok = false, reason = 'phase' } end
    if not isParticipant(id, cid) then return { ok = false, reason = 'notparticipant' } end

    local bag, cellCount = playerLayout(id, cid)
    if idx < 0 or idx >= cellCount then return { ok = false, reason = 'range' } end

    local set = openedSet(id, cid)
    if set[idx] then return { ok = false, reason = 'opened' } end

    local opened = openedCountOf(set)
    local cost = scratchCost(opened)
    if (player.PlayerData.money.bank or 0) < cost then
        return { ok = false, reason = 'money', nextCost = cost }
    end
    player.Functions.RemoveMoney('bank', cost, 'auction-scratch')

    set[idx] = true
    local newOpened = opened + 1
    local v = bag[idx + 1]

    if Config.Debug then
        print(('[scratch] cid=%s auction=%s cell=%d cost=%d → %s'):format(
            cid, tostring(id), idx, cost, (v == false) and 'BOŞ' or tostring(v)))
    end

    return {
        ok = true,
        index = idx,
        empty = (v == false),
        item = (v ~= false) and labelOf(v) or nil,
        openedCount = newOpened,
        nextCost = scratchCost(newOpened),
        paid = cost
    }
end)

-- Auction bittiğinde hafızayı temizlemek istersen (opsiyonel): ScratchClear(id)
function ScratchClear(id)
    ScratchOpened[tostring(id)] = nil
end