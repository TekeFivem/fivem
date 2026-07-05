import { create } from 'zustand'
import type { LeaderboardMetric, LeaderboardPeriod } from '../lib/leaderboard'

export interface LeaderboardFiltersState {
  metric: LeaderboardMetric
  period: LeaderboardPeriod
  nameQuery: string
  sortDir: 'asc' | 'desc'
  page: number

  setMetric: (m: LeaderboardMetric) => void
  setPeriod: (p: LeaderboardPeriod) => void
  setNameQuery: (v: string) => void
  setSortDir: (d: 'asc' | 'desc') => void
  clearFilters: () => void
  nextPage: (totalPages: number) => void
  prevPage: () => void
}

export const useLeaderboardFiltersStore = create<LeaderboardFiltersState>((set) => ({
  metric: 'total',
  period: 'all',
  nameQuery: '',
  sortDir: 'desc',
  page: 0,

  setMetric: (m) => set({ metric: m, page: 0 }),
  setPeriod: (p) => set({ period: p, page: 0 }),
  setNameQuery: (v) => set({ nameQuery: v, page: 0 }),
  setSortDir: (d) => set({ sortDir: d, page: 0 }),
  clearFilters: () =>
    set({ metric: 'total', period: 'all', nameQuery: '', sortDir: 'desc', page: 0 }),
  nextPage: (totalPages) => set((s) => ({ page: Math.min(s.page + 1, totalPages - 1) })),
  prevPage: () => set((s) => ({ page: Math.max(s.page - 1, 0) })),
}))

export type LeaderboardFiltersStore = typeof useLeaderboardFiltersStore