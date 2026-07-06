import { useRef, type CSSProperties } from 'react'

import { SelfStorage } from '../SelfStorage/SelfStorage'
import { Container } from '../Container/Container'
import { ItemBox } from '../ItemBox/ItemBox'
import { FilterBar } from './FilterBar'
import { useTabletStore } from '../../store/tabletStore'
import { useJoinedStore } from '../../store/joinedStore'
import { useNow } from '../../hooks/useNow'
import { queryAuctions } from '../../hooks/useAuctionQuery'
import type { AuctionItem, Variant } from '../../lib/auctions'
import type { FiltersStore } from '../../store/createFiltersStore'
import type { SelectOption } from '../SelectControl/SelectControl'
import styles from './AuctionTab.module.scss'

const CARD = { storage: SelfStorage, container: Container, itembox: ItemBox } as const

export interface AuctionTabProps {
  items: AuctionItem[]
  store: FiltersStore
  variant: Variant
  timeOptions?: SelectOption[]
  timeUnitSeconds: number
  thresholdSec?: number
  labels?: { bid?: string; part?: string }
  searchByName?: boolean
  onAction?: (item: AuctionItem) => void
  onJoin?: (item: AuctionItem) => void
  serverPaged?: boolean
  serverTotalPages?: number
}

export const AuctionTab = ({
  items, store, variant, timeOptions, timeUnitSeconds, thresholdSec, labels, searchByName,serverPaged,serverTotalPages,
  onAction, onJoin,
}: AuctionTabProps) => {
  // --- HOOK'LAR: her render'da aynı sırada, koşulsuz ---
  const live = thresholdSec != null
  const now = useNow(live)
  const closeTablet = useTabletStore((s) => s.close)
  const join = useJoinedStore((s) => s.join)
  const filters = store()
  const deadlines = useRef<Map<string, number>>(new Map())

  const handleRefresh = () => {
    // TODO: FiveM NUI veri yenileme (fetchNui) buraya bağlanacak
    console.log('refresh', variant)
  }

  // --- SAF HESAP: hook yok ---
  const { pageItems, totalPages, safePage } = serverPaged
    ? {
      pageItems: items,
      totalPages: Math.max(1, serverTotalPages ?? 1),
      safePage: Math.min(filters.page, Math.max(0, (serverTotalPages ?? 1) - 1)),
    }
    : queryAuctions(items, filters, {
      timeUnitSeconds, thresholdSec, now,
      deadlines: deadlines.current,
      groupDecidedLast: variant === 'joined',
    })

  return (
    <div className={styles.panel}>
      <FilterBar
        filters={filters}
        timeOptions={timeOptions}
        labels={labels}
        onRefresh={handleRefresh}
        onClose={closeTablet}
        searchByName={searchByName}
      />

      <div className={styles.grid} style={{ '--cols': 3, '--rows': 2 } as CSSProperties}>
        {pageItems.map((item) => {
          const Card = CARD[item.kind]
          return (
            <div key={item.id} className={styles.cardWrap}>
              <Card
                name={item.name}
                tier={item.tier}
                endTime={item.endTime}
                bid={item.bid}
                participants={item.participants}
                variant={variant}
                winner={item.winner}
                paid={item.paid}
                result={item.result}
                onInspect={() => onJoin?.(item)}
                onJoin={() => { join(item); onJoin?.(item) }}
                onBid={() => onJoin?.(item)}
                onRemind={(active) => console.log('remind', item.id, active)}
                onWaypoint={(active) => console.log('waypoint', item.id, active)}
                onAction={() => (onAction ? onAction(item) : console.log('action', item.id))}
              />
            </div>
          )
        })}

        {pageItems.length === 0 && <div className={styles.empty}>Sonuç yok</div>}
      </div>

      <div className={styles.bottomBar}>
        <button type="button" className={styles.navBtn} onClick={filters.prevPage} disabled={safePage === 0}>
          ‹ Prev
        </button>
        <span className={styles.pageInfo}>
          {safePage + 1} / {totalPages}
        </span>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => filters.nextPage(totalPages)}
          disabled={safePage >= totalPages - 1}
        >
          Next ›
        </button>
      </div>
    </div>
  )
}