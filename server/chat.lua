-- server/chat.lua  → auction chat + katılımcı isim listesi
Chat = {}
local MAX_LEN     = 256
local MAX_HISTORY = 50

-- BOT_<isim> citizenid'lerini okunur isme çevir; gerçek oyuncular için Payouts.nameOf
local function chatName(cid)
    if type(cid) == 'string' and cid:sub(1, 4) == 'BOT_' then
        return cid:sub(5)
    end
    return Payouts.nameOf(cid)
end

local function participantSources(auctionId)
    local rows = MySQL.query.await(
        'SELECT citizenid FROM auction_participants WHERE auction_id = ?', { auctionId })
    local srcs = {}
    for _, r in ipairs(rows or {}) do
        local p = exports.qbx_core:GetPlayerByCitizenId(r.citizenid)
        if p then srcs[#srcs + 1] = p.PlayerData.source end
    end
    return srcs
end

local function isParticipant(id, cid)
    local r = MySQL.query.await(
        'SELECT 1 FROM auction_participants WHERE auction_id = ? AND citizenid = ? LIMIT 1', { id, cid })
    return (r and r[1]) and true or false
end

-- Bir mesajı auction'ın (online) katılımcılarına canlı ilet
function Chat.deliver(payload)
    for _, src in ipairs(participantSources(payload.auctionId)) do
        TriggerClientEvent('teke_auction:chat', src, payload)
    end
end

-- Katılımcı listesi (isimlerle) → tagleme + açılır liste
lib.callback.register('teke_auction:getParticipants', function(source, data)
    local id = data and data.id
    if not id then return {} end
    local me    = exports.qbx_core:GetPlayer(source)
    local myCid = me and me.PlayerData.citizenid
    local rows  = MySQL.query.await(
        'SELECT citizenid FROM auction_participants WHERE auction_id = ? ORDER BY joined_at ASC', { id })
    local out = {}
    for _, r in ipairs(rows or {}) do
        out[#out + 1] = {
            cid  = r.citizenid,
            name = chatName(r.citizenid),
            self = (r.citizenid == myCid),
        }
    end
    return out
end)

-- Eski mesajlar (getChat) — sadece katılımcı görür
lib.callback.register('teke_auction:getChat', function(source, data)
    local id = data and data.id
    if not id then return {} end
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return {} end
    local cid = player.PlayerData.citizenid
    if not isParticipant(id, cid) then return {} end

    local rows = MySQL.query.await([[
        SELECT id, citizenid, message, UNIX_TIMESTAMP(created_at) AS ts
        FROM auction_chat WHERE auction_id = ?
        ORDER BY id DESC LIMIT ?
    ]], { id, MAX_HISTORY })

    local out = {}
    for i = #rows, 1, -1 do -- eskiden yeniye
        local r = rows[i]
        out[#out + 1] = {
            id      = tostring(r.id),
            cid     = r.citizenid,
            name    = chatName(r.citizenid),
            message = r.message,
            ts      = (r.ts or 0) * 1000,
            self    = (r.citizenid == cid),
        }
    end
    return out
end)

-- Mesaj gönder (sendChat)
lib.callback.register('teke_auction:sendChat', function(source, data)
    local player = exports.qbx_core:GetPlayer(source)
    if not player then return { ok = false, reason = 'noplayer' } end
    local cid = player.PlayerData.citizenid
    local id  = data and data.id
    local raw = data and data.message
    if not id or type(raw) ~= 'string' then return { ok = false, reason = 'args' } end

    local message = raw:gsub('^%s+', ''):gsub('%s+$', '')
    if message == '' then return { ok = false, reason = 'empty' } end
    if #message > MAX_LEN then message = message:sub(1, MAX_LEN) end

    if not isParticipant(id, cid) then return { ok = false, reason = 'notparticipant' } end

    local a = MySQL.query.await('SELECT status FROM auctions WHERE id = ?', { id })
    if not (a and a[1]) then return { ok = false, reason = 'notfound' } end
    if a[1].status ~= 'open' and a[1].status ~= 'final' then
        return { ok = false, reason = 'phase' }
    end

    local insertId = MySQL.insert.await(
        'INSERT INTO auction_chat (auction_id, citizenid, message) VALUES (?, ?, ?)',
        { id, cid, message })

    local payload = {
        id        = tostring(insertId),
        auctionId = tostring(id),
        cid       = cid,
        name      = chatName(cid),
        message   = message,
        ts        = os.time() * 1000,
    }
    Chat.deliver(payload) -- gönderen de katılımcı olduğu için kendi echo'sunu alır
    return { ok = true, id = payload.id, ts = payload.ts }
end)

-- ===== TEST/BOT =====
-- Bir botu (BOT_<isim>) katılımcı yapar + mesaj yazdırır (canlı iletir)
function Chat.botSay(id, name, message)
    name = name or 'BOT'
    local cid = 'BOT_' .. name

    -- botu katılımcı yap → tag listesinde görünür (canlı)
    MySQL.insert.await(
        'INSERT IGNORE INTO auction_participants (auction_id, citizenid) VALUES (?, ?)', { id, cid })
    local c = MySQL.query.await('SELECT COUNT(*) AS c FROM auction_participants WHERE auction_id = ?', { id })
    NotifyViewers('stats', { id = tostring(id), participants = (c and c[1] and c[1].c) or 0 })

    local insertId = MySQL.insert.await(
        'INSERT INTO auction_chat (auction_id, citizenid, message) VALUES (?, ?, ?)', { id, cid, message })
    local payload = {
        id        = tostring(insertId),
        auctionId = tostring(id),
        cid       = cid,
        name      = name,
        message   = message,
        ts        = os.time() * 1000,
    }
    Chat.deliver(payload)
    return payload
end