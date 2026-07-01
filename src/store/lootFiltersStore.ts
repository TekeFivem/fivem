import { create } from 'zustand'
import type { LootLevel } from '../lib/loot'

export type LootSortKey = 'value' | 'rarity' | 'demand' | null
export type InspectFilter = 'all' | 'yes' | 'no'

export interface LootFiltersState {
  valueLevels: LootLevel[]
  rarityLevels: LootLevel[]
  nameQuery: string
  inspected: InspectFilter
  sortKey: LootSortKey
  sortDir: 'asc' | 'desc'
  page: number

  toggleValue: (l: LootLevel) => void
  toggleRarity: (l: LootLevel) => void
  setNameQuery: (v: string) => void
  setInspected: (v: InspectFilter) => void
  setSortKey: (k: LootSortKey) => void
  setSortDir: (d: 'asc' | 'desc') => void
  clearFilters: () => void
  nextPage: (totalPages: number) => void
  prevPage: () => void
}

export const useLootFiltersStore = create<LootFiltersState>((set) => ({
  valueLevels: [],
  rarityLevels: [],
  nameQuery: '',
  inspected: 'all',
  sortKey: null,
  sortDir: 'desc',
  page: 0,

  toggleValue: (l) =>
    set((s) => ({
      page: 0,
      valueLevels: s.valueLevels.includes(l)
        ? s.valueLevels.filter((x) => x !== l)
        : [...s.valueLevels, l],
    })),
  toggleRarity: (l) =>
    set((s) => ({
      page: 0,
      rarityLevels: s.rarityLevels.includes(l)
        ? s.rarityLevels.filter((x) => x !== l)
        : [...s.rarityLevels, l],
    })),
  setNameQuery: (v) => set({ nameQuery: v, page: 0 }),
  setInspected: (v) => set({ inspected: v, page: 0 }),
  setSortKey: (k) => set({ sortKey: k, page: 0 }),
  setSortDir: (d) => set({ sortDir: d, page: 0 }),
  clearFilters: () =>
    set({
      valueLevels: [],
      rarityLevels: [],
      nameQuery: '',
      inspected: 'all',
      sortKey: null,
      sortDir: 'desc',
      page: 0,
    }),
  nextPage: (totalPages) => set((s) => ({ page: Math.min(s.page + 1, totalPages - 1) })),
  prevPage: () => set((s) => ({ page: Math.max(s.page - 1, 0) })),
}))