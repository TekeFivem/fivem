import { create } from 'zustand'
import type { Tier, AuctionKind, Dir } from '../lib/auctions'

export type SortKey = 'bid' | 'time' | 'part' | null

export interface FiltersState {
  tiers: Tier[]
  kinds: AuctionKind[]

  bidPreset: number | null
  bidDir: Dir
  timePreset: number | null // ongoing: dakika, upcoming: saat
  timeDir: Dir
  partPreset: number | null
  partDir: Dir

  nameQuery: string // recent: oyuncu ismi araması

  // aktif sıralama: en son dokunulan sütun + yönü
  sortKey: SortKey
  sortDir: 'asc' | 'desc'

  page: number

  toggleTier: (t: Tier) => void
  toggleKind: (k: AuctionKind) => void
  setBidPreset: (v: number | null) => void
  setBidDir: (d: Dir) => void
  setTimePreset: (v: number | null) => void
  setTimeDir: (d: Dir) => void
  setPartPreset: (v: number | null) => void
  setPartDir: (d: Dir) => void
  setNameQuery: (v: string) => void
  clearFilters: () => void
  nextPage: (totalPages: number) => void
  prevPage: () => void
}

// Dir → sıralama yönü: Inc (gte) = artan, Dec (lte) = azalan
const dirToSort = (d: Dir): 'asc' | 'desc' => (d === 'gte' ? 'asc' : 'desc')

const createFiltersStore = () =>
  create<FiltersState>((set) => ({
    tiers: [],
    kinds: [],
    bidPreset: null,
    bidDir: 'gte',
    timePreset: null,
    timeDir: 'gte',
    partPreset: null,
    partDir: 'gte',
    nameQuery: '',

    sortKey: null, // varsayılan: süreye göre artan (queryAuctions'ta)
    sortDir: 'asc',

    page: 0,

    toggleTier: (t) =>
      set((s) => ({
        page: 0,
        tiers: s.tiers.includes(t) ? s.tiers.filter((x) => x !== t) : [...s.tiers, t],
      })),
    toggleKind: (k) =>
      set((s) => ({
        page: 0,
        kinds: s.kinds.includes(k) ? s.kinds.filter((x) => x !== k) : [...s.kinds, k],
      })),

    setBidPreset: (v) => set({ bidPreset: v, page: 0 }),
    setTimePreset: (v) => set({ timePreset: v, page: 0 }),
    setPartPreset: (v) => set({ partPreset: v, page: 0 }),

    // yön değişince o sütun aktif sıralama olur
    setBidDir: (d) => set({ bidDir: d, sortKey: 'bid', sortDir: dirToSort(d), page: 0 }),
    setTimeDir: (d) => set({ timeDir: d, sortKey: 'time', sortDir: dirToSort(d), page: 0 }),
    setPartDir: (d) => set({ partDir: d, sortKey: 'part', sortDir: dirToSort(d), page: 0 }),

    setNameQuery: (v) => set({ nameQuery: v, page: 0 }),

    clearFilters: () =>
      set({
        tiers: [],
        kinds: [],
        bidPreset: null,
        bidDir: 'gte',
        timePreset: null,
        timeDir: 'gte',
        partPreset: null,
        partDir: 'gte',
        nameQuery: '',
        sortKey: null,
        sortDir: 'asc',
        page: 0,
      }),

    nextPage: (totalPages) => set((s) => ({ page: Math.min(s.page + 1, totalPages - 1) })),
    prevPage: () => set((s) => ({ page: Math.max(s.page - 1, 0) })),
  }))

export const useOngoingFiltersStore = createFiltersStore()
export const useUpcomingFiltersStore = createFiltersStore()
export const useRecentFiltersStore = createFiltersStore()
export const useJoinedFiltersStore = createFiltersStore()

export type FiltersStore = typeof useOngoingFiltersStore