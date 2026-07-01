import type { SelectOption } from '../components/SelectControl/SelectControl'

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all'
export type LeaderboardMetric = 'total' | 'gold' | 'silver' | 'bronze' | 'spent'

export interface LeaderboardStats {
  gold: number
  silver: number
  bronze: number
  spent: number // toplam harcanan para ($)
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string // mock: yoksa baş harf gösterilir
  stats: Record<LeaderboardPeriod, LeaderboardStats>
}

export const totalWins = (s: LeaderboardStats) => s.gold + s.silver + s.bronze

export const metricValue = (s: LeaderboardStats, m: LeaderboardMetric): number => {
  switch (m) {
    case 'gold': return s.gold
    case 'silver': return s.silver
    case 'bronze': return s.bronze
    case 'spent': return s.spent
    default: return totalWins(s)
  }
}

// "12.500$" — proje genelinde kullanılan tr-TR biçimiyle uyumlu
export const formatMoney = (n: number) => `${n.toLocaleString('tr-TR')}$`
export const formatScore = (score: number, metric: LeaderboardMetric) =>
  metric === 'spent' ? formatMoney(score) : String(score)

export const METRIC_OPTIONS: SelectOption[] = [
  { value: 'total', label: 'Toplam Galibiyet' },
  { value: 'gold', label: 'Gold Galibiyet' },
  { value: 'silver', label: 'Silver Galibiyet' },
  { value: 'bronze', label: 'Bronze Galibiyet' },
  { value: 'spent', label: 'Harcama ($)' },
]

export const PERIOD_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tüm Zamanlar' },
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
]

// Auctions'taki DIR_OPTIONS diliyle uyumlu (Inc ≥ / Dec ≤)
export const LB_DIR_OPTIONS: SelectOption[] = [
  { value: 'desc', label: 'Dec ≤' }, // yüksek → düşük (varsayılan liderlik)
  { value: 'asc', label: 'Inc ≥' },
]

/* ---------------- MOCK VERİ ---------------- */
const scale = (s: LeaderboardStats, f: number): LeaderboardStats => ({
  gold: Math.round(s.gold * f),
  silver: Math.round(s.silver * f),
  bronze: Math.round(s.bronze * f),
  spent: Math.round(s.spent * f),
})

const derive = (base: LeaderboardStats): Record<LeaderboardPeriod, LeaderboardStats> => ({
  all: base,
  monthly: scale(base, 0.6),
  weekly: scale(base, 0.25),
  daily: scale(base, 0.08),
})

type Raw = { id: string; name: string; gold: number; silver: number; bronze: number; spent: number }

const RAW: Raw[] = [
  { id: 'p01', name: 'Mike_T',   gold: 18, silver: 12, bronze: 9,  spent: 412500 },
  { id: 'p02', name: 'Kaan_99',  gold: 15, silver: 20, bronze: 11, spent: 388000 },
  { id: 'p03', name: 'Deniz',    gold: 14, silver: 10, bronze: 22, spent: 356200 },
  { id: 'p04', name: 'Berkay',   gold: 12, silver: 18, bronze: 14, spent: 301000 },
  { id: 'p05', name: 'Aria',     gold: 11, silver: 9,  bronze: 8,  spent: 275400 },
  { id: 'p06', name: 'Cem',      gold: 10, silver: 15, bronze: 19, spent: 268900 },
  { id: 'p07', name: 'Elif',     gold: 9,  silver: 7,  bronze: 25, spent: 241000 },
  { id: 'p08', name: 'Sarp',     gold: 9,  silver: 11, bronze: 6,  spent: 233300 },
  { id: 'p09', name: 'Yağmur',   gold: 8,  silver: 13, bronze: 10, spent: 210500 },
  { id: 'p10', name: 'Toprak',   gold: 8,  silver: 6,  bronze: 17, spent: 198700 },
  { id: 'p11', name: 'Ece',      gold: 7,  silver: 9,  bronze: 12, spent: 187600 },
  { id: 'p12', name: 'Baran',    gold: 6,  silver: 14, bronze: 5,  spent: 176200 },
  { id: 'p13', name: 'Melis',    gold: 6,  silver: 5,  bronze: 20, spent: 165400 },
  { id: 'p14', name: 'Efe',      gold: 5,  silver: 8,  bronze: 9,  spent: 154900 },
  { id: 'p15', name: 'Zeynep',   gold: 5,  silver: 4,  bronze: 15, spent: 142100 },
  { id: 'p16', name: 'Arda',     gold: 4,  silver: 10, bronze: 7,  spent: 133800 },
  { id: 'p17', name: 'Nil',      gold: 4,  silver: 3,  bronze: 11, spent: 121500 },
  { id: 'p18', name: 'Kerem',    gold: 3,  silver: 6,  bronze: 8,  spent: 109000 },
  { id: 'p19', name: 'Su',       gold: 3,  silver: 2,  bronze: 13, spent: 97600 },
  { id: 'p20', name: 'Alp',      gold: 2,  silver: 5,  bronze: 4,  spent: 84300 },
  { id: 'p21', name: 'Defne',    gold: 2,  silver: 1,  bronze: 9,  spent: 71200 },
  { id: 'p22', name: 'Poyraz',   gold: 1,  silver: 3,  bronze: 6,  spent: 58800 },
]

export const LEADERBOARD_MOCK: LeaderboardEntry[] = RAW.map(({ id, name, ...s }) => ({
  id,
  name,
  stats: derive(s),
}))