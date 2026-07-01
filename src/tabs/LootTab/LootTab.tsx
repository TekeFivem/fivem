import { useState, type CSSProperties } from 'react'
import { LootCard } from '../../components/LootCard/LootCard'
import { LootDetailModal } from '../../components/LootDetailModal/LootDetailModal'
import { LootFilterBar } from './LootFilterBar'
import { useLootFiltersStore } from '../../store/lootFiltersStore'
import { useTabletStore } from '../../store/tabletStore'
import { queryLoot } from '../../hooks/useLootQuery'
import { LOOT_MOCK, type LootItem, type LootLevel } from '../../lib/loot'
import styles from '../../components/AuctionTab/AuctionTab.module.scss'
import grid from './LootTab.module.scss'

// low → mid → high (temizle/tamir bir kademe yükseltir)
const bump = (l: LootLevel): LootLevel => (l === 'low' ? 'mid' : 'high')

export const LootTab = () => {
  const [items, setItems] = useState<LootItem[]>(LOOT_MOCK)
  const [activeId, setActiveId] = useState<string | null>(null)
  const filters = useLootFiltersStore()
  const closeTablet = useTabletStore((s) => s.close)

  const handleInspect = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, inspected: true } : it)))

  const handleClean = (id: string) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, levels: { ...it.levels, clean: bump(it.levels.clean) } } : it,
      ),
    )

  const handleRepair = (id: string) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, levels: { ...it.levels, repair: bump(it.levels.repair) } } : it,
      ),
    )

  const handleSell = (id: string) => {
    // TODO: FiveM tarafı — sisteme/oyuncuya satış + para. Şimdilik listeden kaldır.
    setItems((prev) => prev.filter((it) => it.id !== id))
    setActiveId(null)
  }

  const handleRefresh = () => {
    // TODO: FiveM NUI veri yenileme (fetchNui)
    console.log('refresh loot')
  }

  const { pageItems, totalPages, safePage } = queryLoot(items, filters)
  const activeItem = items.find((it) => it.id === activeId) ?? null

  return (
    <div className={styles.panel} style= {{position: 'relative'}} >
      <LootFilterBar filters={filters} onRefresh={handleRefresh} onClose={closeTablet} />

      <div className={grid.grid} style={{ '--cols': 5 } as CSSProperties}>
        {pageItems.map((item) => (
          <LootCard key={item.id} item={item} onOpen={() => setActiveId(item.id)} />
        ))}
        {pageItems.length === 0 && <div className={styles.empty}>Sonuç yok</div>}
      </div>

      <div className={styles.bottomBar}>
        <button type="button" className={styles.navBtn} onClick={filters.prevPage} disabled={safePage === 0}>
          ‹ Prev
        </button>
        <span className={styles.pageInfo}>{safePage + 1} / {totalPages}</span>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => filters.nextPage(totalPages)}
          disabled={safePage >= totalPages - 1}
        >
          Next ›
        </button>
      </div>

      {activeItem && (
        <LootDetailModal
          item={activeItem}
          onClose={() => setActiveId(null)}
          onInspect={() => handleInspect(activeItem.id)}
          onClean={() => handleClean(activeItem.id)}
          onRepair={() => handleRepair(activeItem.id)}
          onSell={() => handleSell(activeItem.id)}
        />
      )}
    </div>
  )
}