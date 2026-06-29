import { useEffect, useState, type CSSProperties } from 'react'

import { SelfStorage } from '../../components/SelfStorage/SelfStorage'
import { Container } from '../../components/Container/Container'
import { ItemBox } from '../../components/ItemBox/ItemBox'
import { RefreshIcon, CloseIcon } from '../../components/icons'
import {
  SegmentedControl,
  type SegmentOption,
} from '../../components/SegmentedControl/SegmentedControl'
import {
  SelectControl,
  type SelectOption,
} from '../../components/SelectControl/SelectControl'
import {
  useUpcomingFiltersStore,
  type Tier,
  type AuctionKind,
  type Dir,
} from '../../store/upcomingFiltersStore'
import { useTabletStore } from '../../store/tabletStore'
import styles from './UpcomingTab.module.scss'

type Item = {
  kind: AuctionKind
  id: string
  name: string
  tier: Tier
  startsIn: string  // başlangıca kalan süre "hh:mm:ss" (2-10 saat)
  bid: number       // başlangıç bid
  reminders: number // reminder'a basan kişi sayısı
}

const MOCK: Item[] = [
  { kind: 'storage',   id: 'u-s1', name: 'STR-21', tier: 'gold',   startsIn: '02:15:00', bid: 5000,  reminders: 12 },
  { kind: 'storage',   id: 'u-s2', name: 'STR-34', tier: 'silver', startsIn: '04:40:00', bid: 2500,  reminders: 6 },
  { kind: 'container', id: 'u-c1', name: 'CNT-D',  tier: 'bronze', startsIn: '03:05:00', bid: 8000,  reminders: 9 },
  { kind: 'container', id: 'u-c2', name: 'CNT-E',  tier: 'gold',   startsIn: '06:30:00', bid: 15000, reminders: 21 },
  { kind: 'itembox',   id: 'u-i1', name: 'TMB-Z',  tier: 'silver', startsIn: '09:10:00', bid: 30000, reminders: 33 },
  { kind: 'itembox',   id: 'u-i2', name: 'TMB-W',  tier: 'bronze', startsIn: '02:50:00', bid: 1200,  reminders: 4 },
  { kind: 'storage',   id: 'u-s3', name: 'STR-08', tier: 'bronze', startsIn: '07:20:00', bid: 3500,  reminders: 2 },
  { kind: 'container', id: 'u-c3', name: 'CNT-F',  tier: 'silver', startsIn: '05:00:00', bid: 9000,  reminders: 14 },
]

const CARD = {
  storage: SelfStorage,
  container: Container,
  itembox: ItemBox,
} as const

const PAGE_SIZE = 6
const ONGOING_THRESHOLD = 2 * 3600 // 2 saat → ongoing'e geçer

const toSeconds = (t: string) => {
  const p = t.split(':').map(Number)
  const [h, m, s] = p.length === 3 ? p : [0, p[0] ?? 0, p[1] ?? 0]
  return h * 3600 + m * 60 + s
}

