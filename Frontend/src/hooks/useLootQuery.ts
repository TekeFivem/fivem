import type { LootItem, LootLevel } from '../lib/loot'
import type { LootFiltersState } from '../store/lootFiltersStore'

const PAGE_SIZE = 10 // 4 sütun × 2 satır
const LEVEL_RANK: Record<LootLevel, number> = { low: 1, mid: 2, high: 3 }

export const queryLoot = (items: LootItem[], f: LootFiltersState) => {
  const q = f.nameQuery.trim().toLowerCase()

  const filtered = items.filter((it) => {
    const valueOk = f.valueLevels.length === 0 || f.valueLevels.includes(it.levels.value)
    const rarityOk = f.rarityLevels.length === 0 || f.rarityLevels.includes(it.levels.rarity)
    const nameOk = q === '' || it.name.toLowerCase().includes(q)
    const inspectedOk =
      f.inspected === 'all' || (f.inspected === 'yes' ? !!it.inspected : !it.inspected)
    return valueOk && rarityOk && nameOk && inspectedOk
  })

  const sorted = [...filtered].sort((a, b) => {
    if (!f.sortKey) return 0
    const ra = LEVEL_RANK[a.levels[f.sortKey]]
    const rb = LEVEL_RANK[b.levels[f.sortKey]]
    return f.sortDir === 'asc' ? ra - rb : rb - ra
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(f.page, totalPages - 1)
  const pageItems = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  return { pageItems, totalPages, safePage }
}