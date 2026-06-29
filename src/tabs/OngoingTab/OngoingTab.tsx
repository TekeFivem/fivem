import type { CSSProperties } from 'react'

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
  useOngoingFiltersStore,
  type Tier,
  type AuctionKind,
  type Dir,
} from '../../store/ongoingFiltersStore'
import { useTabletStore } from '../../store/tabletStore'
import styles from './OngoingTab.module.scss'

type Item = {
  kind: AuctionKind
  id: string
  name: string
  tier: Tier
  endTime: string
  bid: number
  participants: number
}

const MOCK: Item[] = [
  { kind: 'storage', id: 's1', name: 'STR-12', tier: 'gold', endTime: '01:23:45', bid: 10000, participants: 7 },
  { kind: 'storage', id: 's2', name: 'STR-07', tier: 'silver', endTime: '00:41:10', bid: 4500, participants: 3 },
  { kind: 'container', id: 'c1', name: 'CNT-A', tier: 'bronze', endTime: '02:05:30', bid: 8000, participants: 5 },
  { kind: 'container', id: 'c2', name: 'CNT-B', tier: 'silver', endTime: '00:58:00', bid: 12000, participants: 9 },
  { kind: 'itembox', id: 'i1', name: 'TMB-X', tier: 'gold', endTime: '00:12:00', bid: 30000, participants: 18 },
  { kind: 'itembox', id: 'i2', name: 'TMB-Y', tier: 'bronze', endTime: '00:03:40', bid: 750, participants: 1 },
]

const CARD = {
  storage: SelfStorage,
  container: Container,
  itembox: ItemBox,
} as const

const PAGE_SIZE = 6

// "hh:mm:ss" -> saniye
const toSeconds = (t: string) => {
  const p = t.split(':').map(Number)
  const [h, m, s] = p.length === 3 ? p : [0, p[0] ?? 0, p[1] ?? 0]
  return h * 3600 + m * 60 + s
}

const TIER_OPTIONS: SegmentOption<Tier>[] = [
  { value: 'bronze', label: 'Bronze', accent: '#e8a866' },
  { value: 'silver', label: 'Silver', accent: '#acffff' },
  { value: 'gold', label: 'Gold', accent: '#f3d979' },
]

