-- server/scratch.lua
-- Scratch Card: auction içeriğinden türeyen, FİKİR amaçlı kutular.
-- • İçerik seti (hangi itemler + kaç boş) tüm katılımcılar için AYNI (auction seed).
-- • Kutulardaki sıralar her oyuncu için FARKLI (auction+cid seed ile karıştırılır).
-- • Kazanç yok; para ödeyip içeriği görürsün. Her açılışta sıradaki fiyat artar.

local function Cfg() return Config.Scratch or {} end

-- Deterministik PRNG (Park–Miller LCG)
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

local function shuffle(list, rng)
    for i = #list, 2, -1 do
        local j = math.floor(rng() * i) + 1
        list[i], list[j] = list[j], list[i]
    end
    return list
end

-- DB helper: oyuncunun açtığı kutular
local function openedRows(id, cid)
    local rows = MySQL.query.await(
        "SELECT cell_index, item_id FROM auction_scratch WHERE auction_id = ? AND citizenid = ?", { id, cid })
    local map, n = {}, 0
    for _, r in ipairs(rows or {}) do
        map[r.cell_index] = (r.item_id ~= nil) and r.item_id or false
        n = n + 1
    end
    return map, n
end

-- Fiyat: baseCost * growth^opened
local function scratchCost(opened)
    local c = Cfg()
    return math.floor((c.baseCost or 250) * ((c.growth or 1.6) ^ opened) + 0.5)
end

local function labelOf(itemId)
    local l = (Cfg().labels or {})[itemId]
    return {
        id = itemId,
        name = (l and l.name) or itemId,
        emoji = (l and l.emoji) or '📦'
    }
end

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

local function canonicalBag(id)
    local c = Cfg()
    local cellCount = c.cellCount or 6
    local rng = makeRng(tonumber(id) or strHash(tostring(id)))

    -- yalnızca auction içeriğindeki DISTINCT itemler (karışık sırayla)
    local items = auctionItems(id)
    shuffle(items, rng)
    local D = #items

    -- Kutu başına DOLU olma olasılığı, FARKLI item sayısına (D) göre ölçeklenir.
    -- fillChance = min(1, D / fillRef) → fillRef=30: D=6→%20, 12→%40, 24→%80, 30+→%100
    local fillRef = c.fillRef or 30
    if fillRef < 1 then fillRef = 1 end
    local fillChance = math.min(1, D / fillRef)

    -- kutuları doldur (her item en fazla 1 kez; UYDURMA YOK)
    local bag = {}
    local used = 0
    for i = 1, cellCount do
        if used < D and rng() < fillChance then
            used = used + 1
            bag[i] = items[used]   -- içerikten gerçek item
        else
            bag[i] = false         -- boş kutu
        end
    end

    -- "en az minFilled dolu" garanti (içerik izin verdiği ölçüde)
    local minFilled = c.minFilled or 1
    local target = math.min(minFilled, D, cellCount)
    if used < target then
        for i = 1, cellCount do
            if used >= target then break end
            if bag[i] == false then
                used = used + 1
                bag[i] = items[used]
            end
        end
    end

    return bag, cellCount
end

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

lib.callback.register('teke_auction:getScratch', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return { ok = false, reason = 'noplayer' } end
    local cid = player.PlayerData.citizenid
    local id = data and data.auctionId
    if not id then return { ok = false, reason = 'args' } end

    if not isParticipant(id, cid) then
        return { ok = false, reason = 'notparticipant', cellCount = (Cfg().cellCount or 6) }
    end

    local cellCount = Cfg().cellCount or 6
    local map, opened = openedRows(id, cid)

    local cells = {}
    for i = 1, cellCount do
        local idx = i - 1
        local v = map[idx]
        if v ~= nil then
            cells[#cells + 1] = {
                index = idx, opened = true,
                empty = (v == false),
                item = (v ~= false) and labelOf(v) or nil
            }
        else
            cells[#cells + 1] = { index = idx, opened = false }
        end
    end

    return { ok = true, cellCount = cellCount, openedCount = opened, nextCost = scratchCost(opened), cells = cells }
end)

-- NUI: bir kutuyu aç
lib.callback.register('teke_auction:scratchOpen', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return { ok = false, reason = 'noplayer' } end
    local cid = player.PlayerData.citizenid
    local id = data and data.auctionId
    local idx = data and tonumber(data.cellIndex)
    if not id or idx == nil then return { ok = false, reason = 'args' } end

    if not auctionOpen(id) then return { ok = false, reason = 'phase' } end
    if not isParticipant(id, cid) then return { ok = false, reason = 'notparticipant' } end

    local bag, cellCount = playerLayout(id, cid)   -- kutunun altındaki item hâlâ auction açıkken belirlenir
    if idx < 0 or idx >= cellCount then return { ok = false, reason = 'range' } end

    local map, opened = openedRows(id, cid)
    if map[idx] ~= nil then return { ok = false, reason = 'opened' } end

    local cost = scratchCost(opened)
    if (player.PlayerData.money.bank or 0) < cost then
        return { ok = false, reason = 'money', nextCost = cost }
    end

    local v = bag[idx + 1]

    -- önce DB'ye yaz (PK: auction_id+citizenid+cell_index → aynı kutu 2 kez açılamaz)
    MySQL.insert.await(
        "INSERT INTO auction_scratch (auction_id, citizenid, cell_index, item_id) VALUES (?, ?, ?, ?)",
        { id, cid, idx, (v ~= false) and v or nil })   -- boşsa item_id = NULL

    -- sonra parayı düş
    player.Functions.RemoveMoney('bank', cost, 'auction-scratch')

    local newOpened = opened + 1
    if Config.Debug then
        print(('[scratch] cid=%s auction=%s cell=%d cost=%d → %s'):format(
            cid, tostring(id), idx, cost, (v == false) and 'BOŞ' or tostring(v)))
    end

    return {
        ok = true, index = idx,
        empty = (v == false),
        item = (v ~= false) and labelOf(v) or nil,
        openedCount = newOpened,
        nextCost = scratchCost(newOpened),
        paid = cost
    }
end)

-- Auction bittiğinde DB temizleme
function ScratchClear(id)
    MySQL.query.await("DELETE FROM auction_scratch WHERE auction_id = ?", { id })
end
