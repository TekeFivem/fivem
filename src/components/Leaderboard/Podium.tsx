import type { CSSProperties } from 'react'
import { formatMoney, formatScore, type LeaderboardMetric } from '../../lib/leaderboard'
import type { RankedEntry } from '../../hooks/useLeaderboardQuery'
import { Avatar } from './Avatar'
import styles from './Leaderboard.module.scss'

// Sıraya göre renk + görsel konum (2 sol · 1 orta/yüksek · 3 sağ)
const PLACE_META = [
  { tier: styles.gold, accent: '#f3d979', order: 2 },
  { tier: styles.silver, accent: '#acffff', order: 1 },
  { tier: styles.bronze, accent: '#e8a866', order: 3 },
]

export const Podium = ({ entries, metric }: { entries: RankedEntry[]; metric: LeaderboardMetric }) => (
  <div className={styles.podium}>
    {entries.map((e, i) => {
      const meta = PLACE_META[i] ?? PLACE_META[2]
      return (
        <div
          key={e.id}
          className={[styles.podiumCard, meta.tier].join(' ')}
          style={{ '--accent': meta.accent, order: meta.order } as CSSProperties}
        >
          
          <Avatar name={e.name} src={e.avatar} className={styles.podiumAvatar} />
          <div className={styles.podiumName}>{e.name}</div>
          <div className={styles.podiumScore}>{formatScore(e.score, metric)}</div>
          {metric !== 'spent' && <div className={styles.podiumSpent}>{formatMoney(e.stats.spent)}</div>}
        </div>
      )
    })}
  </div>
)