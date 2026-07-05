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
  'server/main.lua',
}

ui_page 'Frontend/web/build/index.html'

files {
  'Frontend/web/build/index.html',
  'Frontend/web/build/**',
}

dependencies {
  'qbx_core',
  'ox_lib',
  'oxmysql',
  'ox_inventory',
}