Config = Config or {}
Config.Debug = true   -- test araçlarını aç (canlıda false yap)
Config.Item = 'auction_tablet'      -- ox_inventory item adı
Config.FinalPhaseSeconds = 10
Config.GoLiveSeconds = 2 * 3600        -- bitişe 2 saat kala upcoming → open
Config.PageSize = 6                     -- recent sunucu sayfa boyu (grid 3×2)
Config.Create = { everySeconds = 600, maxActive = 12, minDur = 3600, maxDur = 8 * 3600 }
Config.Tiers = { bronze = { base = 1000 }, silver = { base = 5000 }, gold = { base = 15000 } }
Config.Scratch = { cellCount = 6, baseCost = 250, growth = 1.6, pool = { 'phone', 'tv', 'laptop', 'watch' } }
Config.MinBid = { bronze = 150, silver = 300, gold = 600 }
Config.Hack = {
  traceSteps = { 5, 10, 25, 45, 70, 100 },
  cleanCost = 2000,
  cost = { double = 1000, jam = 1200, blackout = 800, deanon = 1500, spoof = 600, freeze = 900 },
}

Config.Loot = {
  storage   = {
    bronze = {
      { item = 'water', min = 1, max = 3 },
      { item = 'bread', min = 1, max = 2 }
    },
    silver = {
      { item = 'phone', min = 1, max = 1 },
      { item = 'goldbar', min = 1, max = 2 }
    },
    gold = {
      { item = 'goldbar', min = 1, max = 2 },
      { item = 'rolex',   min = 1, max = 1 }
    }
  },

  container = {
    bronze = { { item = 'water',   min = 2, max = 5 } },
    silver = { { item = 'goldbar', min = 1, max = 1 } },
    gold   = { { item = 'goldbar', min = 2, max = 4 } }
  },

  itembox = {
    bronze = { { item = 'lockpick', min = 1, max = 2 } },
    silver = { { item = 'phone',    min = 1, max = 2 } },
    gold   = { { item = 'diamond',  min = 1, max = 3 } }
  },
}

-- ==== Faz B: Vault ayarları ====
-- Türe göre kutu toplama noktaları. Otomatik üretimde bu havuzdan RASTGELE
-- bir nokta seçilir; admin oluşturursa kendi konumunu kullanır
Config.VaultSpots = {
  storage = {
    vec3(1234.5, -1234.5, 30.0), -- TODO: storage noktaları
    -- vec3(...), vec3(...),
  },
  container = {
    vec3(0.0, 0.0, 0.0),         -- TODO: container noktaları
  },
  itembox = {
    vec3(0.0, 0.0, 0.0),         -- TODO: itembox noktaları
  },
}
Config.Vault = {
  radius      = 3.0,      -- kutuyu açmak için gereken mesafe (SUNUCUDA kontrol)
  stashSlots  = 20,       -- kutu stash slot sayısı
  stashWeight = 200000,   -- gram (200 kg)
}


Config.Hack = {
  doubleBid = {
    cost       = 5000,  -- hack ücreti: hack yapanın bankasından düşer
    multiplier = 2,     -- hedefin sonraki teklifi kaç katı
    duration   = 0,     -- 0 = süresiz (hedef ne zaman teklif verirse); >0 ise saniye limiti
    oneShot    = true,  -- etki tek teklifte tükenir
  },
}