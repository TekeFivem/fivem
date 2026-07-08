local KINDS  = { 'storage', 'container', 'itembox' }
local TIERS  = { 'bronze', 'silver', 'gold' }
local PREFIX = { storage = 'STR', container = 'CNT', itembox = 'TMB' }

local function createRandom()
  local kind = KINDS[math.random(#KINDS)]
  local tier = TIERS[math.random(#TIERS)]
  local dur  = math.random(Config.Create.minDur, Config.Create.maxDur)
  local id, status = Db.CreateAuction({
    kind = kind,
    name = ('%s-%02d'):format(PREFIX[kind], math.random(10, 99)),
    tier = tier,
    base_bid = Config.Tiers[tier].base,
    duration = dur,
  })
  local item = Db.GetOne(id)
  if item then
    NotifyViewers('new', { list = (status == 'upcoming') and 'upcoming' or 'ongoing', item = item })
  end
end

-- Admin komutu
lib.addCommand('createauction', { help = 'Test auction' }, function(source)
  print('[teke_auction] createauction çağrıldı, src=' .. tostring(source))
  local ok, err = pcall(createRandom)
  if ok then
    print('[teke_auction] createRandom OK')
  else
    print('[teke_auction] createRandom HATA: ' .. tostring(err))
  end
end)

-- Admin: durduğun yeri kutu noktası yaparak auction oluştur
lib.addCommand('createauctionhere', {
  help = 'Bulunduğun konumda auction oluştur',
  params = {
    { name = 'kind', type = 'string', help = 'storage | container | itembox' },
    { name = 'tier', type = 'string', help = 'bronze | silver | gold' },
  },
}, function(source, args)
  local ped = GetPlayerPed(source)
  local c = GetEntityCoords(ped)
  local kind = args.kind or KINDS[math.random(#KINDS)]
  local tier = args.tier or TIERS[math.random(#TIERS)]
  local id, status = Db.CreateAuction({
    kind = kind, tier = tier,
    name = ('%s-%02d'):format(PREFIX[kind], math.random(10, 99)),
    base_bid = Config.Tiers[tier].base,
    duration = math.random(Config.Create.minDur, Config.Create.maxDur),
    location = { x = c.x, y = c.y, z = c.z }, -- admin'in konumu
  })
  local item = Db.GetOne(id)
  if item then
    NotifyViewers('new', { list = (status == 'upcoming') and 'upcoming' or 'ongoing', item = item })
  end
end)

-- Zamanlı otomatik üretim (ikisi birden)
CreateThread(function()
  while true do
    if Db.CountActive() < Config.Create.maxActive then createRandom() end
    Wait(Config.Create.everySeconds * 1000)
  end
end)

-- Yaşam döngüsü: upcoming→open (2s kala), open→ended
CreateThread(function()
  while true do
    Wait(1000)
    local now = os.time()

    local up = MySQL.query.await(
      "SELECT id FROM auctions WHERE status='upcoming' AND end_time <= ?", { now + Config.GoLiveSeconds })
    for _, r in ipairs(up or {}) do
      MySQL.update.await("UPDATE auctions SET status='open' WHERE id=?", { r.id })
      NotifyViewers('started', { id = tostring(r.id) })
    end

   local done = MySQL.query.await(
  "SELECT id FROM auctions WHERE status IN ('open','final') AND end_time <= ?", { now })
for _, r in ipairs(done or {}) do
  local res = Db.SettleAuction(r.id)
  NotifyViewers('ended', { id = tostring(r.id), winner = res.winner, paid = res.paid })
  -- kazanan online insansa: VICTORY sinyali (bot ise winnerCid 'BOT_..' → nil döner, atlanır)
  if res.winnerCid then
    local wp = exports.qbx_core:GetPlayerByCitizenId(res.winnerCid)
    if wp then TriggerClientEvent('teke_auction:won', wp.PlayerData.source, { id = tostring(r.id) }) end
  end
end
  end  
end)  