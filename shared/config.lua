Config = Config or {}
Config.Debug = true -- test araçlarını aç (canlıda false yap)
Config.Item = 'auction_tablet' -- ox_inventory item adı
Config.FinalPhaseSeconds = 10
Config.GoLiveSeconds = 2 * 3600 -- bitişe 2 saat kala upcoming → open
Config.PageSize = 6 -- recent sunucu sayfa boyu (grid 3×2)
Config.Create = {
    everySeconds = 600,
    maxActive = 12,
    minDur = 3600,
    maxDur = 8 * 3600
}
Config.Tiers = {
    bronze = {
        base = 1000
    },
    silver = {
        base = 5000
    },
    gold = {
        base = 15000
    }
}
Config.Scratch = {
    cellCount = 6, -- toplam kutu sayısı
    baseCost = 50, -- ilk açılışın fiyatı
    growth = 1.5, -- her açılışta sıradaki kutu fiyatı ×growth

    -- BOŞLUK, içerik zenginliğine göre ölçeklenir
    -- İçerik ne kadar ÇOK farklı item içerirse boş kutu olasılığı o kadar AZ.
    fullnessRef = 6,
    emptyChanceMin = 0.05,
    emptyChanceMax = 0.60,

    labels = { -- item id → NUI'da görünecek ad + emoji (yalnızca gösterim; içerikte olan itemler için)
        phone = {
            name = 'Telefon',
            emoji = '📱'
        },
        tv = {
            name = 'Televizyon',
            emoji = '📺'
        },
        laptop = {
            name = 'Laptop',
            emoji = '💻'
        },
        watch = {
            name = 'Saat',
            emoji = '⌚'
        },
        water = {
            name = 'Su',
            emoji = '💧'
        },
        bread = {
            name = 'Ekmek',
            emoji = '🍞'
        },
        goldbar = {
            name = 'Külçe Altın',
            emoji = '🥇'
        },
        rolex = {
            name = 'Rolex',
            emoji = '⌚'
        }
    }
}
Config.MinBid = {
    bronze = 150,
    silver = 300,
    gold = 600
}

Config.Hack = {
    traceSteps = {5, 10, 25, 45, 70, 100},
    cleanCost = 2000,
    cost = {
        double = 1000,
        jam = 1200,
        blackout = 800,
        deanon = 1500,
        spoof = 600,
        freeze = 900
    },

    -- Double Bid
    multiplier = 2,
    doubleBid = {
        cost = 5000,
        multiplier = 2,
        duration = 0,
        oneShot = true
    },
    -- Lock Bidder
    lockBidder = {
        cost = 4000,
        duration = 30
    },

    -- ▼ YENİ HACKLER ▼
    blindBidder = {
        cost = 3000,
        duration = 20
    }, -- hedef bu süre teklifleri göremez
    revealHidden = {
        cost = 3500
    }, -- gizli teklif sahibini açığa çıkar (tek seferlik)
    fakeBid = {
        cost = 2500
    }, -- sıradaki teklif sahte: para düşmez, kazanamaz
    freezePrice = {
        cost = 6000,
        duration = 15
    } -- fiyat bu süre donar, kimse teklif veremez
}

-- ==== Faz B: Vault ayarları ====
Config.VaultSpots = {
    storage = {vec3(1234.5, -1234.5, 30.0) -- TODO: storage noktaları
    },
    container = {vec3(0.0, 0.0, 0.0) -- TODO: container noktaları
    },
    itembox = {vec3(0.0, 0.0, 0.0) -- TODO: itembox noktaları
    }
}
Config.Vault = {
    radius = 3.0,          -- kutu/temizlik yakınlığı (SUNUCUDA kontrol)
    stashSlots = 20,       -- (artık stash yok; geriye dönük dursun)
    stashWeight = 200000,

    -- Fiyatlandırma (est_value oranı) — SUNUCU otoritesi
    account       = 'bank',
    insuranceRate = 0.15,
    securityRate  = 0.25,
    extendRate    = 0.05,
    extendHours   = 6,
    systemOffer   = 0.90,

    transferRadius = 3.0,  -- "Oyuncuya Sat" konumda devir yakınlığı

    -- Kiralık temizlikçi: ücret + çalma riski (SUNUCU otoritesi; frontend ile eşleşir)
    cleaners = {
        rookie = { price = 250,  theft = 0.25 },
        pro    = { price = 750,  theft = 0.10 },
        elite  = { price = 1800, theft = 0.02 },
    },
}

Config.LootGen = {
    identifySeconds = 4,   -- tanımlama süresi (reveal modalındaki progress bar)

    -- value & rarity tier'a göre ağırlıklı
    tierBias = {
        bronze = { low = 0.55, mid = 0.35, high = 0.10 },
        silver = { low = 0.35, mid = 0.40, high = 0.25 },
        gold   = { low = 0.15, mid = 0.40, high = 0.45 },
    },
    -- diğer alanlar (clean/repair/authentic/demand/legal)
    neutral = { low = 0.34, mid = 0.33, high = 0.33 },
}
