fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'teke_auction'
description 'Auction / Storage tablet (Qbox)'

shared_scripts {
  '@ox_lib/init.lua',
  'shared/config.lua',
}

client_scripts {
  'client/main.lua',
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server/db.lua',
  'server/payouts.lua',
  'server/testsim.lua',
  'server/vault.lua',
  'server/auction.lua',
  'server/hack.lua',
  'server/main.lua',
}
ui_page 'web/build/index.html'

files {
  'web/build/index.html',
  'web/build/**',
}

dependencies {
  'qbx_core',
  'ox_lib',
  'oxmysql',
  'ox_inventory',
}