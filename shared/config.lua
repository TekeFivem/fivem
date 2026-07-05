Config = {}

Config.Item = 'auction_tablet'      -- ox_inventory item adı
Config.FinalPhaseSeconds = 10
Config.Tiers = {
  bronze = { minBid = 150 },
  silver = { minBid = 300 },
  gold   = { minBid = 600 },
}
Config.Scratch = { cellCount = 6, baseCost = 250, growth = 1.6, pool = { 'phone', 'tv', 'laptop', 'watch' } }
Config.Hack = {
  traceSteps = { 5, 10, 25, 45, 70, 100 },
  cleanCost = 2000,
  cost = { double = 1000, jam = 1200, blackout = 800, deanon = 1500, spoof = 600, freeze = 900 },
}