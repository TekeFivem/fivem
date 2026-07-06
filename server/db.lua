Db = {}

local function remainingStr(endTime)
  local rem = math.max(0, (endTime or 0) - os.time())
  return string.format('%02d:%02d:%02d', math.floor(rem/3600), math.floor((rem%3600)/60), rem%60)
end

local function rowToItem(row)
  return {
    id = tostring(row.id),
    kind = row.kind,
    name = row.name,
    tier = row.tier,
    bid = (row.current_price and row.current_price > 0) and row.current_price or row.base_bid,
    endTime = remainingStr(row.end_time),
    participants = row.participants or 0,
    winner = row.winner_name,
    paid = row.paid,
  }
end

-- Canlı listeler (bounded) → snapshot
function Db.GetSnapshot()
  local rows = MySQL.query.await([[
    SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants
    FROM auctions a WHERE a.status IN ('upcoming','open','final') ORDER BY a.end_time ASC
  ]])
  local ongoing, upcoming = {}, {}
  for _, r in ipairs(rows or {}) do
    local item = rowToItem(r)
    if r.status == 'upcoming' then upcoming[#upcoming+1] = item else ongoing[#ongoing+1] = item end
  end
  return { ongoing = ongoing, upcoming = upcoming }
end

-- Tek item (delta yayını için)
function Db.GetOne(id)
  local rows = MySQL.query.await([[
    SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants
    FROM auctions a WHERE a.id = ?
  ]], { id })
  return (rows and rows[1]) and rowToItem(rows[1]) or nil
end

-- Recent → sunucu-tarafı pagination + filtre
function Db.GetRecentPage(f)
  f = f or {}
  local pageSize = f.pageSize or Config.PageSize
  local page = math.max(0, f.page or 0)

  local where, params = { "status = 'ended'" }, {}

  if f.tiers and #f.tiers > 0 then
    local m = {}
    for _, t in ipairs(f.tiers) do m[#m+1] = '?'; params[#params+1] = t end
    where[#where+1] = 'tier IN (' .. table.concat(m, ',') .. ')'
  end
  if f.kinds and #f.kinds > 0 then
    local m = {}
    for _, k in ipairs(f.kinds) do m[#m+1] = '?'; params[#params+1] = k end
    where[#where+1] = 'kind IN (' .. table.concat(m, ',') .. ')'
  end
  if f.bidPreset then
    where[#where+1] = (f.bidDir == 'lte') and 'paid <= ?' or 'paid >= ?'
    params[#params+1] = f.bidPreset
  end
  if f.nameQuery and f.nameQuery ~= '' then
    where[#where+1] = '(name LIKE ? OR winner_name LIKE ?)'
    params[#params+1] = '%' .. f.nameQuery .. '%'
    params[#params+1] = '%' .. f.nameQuery .. '%'
  end

  local whereSql = table.concat(where, ' AND ')

  local totalRow = MySQL.query.await('SELECT COUNT(*) AS c FROM auctions WHERE ' .. whereSql, params)
  local total = (totalRow and totalRow[1] and totalRow[1].c) or 0

  local col = ({ bid = 'paid', part = 'participants', time = 'end_time' })[f.sortKey] or 'end_time'
  local dir = (f.sortDir == 'asc') and 'ASC' or 'DESC'  -- varsayılan: en yeni biten önce (DESC)

  local qp = {}
  for i = 1, #params do qp[i] = params[i] end
  qp[#qp+1] = pageSize
  qp[#qp+1] = page * pageSize

  local rows = MySQL.query.await(
    ('SELECT a.*, (SELECT COUNT(*) FROM auction_participants p WHERE p.auction_id=a.id) AS participants ' ..
     'FROM auctions a WHERE %s ORDER BY %s %s LIMIT ? OFFSET ?'):format(whereSql, col, dir), qp)

  local items = {}
  for _, r in ipairs(rows or {}) do items[#items+1] = rowToItem(r) end
  return { items = items, total = total }
end

function Db.CreateAuction(d)
  local now = os.time()
  local endTime = now + (d.duration or 3600)
  local status = (endTime - now > Config.GoLiveSeconds) and 'upcoming' or 'open'
  local id = MySQL.insert.await([[
    INSERT INTO auctions (kind, name, tier, base_bid, current_price, start_time, end_time, status)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?)
  ]], { d.kind, d.name, d.tier, d.base_bid, now, endTime, status })
  return id, status
end

function Db.CountActive()
  local r = MySQL.query.await("SELECT COUNT(*) AS c FROM auctions WHERE status IN ('upcoming','open','final')")
  return (r and r[1] and r[1].c) or 0
end