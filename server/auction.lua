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
lib.addCommand('createauction', { help = 'Test auction' }, function()
  createRandom()
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
      -- Faz 3'te kazanan hesaplanacak (şimdilik null)
      MySQL.update.await("UPDATE auctions SET status='ended' WHERE id=?", { r.id })
      NotifyViewers('ended', { id = tostring(r.id) })
    end
  end
end)