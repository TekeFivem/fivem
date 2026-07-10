-- Çıkma şansları (config'te tanımlı). GenerateContents bunları kullanır.
-- chance = o item'in auction içeriğine girme yüzdesi (0-100)
Config.LootRoll = {
    -- tier bazlı VARSAYILAN şans + auction başına item TÜRÜ sayısı sınırları
    bronze = {
        chance = 50,
        minTypes = 3,
        maxTypes = 8
    },
    silver = {
        chance = 38,
        minTypes = 3,
        maxTypes = 7
    },
    gold = {
        chance = 30,
        minTypes = 2,
        maxTypes = 6
    }
}

-- Belirli itemler için ÖZEL şans (tier varsayılanını ezer). Değerli/nadir olanlar düşük.
Config.LootRarity = {
    -- 💰 değerli
    goldbar = 22,
    rolex = 18,
    diamond_ring = 16,
    goldchain = 30,
    -- 💻 hack/güvenlik
    cryptostick = 20,
    trojan_usb = 12,
    gatecrack = 12,
    security_card_01 = 8,
    security_card_02 = 8,
    advancedlockpick = 22,
    advancedrepairkit = 18,
    drill = 12,
    thermite = 10,
    -- 🧪 uyuşturucu (brick/ağır)
    coke_brick = 10,
    coke_small_brick = 18,
    weed_brick = 12,
    meth = 25,
    oxy = 25,
    -- 🤿 dalış / mercan
    diving_gear = 12,
    diving_fill = 20,
    antipatharia_coral = 18,
    dendrogyra_coral = 18,
    -- 🛡️ diğer nadir
    armour = 25,
    nitrous = 30,
    jammer = 20,
    harness = 25,
    handcuffs = 25,
    firework4 = 20,
    filled_evidence_bag = 20
    -- burada olmayan itemler tier varsayılan şansını kullanır
}
Config.Loot = {

    ------------------------------------------------------------------
    -- 🗄️ STORAGE
    ------------------------------------------------------------------
    storage = {
        bronze = {{
            item = 'painkillers',
            min = 1,
            max = 3
        }, {
            item = 'bandage',
            min = 1,
            max = 4
        }, {
            item = 'lighter',
            min = 1,
            max = 2
        }, {
            item = 'stickynote',
            min = 1,
            max = 3
        }, {
            item = 'plastic',
            min = 1,
            max = 5
        }, {
            item = 'glass',
            min = 1,
            max = 5
        }, {
            item = 'rubber',
            min = 1,
            max = 5
        }, {
            item = 'metalscrap',
            min = 1,
            max = 5
        }, {
            item = 'iron',
            min = 1,
            max = 4
        }, {
            item = 'copper',
            min = 1,
            max = 4
        }, {
            item = 'aluminum',
            min = 1,
            max = 4
        }, {
            item = 'steel',
            min = 1,
            max = 4
        }, {
            item = 'rolling_paper',
            min = 1,
            max = 3
        }, {
            item = 'empty_weed_bag',
            min = 1,
            max = 3
        }, {
            item = 'empty_evidence_bag',
            min = 1,
            max = 2
        }, {
            item = 'radiocell',
            min = 1,
            max = 2
        }, {
            item = 'small_tv',
            min = 1,
            max = 1
        }, {
            item = 'toaster',
            min = 1,
            max = 1
        }, {
            item = 'cleaningkit',
            min = 1,
            max = 1
        }, {
            item = 'walking_stick',
            min = 1,
            max = 1
        }, {
            item = 'joint',
            min = 1,
            max = 3
        }, {
            item = 'crack_baggy',
            min = 1,
            max = 2
        }, {
            item = 'weed_ak47_seed',
            min = 1,
            max = 2
        }, {
            item = 'weed_skunk_seed',
            min = 1,
            max = 2
        }, {
            item = 'weed_amnesia_seed',
            min = 1,
            max = 2
        }, {
            item = 'weed_og-kush_seed',
            min = 1,
            max = 2
        }, {
            item = 'weed_white-widow_seed',
            min = 1,
            max = 2
        }, {
            item = 'weed_purple-haze_seed',
            min = 1,
            max = 2
        }, {
            item = 'firework1',
            min = 1,
            max = 1
        }, {
            item = 'firework2',
            min = 1,
            max = 1
        }},
        silver = {{
            item = 'phone',
            min = 1,
            max = 1
        }, {
            item = 'screwdriverset',
            min = 1,
            max = 1
        }, {
            item = 'electronickit',
            min = 1,
            max = 1
        }, {
            item = 'repairkit',
            min = 1,
            max = 1
        }, {
            item = 'lockpick',
            min = 1,
            max = 2
        }, {
            item = 'binoculars',
            min = 1,
            max = 1
        }, {
            item = 'goldchain',
            min = 1,
            max = 2
        }, {
            item = 'firstaid',
            min = 1,
            max = 2
        }, {
            item = 'ifaks',
            min = 1,
            max = 2
        }, {
            item = 'handcuffs',
            min = 1,
            max = 1
        }, {
            item = 'harness',
            min = 1,
            max = 1
        }, {
            item = 'radio',
            min = 1,
            max = 1
        }, {
            item = 'jammer',
            min = 1,
            max = 1
        }, {
            item = 'cokebaggy',
            min = 1,
            max = 3
        }, {
            item = 'xtcbaggy',
            min = 1,
            max = 3
        }, {
            item = 'weed_ak47',
            min = 1,
            max = 2
        }, {
            item = 'weed_skunk',
            min = 1,
            max = 2
        }, {
            item = 'weed_amnesia',
            min = 1,
            max = 2
        }, {
            item = 'weed_og-kush',
            min = 1,
            max = 2
        }, {
            item = 'weed_white-widow',
            min = 1,
            max = 2
        }, {
            item = 'weed_purple-haze',
            min = 1,
            max = 2
        }, {
            item = 'filled_evidence_bag',
            min = 1,
            max = 1
        }, {
            item = 'firework3',
            min = 1,
            max = 1
        }, {
            item = 'firework4',
            min = 1,
            max = 1
        }, {
            item = 'nitrous',
            min = 1,
            max = 2
        }, {
            item = 'jerry_can',
            min = 1,
            max = 1
        }, {
            item = 'armour',
            min = 1,
            max = 1
        }, {
            item = 'cryptostick',
            min = 1,
            max = 1
        }, {
            item = 'meth',
            min = 1,
            max = 2
        }, {
            item = 'oxy',
            min = 1,
            max = 2
        }},
        gold = {{
            item = 'goldbar',
            min = 1,
            max = 3
        }, {
            item = 'rolex',
            min = 1,
            max = 2
        }, {
            item = 'diamond_ring',
            min = 1,
            max = 2
        }, {
            item = 'goldchain',
            min = 1,
            max = 3
        }, {
            item = 'cryptostick',
            min = 1,
            max = 2
        }, {
            item = 'trojan_usb',
            min = 1,
            max = 1
        }, {
            item = 'gatecrack',
            min = 1,
            max = 1
        }, {
            item = 'security_card_01',
            min = 1,
            max = 1
        }, {
            item = 'security_card_02',
            min = 1,
            max = 1
        }, {
            item = 'advancedlockpick',
            min = 1,
            max = 2
        }, {
            item = 'advancedrepairkit',
            min = 1,
            max = 1
        }, {
            item = 'drill',
            min = 1,
            max = 1
        }, {
            item = 'thermite',
            min = 1,
            max = 1
        }, {
            item = 'coke_brick',
            min = 1,
            max = 1
        }, {
            item = 'coke_small_brick',
            min = 1,
            max = 2
        }, {
            item = 'weed_brick',
            min = 1,
            max = 1
        }, {
            item = 'meth',
            min = 1,
            max = 3
        }, {
            item = 'oxy',
            min = 1,
            max = 3
        }, {
            item = 'diving_gear',
            min = 1,
            max = 1
        }, {
            item = 'diving_fill',
            min = 1,
            max = 2
        }, {
            item = 'antipatharia_coral',
            min = 1,
            max = 2
        }, {
            item = 'dendrogyra_coral',
            min = 1,
            max = 2
        }, {
            item = 'armour',
            min = 1,
            max = 2
        }, {
            item = 'nitrous',
            min = 1,
            max = 3
        }, {
            item = 'phone',
            min = 1,
            max = 2
        }, {
            item = 'electronickit',
            min = 1,
            max = 2
        }, {
            item = 'filled_evidence_bag',
            min = 1,
            max = 2
        }, {
            item = 'firstaid',
            min = 1,
            max = 3
        }, {
            item = 'ifaks',
            min = 1,
            max = 3
        }, {
            item = 'cokebaggy',
            min = 1,
            max = 4
        }}
    },

    ------------------------------------------------------------------
    -- 📦 CONTAINER
    ------------------------------------------------------------------
    container = {
        bronze = {{
            item = 'steel',
            min = 1,
            max = 6
        }, {
            item = 'rubber',
            min = 1,
            max = 6
        }, {
            item = 'metalscrap',
            min = 1,
            max = 6
        }, {
            item = 'iron',
            min = 1,
            max = 5
        }, {
            item = 'copper',
            min = 1,
            max = 5
        }, {
            item = 'aluminum',
            min = 1,
            max = 5
        }, {
            item = 'plastic',
            min = 1,
            max = 6
        }, {
            item = 'glass',
            min = 1,
            max = 6
        }, {
            item = 'jerry_can',
            min = 1,
            max = 1
        }, {
            item = 'rolling_paper',
            min = 1,
            max = 4
        }, {
            item = 'empty_weed_bag',
            min = 1,
            max = 4
        }, {
            item = 'weed_nutrition',
            min = 1,
            max = 2
        }, {
            item = 'weed_ak47_seed',
            min = 1,
            max = 3
        }, {
            item = 'weed_skunk_seed',
            min = 1,
            max = 3
        }, {
            item = 'weed_amnesia_seed',
            min = 1,
            max = 3
        }, {
            item = 'weed_og-kush_seed',
            min = 1,
            max = 3
        }, {
            item = 'weed_white-widow_seed',
            min = 1,
            max = 3
        }, {
            item = 'weed_purple-haze_seed',
            min = 1,
            max = 3
        }, {
            item = 'cleaningkit',
            min = 1,
            max = 1
        }, {
            item = 'repairkit',
            min = 1,
            max = 1
        }, {
            item = 'lockpick',
            min = 1,
            max = 2
        }, {
            item = 'radiocell',
            min = 1,
            max = 3
        }, {
            item = 'firework1',
            min = 1,
            max = 1
        }, {
            item = 'firework2',
            min = 1,
            max = 1
        }, {
            item = 'firework3',
            min = 1,
            max = 1
        }, {
            item = 'firework4',
            min = 1,
            max = 1
        }, {
            item = 'walking_stick',
            min = 1,
            max = 1
        }, {
            item = 'lighter',
            min = 1,
            max = 2
        }, {
            item = 'stickynote',
            min = 1,
            max = 3
        }, {
            item = 'painkillers',
            min = 1,
            max = 3
        }},
        silver = {{
            item = 'copper',
            min = 2,
            max = 6
        }, {
            item = 'aluminum',
            min = 2,
            max = 6
        }, {
            item = 'glass',
            min = 2,
            max = 6
        }, {
            item = 'steel',
            min = 2,
            max = 6
        }, {
            item = 'iron',
            min = 2,
            max = 6
        }, {
            item = 'repairkit',
            min = 1,
            max = 2
        }, {
            item = 'lockpick',
            min = 1,
            max = 3
        }, {
            item = 'screwdriverset',
            min = 1,
            max = 1
        }, {
            item = 'electronickit',
            min = 1,
            max = 1
        }, {
            item = 'nitrous',
            min = 1,
            max = 2
        }, {
            item = 'jerry_can',
            min = 1,
            max = 2
        }, {
            item = 'crack_baggy',
            min = 1,
            max = 3
        }, {
            item = 'cokebaggy',
            min = 1,
            max = 3
        }, {
            item = 'xtcbaggy',
            min = 1,
            max = 3
        }, {
            item = 'weed_ak47',
            min = 1,
            max = 3
        }, {
            item = 'weed_skunk',
            min = 1,
            max = 3
        }, {
            item = 'weed_amnesia',
            min = 1,
            max = 3
        }, {
            item = 'weed_og-kush',
            min = 1,
            max = 3
        }, {
            item = 'weed_white-widow',
            min = 1,
            max = 3
        }, {
            item = 'weed_purple-haze',
            min = 1,
            max = 3
        }, {
            item = 'joint',
            min = 1,
            max = 4
        }, {
            item = 'harness',
            min = 1,
            max = 1
        }, {
            item = 'handcuffs',
            min = 1,
            max = 1
        }, {
            item = 'radio',
            min = 1,
            max = 1
        }, {
            item = 'jammer',
            min = 1,
            max = 1
        }, {
            item = 'firstaid',
            min = 1,
            max = 2
        }, {
            item = 'ifaks',
            min = 1,
            max = 2
        }, {
            item = 'binoculars',
            min = 1,
            max = 1
        }, {
            item = 'goldchain',
            min = 1,
            max = 2
        }, {
            item = 'toaster',
            min = 1,
            max = 1
        }},
        gold = {{
            item = 'goldbar',
            min = 2,
            max = 5
        }, {
            item = 'advancedrepairkit',
            min = 1,
            max = 1
        }, {
            item = 'advancedlockpick',
            min = 1,
            max = 2
        }, {
            item = 'drill',
            min = 1,
            max = 1
        }, {
            item = 'thermite',
            min = 1,
            max = 2
        }, {
            item = 'coke_brick',
            min = 1,
            max = 2
        }, {
            item = 'coke_small_brick',
            min = 1,
            max = 3
        }, {
            item = 'weed_brick',
            min = 1,
            max = 2
        }, {
            item = 'meth',
            min = 1,
            max = 4
        }, {
            item = 'oxy',
            min = 1,
            max = 4
        }, {
            item = 'cryptostick',
            min = 1,
            max = 2
        }, {
            item = 'trojan_usb',
            min = 1,
            max = 1
        }, {
            item = 'gatecrack',
            min = 1,
            max = 1
        }, {
            item = 'security_card_01',
            min = 1,
            max = 1
        }, {
            item = 'security_card_02',
            min = 1,
            max = 1
        }, {
            item = 'diving_gear',
            min = 1,
            max = 1
        }, {
            item = 'diving_fill',
            min = 1,
            max = 2
        }, {
            item = 'antipatharia_coral',
            min = 1,
            max = 3
        }, {
            item = 'dendrogyra_coral',
            min = 1,
            max = 3
        }, {
            item = 'nitrous',
            min = 1,
            max = 3
        }, {
            item = 'armour',
            min = 1,
            max = 2
        }, {
            item = 'rolex',
            min = 1,
            max = 2
        }, {
            item = 'diamond_ring',
            min = 1,
            max = 2
        }, {
            item = 'goldchain',
            min = 1,
            max = 3
        }, {
            item = 'filled_evidence_bag',
            min = 1,
            max = 2
        }, {
            item = 'firework4',
            min = 1,
            max = 2
        }, {
            item = 'phone',
            min = 1,
            max = 2
        }, {
            item = 'electronickit',
            min = 1,
            max = 2
        }, {
            item = 'repairkit',
            min = 1,
            max = 3
        }, {
            item = 'xtcbaggy',
            min = 1,
            max = 4
        }}
    },

    ------------------------------------------------------------------
    -- 🔒 ITEMBOX
    ------------------------------------------------------------------
    itembox = {
        bronze = {{
            item = 'lockpick',
            min = 1,
            max = 2
        }, {
            item = 'screwdriverset',
            min = 1,
            max = 1
        }, {
            item = 'electronickit',
            min = 1,
            max = 1
        }, {
            item = 'cleaningkit',
            min = 1,
            max = 1
        }, {
            item = 'repairkit',
            min = 1,
            max = 1
        }, {
            item = 'lighter',
            min = 1,
            max = 2
        }, {
            item = 'painkillers',
            min = 1,
            max = 3
        }, {
            item = 'bandage',
            min = 1,
            max = 4
        }, {
            item = 'stickynote',
            min = 1,
            max = 3
        }, {
            item = 'radiocell',
            min = 1,
            max = 2
        }, {
            item = 'plastic',
            min = 1,
            max = 5
        }, {
            item = 'glass',
            min = 1,
            max = 5
        }, {
            item = 'metalscrap',
            min = 1,
            max = 5
        }, {
            item = 'rubber',
            min = 1,
            max = 5
        }, {
            item = 'iron',
            min = 1,
            max = 4
        }, {
            item = 'copper',
            min = 1,
            max = 4
        }, {
            item = 'rolling_paper',
            min = 1,
            max = 3
        }, {
            item = 'empty_weed_bag',
            min = 1,
            max = 3
        }, {
            item = 'empty_evidence_bag',
            min = 1,
            max = 2
        }, {
            item = 'joint',
            min = 1,
            max = 3
        }, {
            item = 'crack_baggy',
            min = 1,
            max = 2
        }, {
            item = 'cokebaggy',
            min = 1,
            max = 2
        }, {
            item = 'weed_ak47_seed',
            min = 1,
            max = 2
        }, {
            item = 'weed_skunk_seed',
            min = 1,
            max = 2
        }, {
            item = 'weed_amnesia_seed',
            min = 1,
            max = 2
        }, {
            item = 'firework1',
            min = 1,
            max = 1
        }, {
            item = 'firework2',
            min = 1,
            max = 1
        }, {
            item = 'walking_stick',
            min = 1,
            max = 1
        }, {
            item = 'small_tv',
            min = 1,
            max = 1
        }, {
            item = 'toaster',
            min = 1,
            max = 1
        }},
        silver = {{
            item = 'phone',
            min = 1,
            max = 2
        }, {
            item = 'advancedlockpick',
            min = 1,
            max = 1
        }, {
            item = 'electronickit',
            min = 1,
            max = 1
        }, {
            item = 'screwdriverset',
            min = 1,
            max = 1
        }, {
            item = 'cryptostick',
            min = 1,
            max = 1
        }, {
            item = 'gatecrack',
            min = 1,
            max = 1
        }, {
            item = 'binoculars',
            min = 1,
            max = 1
        }, {
            item = 'handcuffs',
            min = 1,
            max = 1
        }, {
            item = 'harness',
            min = 1,
            max = 1
        }, {
            item = 'filled_evidence_bag',
            min = 1,
            max = 1
        }, {
            item = 'radio',
            min = 1,
            max = 1
        }, {
            item = 'jammer',
            min = 1,
            max = 1
        }, {
            item = 'nitrous',
            min = 1,
            max = 2
        }, {
            item = 'jerry_can',
            min = 1,
            max = 1
        }, {
            item = 'firstaid',
            min = 1,
            max = 2
        }, {
            item = 'ifaks',
            min = 1,
            max = 2
        }, {
            item = 'xtcbaggy',
            min = 1,
            max = 3
        }, {
            item = 'meth',
            min = 1,
            max = 2
        }, {
            item = 'oxy',
            min = 1,
            max = 2
        }, {
            item = 'weed_ak47',
            min = 1,
            max = 2
        }, {
            item = 'weed_skunk',
            min = 1,
            max = 2
        }, {
            item = 'weed_amnesia',
            min = 1,
            max = 2
        }, {
            item = 'weed_og-kush',
            min = 1,
            max = 2
        }, {
            item = 'weed_white-widow',
            min = 1,
            max = 2
        }, {
            item = 'weed_purple-haze',
            min = 1,
            max = 2
        }, {
            item = 'goldchain',
            min = 1,
            max = 2
        }, {
            item = 'armour',
            min = 1,
            max = 1
        }, {
            item = 'firework3',
            min = 1,
            max = 1
        }, {
            item = 'firework4',
            min = 1,
            max = 1
        }, {
            item = 'repairkit',
            min = 1,
            max = 1
        }},
        gold = {{
            item = 'diamond_ring',
            min = 1,
            max = 3
        }, {
            item = 'rolex',
            min = 1,
            max = 3
        }, {
            item = 'goldbar',
            min = 1,
            max = 4
        }, {
            item = 'goldchain',
            min = 1,
            max = 3
        }, {
            item = 'trojan_usb',
            min = 1,
            max = 1
        }, {
            item = 'cryptostick',
            min = 1,
            max = 2
        }, {
            item = 'gatecrack',
            min = 1,
            max = 1
        }, {
            item = 'security_card_01',
            min = 1,
            max = 1
        }, {
            item = 'security_card_02',
            min = 1,
            max = 1
        }, {
            item = 'thermite',
            min = 1,
            max = 2
        }, {
            item = 'drill',
            min = 1,
            max = 1
        }, {
            item = 'advancedlockpick',
            min = 1,
            max = 2
        }, {
            item = 'advancedrepairkit',
            min = 1,
            max = 1
        }, {
            item = 'coke_brick',
            min = 1,
            max = 2
        }, {
            item = 'coke_small_brick',
            min = 1,
            max = 3
        }, {
            item = 'weed_brick',
            min = 1,
            max = 2
        }, {
            item = 'meth',
            min = 1,
            max = 4
        }, {
            item = 'oxy',
            min = 1,
            max = 4
        }, {
            item = 'diving_gear',
            min = 1,
            max = 1
        }, {
            item = 'diving_fill',
            min = 1,
            max = 2
        }, {
            item = 'antipatharia_coral',
            min = 1,
            max = 3
        }, {
            item = 'dendrogyra_coral',
            min = 1,
            max = 3
        }, {
            item = 'armour',
            min = 1,
            max = 2
        }, {
            item = 'nitrous',
            min = 1,
            max = 3
        }, {
            item = 'filled_evidence_bag',
            min = 1,
            max = 2
        }, {
            item = 'phone',
            min = 1,
            max = 2
        }, {
            item = 'electronickit',
            min = 1,
            max = 2
        }, {
            item = 'xtcbaggy',
            min = 1,
            max = 4
        }, {
            item = 'cokebaggy',
            min = 1,
            max = 4
        }, {
            item = 'firstaid',
            min = 1,
            max = 3
        }}
    }

}