const fmt = (total: number) => {
  const c = Math.max(0, total)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(c / 3600))}:${pad(Math.floor((c % 3600) / 60))}:${pad(c % 60)}`
}

const TIER_OPTIONS: SegmentOption<Tier>[] = [
  { value: 'bronze', label: 'Bronze', accent: '#e8a866' },
  { value: 'silver', label: 'Silver', accent: '#acffff' },
  { value: 'gold',   label: 'Gold',   accent: '#f3d979' },
]

const KIND_OPTIONS: SegmentOption<AuctionKind>[] = [
  { value: 'storage',   label: 'Storage',   accent: '#46e06b' },
  { value: 'container', label: 'Container', accent: '#3f9bd1' },
  { value: 'itembox',   label: 'Item Box',  accent: '#e0883a' },
]

const DIR_OPTIONS: SelectOption[] = [
  { value: 'gte', label: 'Artan ≥' },
  { value: 'lte', label: 'Azalan ≤' },
]

const BID_OPTIONS: SelectOption[] = [
  { value: '', label: 'Hepsi' },
  { value: '1000', label: '1.000$' },
  { value: '5000', label: '5.000$' },
  { value: '10000', label: '10.000$' },
  { value: '50000', label: '50.000$' },
]

// Süre SAAT bazlı (2-10 saat arası)
const TIME_OPTIONS: SelectOption[] = [
  { value: '', label: 'Hepsi' },
  { value: '2', label: '2 saat' },
  { value: '4', label: '4 saat' },
  { value: '6', label: '6 saat' },
  { value: '8', label: '8 saat' },
  { value: '10', label: '10 saat' },
]

const PART_OPTIONS: SelectOption[] = [
  { value: '', label: 'Hepsi' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '75', label: '75' },
]

export const UpcomingTab = () => {
  const {
    tiers, kinds,
    bidPreset, bidDir,
    timePreset, timeDir,
    partPreset, partDir,
    page,
    toggleTier, toggleKind,
    setBidPreset, setBidDir,
    setTimePreset, setTimeDir,
    setPartPreset, setPartDir,
    clearFilters, nextPage, prevPage,
  } = useUpcomingFiltersStore()

  const closeTablet = useTabletStore((s) => s.close)

  // Ortak saniye sayacı (geri sayım + 2 saat eşiği senkron olsun)
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const handleRefresh = () => {
    // TODO: FiveM NUI veri yenileme (fetchNui)
    console.log('refresh')
  }

  // Her item için canlı kalan süre + 2 saatin altı düşer
  const live = MOCK
    .map((item) => ({
      ...item,
      remainingSec: Math.max(0, toSeconds(item.startsIn) - elapsed),
    }))
    .filter((item) => item.remainingSec > ONGOING_THRESHOLD)

  const filtered = live.filter((item) => {
    const tierOk = tiers.length === 0 || tiers.includes(item.tier)
    const kindOk = kinds.length === 0 || kinds.includes(item.kind)

    const bidOk =
      bidPreset === null ||
      (bidDir === 'gte' ? item.bid >= bidPreset : item.bid <= bidPreset)

    const timeOk =
      timePreset === null ||
      (timeDir === 'gte'
        ? item.remainingSec >= timePreset * 3600
        : item.remainingSec <= timePreset * 3600)

    const partOk =
      partPreset === null ||
      (partDir === 'gte'
        ? item.reminders >= partPreset
        : item.reminders <= partPreset)

    return tierOk && kindOk && bidOk && timeOk && partOk
  })

  // Başlangıcı en yakın olan önce
  const sorted = [...filtered].sort((a, b) => a.remainingSec - b.remainingSec)

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const hasFilters =
    tiers.length > 0 ||
    kinds.length > 0 ||
    bidPreset !== null ||
    timePreset !== null ||
    partPreset !== null

  return (
    <div className={styles.panel}>
      {/* ---- TOP BAR ---- */}
      <div className={styles.topBar}>
        {hasFilters && (
          <div className={styles.cornerLeft}>
            <button type="button" className={styles.clearBtn} onClick={clearFilters} aria-label="Temizle">
              {'CLEAR'.split('').map((ch, i) => (<span key={i}>{ch}</span>))}
            </button>
          </div>
        )}

        <div className={styles.filterStack}>
          <div className={styles.filterRow}>
            <SegmentedControl<Tier> label="Tier" options={TIER_OPTIONS} selected={tiers} onToggle={toggleTier} />
            <span className={styles.divider} />
            <SegmentedControl<AuctionKind> label="Type" options={KIND_OPTIONS} selected={kinds} onToggle={toggleKind} />
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <SelectControl label="Başl. Bid" value={bidPreset === null ? '' : String(bidPreset)} options={BID_OPTIONS} onChange={(v) => setBidPreset(v === '' ? null : Number(v))} />
              <SelectControl value={bidDir} options={DIR_OPTIONS} onChange={(v) => setBidDir(v as Dir)} />
            </div>

            <span className={styles.divider} />

            <div className={styles.filterGroup}>
              <SelectControl label="Süre" value={timePreset === null ? '' : String(timePreset)} options={TIME_OPTIONS} onChange={(v) => setTimePreset(v === '' ? null : Number(v))} />
              <SelectControl value={timeDir} options={DIR_OPTIONS} onChange={(v) => setTimeDir(v as Dir)} />
            </div>

            <span className={styles.divider} />

            <div className={styles.filterGroup}>
              <SelectControl label="Hatırlatan" value={partPreset === null ? '' : String(partPreset)} options={PART_OPTIONS} onChange={(v) => setPartPreset(v === '' ? null : Number(v))} />
              <SelectControl value={partDir} options={DIR_OPTIONS} onChange={(v) => setPartDir(v as Dir)} />
            </div>
          </div>
        </div>

        <div className={styles.cornerActions}>
          <button type="button" className={[styles.iconBtn, styles.closeBtn].join(' ')} aria-label="Kapat" onClick={closeTablet}>
            <CloseIcon />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Yenile" onClick={handleRefresh}>
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* ---- GRID ---- */}
      <div className={styles.grid} style={{ '--cols': 3, '--rows': 2 } as CSSProperties}>
        {pageItems.map((item) => {
          const Card = CARD[item.kind]
          return (
            <Card
              key={item.id}
              variant="upcoming"
              name={item.name}
              tier={item.tier}
              endTime={fmt(item.remainingSec)}
              bid={item.bid}
              participants={item.reminders}
              onRemind={(active) => console.log('remind', item.id, active)}
              onWaypoint={(active) => console.log('waypoint', item.id, active)}
            />
          )
        })}

        {pageItems.length === 0 && (<div className={styles.empty}>Sonuç yok</div>)}
      </div>

      {/* ---- BOTTOM BAR ---- */}
      <div className={styles.bottomBar}>
        <button type="button" className={styles.navBtn} onClick={prevPage} disabled={safePage === 0}>‹ Prev</button>
        <span className={styles.pageInfo}>{safePage + 1} / {totalPages}</span>
        <button type="button" className={styles.navBtn} onClick={() => nextPage(totalPages)} disabled={safePage >= totalPages - 1}>Next ›</button>
      </div>
    </div>
  )
}