const KIND_OPTIONS: SegmentOption<AuctionKind>[] = [
  { value: 'storage', label: 'Storage', accent: '#46e06b' },
  { value: 'container', label: 'Container', accent: '#3f9bd1' },
  { value: 'itembox', label: 'Item Box', accent: '#e0883a' },
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

const TIME_OPTIONS: SelectOption[] = [
  { value: '', label: 'Hepsi' },
  { value: '1', label: '1 dk' },
  { value: '30', label: '30 dk' },
  { value: '60', label: '60 dk' },
  { value: '90', label: '90 dk' },
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

export const OngoingTab = () => {
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
  } = useOngoingFiltersStore()

  const closeTablet = useTabletStore((s) => s.close)

  const handleRefresh = () => {
    // TODO: FiveM NUI veri yenileme (fetchNui) buraya bağlanacak
    console.log('refresh')
  }

  // ---- filtreleme (eşik: gte = ≥, lte = ≤) ----
  const filtered = MOCK.filter((item) => {
    const tierOk = tiers.length === 0 || tiers.includes(item.tier)
    const kindOk = kinds.length === 0 || kinds.includes(item.kind)

    const bidOk =
      bidPreset === null ||
      (bidDir === 'gte' ? item.bid >= bidPreset : item.bid <= bidPreset)

    const remainingSec = toSeconds(item.endTime)
    const timeOk =
      timePreset === null ||
      (timeDir === 'gte'
        ? remainingSec >= timePreset * 60
        : remainingSec <= timePreset * 60)

    const partOk =
      partPreset === null ||
      (partDir === 'gte'
        ? item.participants >= partPreset
        : item.participants <= partPreset)

    return tierOk && kindOk && bidOk && timeOk && partOk
  })

  // ---- varsayılan sıralama: bitişe en yakın önce ----
  const sorted = [...filtered].sort(
    (a, b) => toSeconds(a.endTime) - toSeconds(b.endTime),
  )

  // ---- sayfalama ----
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = sorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )

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
        {/* sol köşe: Temizle (filtre varken) */}
        {hasFilters && (
          <div className={styles.cornerLeft}>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearFilters}
              aria-label="Temizle"
            >
              {'CLEAR'.split('').map((ch, i) => (
                <span key={i}>{ch}</span>
              ))}
            </button>
          </div>
        )}

        {/* ortalanmış iki satır */}
        <div className={styles.filterStack}>
          {/* üst sıra: Tier + Type */}
          <div className={styles.filterRow}>
            <SegmentedControl<Tier>
              label="Tier"
              options={TIER_OPTIONS}
              selected={tiers}
              onToggle={toggleTier}
            />
            <span className={styles.divider} />
            <SegmentedControl<AuctionKind>
              label="Type"
              options={KIND_OPTIONS}
              selected={kinds}
              onToggle={toggleKind}
            />
          </div>

          {/* alt sıra: Para / Süre / Kişi */}
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <SelectControl
                label="Para"
                value={bidPreset === null ? '' : String(bidPreset)}
                options={BID_OPTIONS}
                onChange={(v) => setBidPreset(v === '' ? null : Number(v))}
              />
              <SelectControl
                value={bidDir}
                options={DIR_OPTIONS}
                onChange={(v) => setBidDir(v as Dir)}
              />
            </div>

            <span className={styles.divider} />

            <div className={styles.filterGroup}>
              <SelectControl
                label="Süre"
                value={timePreset === null ? '' : String(timePreset)}
                options={TIME_OPTIONS}
                onChange={(v) => setTimePreset(v === '' ? null : Number(v))}
              />
              <SelectControl
                value={timeDir}
                options={DIR_OPTIONS}
                onChange={(v) => setTimeDir(v as Dir)}
              />
            </div>

            <span className={styles.divider} />

            <div className={styles.filterGroup}>
              <SelectControl
                label="Kişi"
                value={partPreset === null ? '' : String(partPreset)}
                options={PART_OPTIONS}
                onChange={(v) => setPartPreset(v === '' ? null : Number(v))}
              />
              <SelectControl
                value={partDir}
                options={DIR_OPTIONS}
                onChange={(v) => setPartDir(v as Dir)}
              />
            </div>
          </div>
        </div>

        {/* sağ köşe: X üstte, refresh altta */}
        <div className={styles.cornerActions}>
          <button
            type="button"
            className={[styles.iconBtn, styles.closeBtn].join(' ')}
            aria-label="Kapat"
            onClick={closeTablet}
          >
            <CloseIcon />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Yenile"
            onClick={handleRefresh}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* ---- GRID ---- */}
      <div
        className={styles.grid}
        style={{ '--cols': 3, '--rows': 2 } as CSSProperties}
      >
        {pageItems.map((item) => {
          const Card = CARD[item.kind]
          return (
            <Card
              key={item.id}
              name={item.name}
              tier={item.tier}
              endTime={item.endTime}
              bid={item.bid}
              participants={item.participants}
              onJoin={() => console.log('join', item.id)}
              onWaypoint={(active) => console.log('waypoint', item.id, active)}
            />
          )
        })}

        {pageItems.length === 0 && (
          <div className={styles.empty}>Sonuç yok</div>
        )}
      </div>

      {/* ---- BOTTOM BAR ---- */}
      <div className={styles.bottomBar}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={prevPage}
          disabled={safePage === 0}
        >
          ‹ Prev
        </button>

        <span className={styles.pageInfo}>
          {safePage + 1} / {totalPages}
        </span>

        <button
          type="button"
          className={styles.navBtn}
          onClick={() => nextPage(totalPages)}
          disabled={safePage >= totalPages - 1}
        >
          Next ›
        </button>
      </div>
    </div>
  )
}