import type { CSSProperties } from 'react'

import styles from './OngoingTab.module.scss'
import { SelfStorage, type StorageTier } from '../../components/SelfStorage/SelfStorage'

const TIERS: StorageTier[] = ['bronze', 'silver', 'gold']

// geçici örnek veri — sonra store/NUI'den gelecek
const MOCK = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  name: `Unit ${i + 1}`,
  tier: TIERS[i % 3],
  endTime: '01:23:45',
  bid: [1000, 10000, 250000][i % 3],
  participants: 3 + i,
}))

export const OngoingTab = () => (
  <div className={styles.panel}>
    {/* TAB'A ÖZEL TOP BAR (filtreler) */}
    <div className={styles.topBar}>{/* tier filtre, arama vs. buraya */}</div>

    {/* 4 column x 3 row grid (ayarlanabilir) */}
    <div className={styles.grid} style={{ '--cols': 3, '--rows': 2 } as CSSProperties}>
      {MOCK.map((u) => (
        <SelfStorage
          key={u.id}
          name={u.name}
          tier={u.tier}
          endTime={u.endTime}
          bid={u.bid}
          participants={u.participants}
          onJoin={() => console.log('join', u.id)}
          onWaypoint={(active) => console.log('waypoint', u.id, active)}
        />
      ))}
    </div>

    {/* TAB'A ÖZEL BOTTOM BAR (prev / next navigasyon) */}
    <div className={styles.bottomBar}>{/* « Prev | sayfa | Next » buraya */}</div>
  </div>
)