import type { SegmentOption } from '../components/SegmentedControl/SegmentedControl'
import type { SelectOption } from '../components/SelectControl/SelectControl'

export type Tier = 'bronze' | 'silver' | 'gold'
export type AuctionKind = 'storage' | 'container' | 'itembox'
export type Dir = 'gte' | 'lte' // artan = gte (≥), azalan = lte (≤)
export type Variant = 'ongoing' | 'upcoming' | 'recent' | 'joined'

export interface AuctionItem {
  kind: AuctionKind
  id: string
  name: string
  tier: Tier
  endTime: string // "hh:mm:ss"
  bid: number
  participants: number
  winner?: string // recent/joined(sonuçlu): kazanan
  paid?: number   // recent/joined(sonuçlu): ödenen para
  result?: 'won' | 'lost' // joined: sonuç → recent görünüm + VICTORY/DEFEAT
  decidedAt?: number // joined: sonucun belli olduğu an (sıralama için)
}
export interface AuctionCardProps {
  name: string
  tier?: Tier
  endTime: string
  bid: number
  participants: number
  variant?: Variant
  winner?: string // recent/joined(sonuçlu): kazanan
  paid?: number   // recent/joined(sonuçlu): ödenen para
  result?: 'won' | 'lost' // joined: sonuç → recent görünüm + VICTORY/DEFEAT
  onRemind?: (active: boolean) => void
  onJoin?: () => void
  onInspect?: () => void // recent / joined(sonuçlu)
  onBid?: () => void      // joined(sonuçsuz): Bid butonu
  /** pusula aktif olunca tetiklenir (ileride waypoint set) */
  onWaypoint?: (active: boolean) => void
}

// "hh:mm:ss" -> saniye
export const toSeconds = (t: string) => {
  const p = t.split(':').map(Number)
  const [h, m, s] = p.length === 3 ? p : [0, p[0] ?? 0, p[1] ?? 0]
  return h * 3600 + m * 60 + s
}

export const formatHMS = (total: number) => {
  const c = Math.max(0, total)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(c / 3600))}:${pad(Math.floor((c % 3600) / 60))}:${pad(c % 60)}`
}

export const TIER_OPTIONS: SegmentOption<Tier>[] = [
  { value: 'bronze', label: 'Bronze', accent: '#e8a866' },
  { value: 'silver', label: 'Silver', accent: '#acffff' },
  { value: 'gold', label: 'Gold', accent: '#f3d979' },
]

export const KIND_OPTIONS: SegmentOption<AuctionKind>[] = [
  { value: 'storage', label: 'Storage', accent: '#46e06b' },
  { value: 'container', label: 'Container', accent: '#3f9bd1' },
  { value: 'itembox', label: 'Item Box', accent: '#e0883a' },
]

export const DIR_OPTIONS: SelectOption[] = [
  { value: 'gte', label: 'Inc ≥' },
  { value: 'lte', label: 'Dec ≤' },
]

export const BID_OPTIONS: SelectOption[] = [
  { value: '', label: 'All' },
  { value: '1000', label: '1.000$' },
  { value: '5000', label: '5.000$' },
  { value: '10000', label: '10.000$' },
  { value: '50000', label: '50.000$' },
]

export const PART_OPTIONS: SelectOption[] = [
  { value: '', label: 'All' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '75', label: '75' },
]

// Ongoing: dakika bazlı
export const ONGOING_TIME_OPTIONS: SelectOption[] = [
  { value: '', label: 'All' },
  { value: '1', label: '1 dk' },
  { value: '30', label: '30 dk' },
  { value: '60', label: '60 dk' },
  { value: '90', label: '90 dk' },
]

// Upcoming: saat bazlı (2–10 saat)
export const UPCOMING_TIME_OPTIONS: SelectOption[] = [
  { value: '', label: 'All' },
  { value: '2', label: '2 saat' },
  { value: '4', label: '4 saat' },
  { value: '6', label: '6 saat' },
  { value: '8', label: '8 saat' },
  { value: '10', label: '10 saat' },
]

