import { create } from 'zustand'

export type Tier = 'bronze' | 'silver' | 'gold'
export type AuctionKind = 'storage' | 'container' | 'itembox'
export type Dir = 'gte' | 'lte'

interface UpcomingFiltersState {
  tiers: Tier[]
  kinds: AuctionKind[]
  bidPreset: number | null
  bidDir: Dir
  timePreset: number | null // saat (Upcoming'de)
  timeDir: Dir
  partPreset: number | null
  partDir: Dir
  page: number

  toggleTier: (t: Tier) => void
  toggleKind: (k: AuctionKind) => void
  setBidPreset: (v: number | null) => void
  setBidDir: (d: Dir) => void
  setTimePreset: (v: number | null) => void
  setTimeDir: (d: Dir) => void
  setPartPreset: (v: number | null) => void
  setPartDir: (d: Dir) => void
  clearFilters: () => void
  nextPage: (totalPages: number) => void
  prevPage: () => void
}

export const useUpcomingFiltersStore = create<UpcomingFiltersState>((set) => ({
  tiers: [],
  kinds: [],
  bidPreset: null,
  bidDir: 'gte',
  timePreset: null,
  timeDir: 'gte',
  partPreset: null,
  partDir: 'gte',
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
  setBidDir: (d) => set({ bidDir: d, page: 0 }),
  setTimePreset: (v) => set({ timePreset: v, page: 0 }),
  setTimeDir: (d) => set({ timeDir: d, page: 0 }),
  setPartPreset: (v) => set({ partPreset: v, page: 0 }),
  setPartDir: (d) => set({ partDir: d, page: 0 }),

  clearFilters: () =>
    set({
      tiers: [], kinds: [],
      bidPreset: null, bidDir: 'gte',
      timePreset: null, timeDir: 'gte',
      partPreset: null, partDir: 'gte',
      page: 0,
    }),

  nextPage: (totalPages) => set((s) => ({ page: Math.min(s.page + 1, totalPages - 1) })),
  prevPage: () => set((s) => ({ page: Math.max(s.page - 1, 0) })),
}))