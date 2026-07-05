import { formatMoney, formatScore, type LeaderboardMetric } from '../../lib/leaderboard'
import type { RankedEntry } from '../../hooks/useLeaderboardQuery'
import { Avatar } from './Avatar'
import styles from './Leaderboard.module.scss'

export const LeaderboardRow = ({ entry, metric }: { entry: RankedEntry; metric: LeaderboardMetric }) => (
  <div className={styles.row}>
    <span className={styles.rank}>{entry.rank}</span>
    <Avatar name={entry.name} src={entry.avatar} className={styles.rowAvatar} />
    <span className={styles.name}>{entry.name}</span>
    <span className={styles.score}>{formatScore(entry.score, metric)}</span>
    <span className={styles.spent}>{formatMoney(entry.stats.spent)}</span>
  </div>
)