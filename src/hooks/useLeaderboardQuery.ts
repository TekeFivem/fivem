import { metricValue, type LeaderboardEntry, type LeaderboardMetric, type LeaderboardStats } from '../lib/leaderboard'
import type { LeaderboardFiltersState } from '../store/leaderboardFiltersStore'

export const LB_PAGE_SIZE = 7 // podyum dışındaki liste satır sayısı (scroll yok)

export interface RankedEntry {
  id: string
  name: string
  avatar?: string
  stats: LeaderboardStats
  score: number
  rank: number
  metric: LeaderboardMetric
}

export const queryLeaderboard = (entries: LeaderboardEntry[], f: LeaderboardFiltersState) => {
  const q = f.nameQuery.trim().toLowerCase()
  const searching = q !== ''

  const resolved = entries
    .map((e) => {
      const stats = e.stats[f.period]
      return {
        id: e.id,
        name: e.name,
        avatar: e.avatar,
        stats,
        score: metricValue(stats, f.metric),
        metric: f.metric,
      }
    })
    .filter((e) => q === '' || e.name.toLowerCase().includes(q))

  const sorted = [...resolved].sort((a, b) =>
    f.sortDir === 'asc' ? a.score - b.score : b.score - a.score,
  )

  const ranked: RankedEntry[] = sorted.map((r, i) => ({ ...r, rank: i + 1 }))

  // Aramada podyum gösterilmez; tüm eşleşenler listede
  const podium = searching ? [] : ranked.slice(0, 3)
  const rest = searching ? ranked : ranked.slice(3)

  const totalPages = Math.max(1, Math.ceil(rest.length / LB_PAGE_SIZE))
  const safePage = Math.min(f.page, totalPages - 1)
  const pageItems = rest.slice(safePage * LB_PAGE_SIZE, safePage * LB_PAGE_SIZE + LB_PAGE_SIZE)

  return { podium, pageItems, totalPages, safePage, totalCount: ranked.length }
}