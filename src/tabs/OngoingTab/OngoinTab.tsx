import type { CSSProperties } from 'react'

import { SelfStorage } from '../../components/SelfStorage/SelfStorage'
import { Container } from '../../components/Container/Container'
import { ItemBox } from '../../components/ItemBox/ItemBox'   // 👈 yeni
import styles from './OngoingTab.module.scss'

type Tier = 'bronze' | 'silver' | 'gold'

type Item = {
  kind: 'storage' | 'container' | 'itembox'   // 👈 itembox eklendi
  id: string
  name: string
  tier: Tier
  endTime: string
  bid: number
  participants: number
}

const MOCK: Item[] = [
  { kind: 'storage',   id: 's1', name: 'STR-12', tier: 'gold',   endTime: '01:23:45', bid: 10000, participants: 7 },
  { kind: 'storage',   id: 's2', name: 'STR-07', tier: 'silver', endTime: '00:41:10', bid: 4500,  participants: 3 },
  { kind: 'container', id: 'c1', name: 'CNT-A', tier: 'bronze', endTime: '02:05:30', bid: 8000,  participants: 5 },
  { kind: 'container', id: 'c2', name: 'CNT-B', tier: 'silver', endTime: '00:58:00', bid: 12000, participants: 9 },
  { kind: 'itembox',   id: 'i1', name: 'TMB-X',  tier: 'gold',   endTime: '00:12:00', bid: 30000, participants: 18 },
  { kind: 'itembox',   id: 'i2', name: 'TMB-Y',  tier: 'bronze', endTime: '00:03:40', bid: 750,   participants: 1 },
]

// kind -> component eşlemesi (props üçünde de aynı olduğu için tek yerden seçiyoruz)
const CARD = {
  storage: SelfStorage,
  container: Container,
  itembox: ItemBox,
} as const

export const OngoingTab = () => {
  return (
    <div className={styles.panel}>
      <div className={styles.topBar}>{/* filtreler */}</div>

      <div className={styles.grid} style={{ '--cols': 3, '--rows': 2 } as CSSProperties}>
        {MOCK.map((item) => {
          const Card = CARD[item.kind]
          return (
            <Card
              key={item.id}
              name={item.name}
              tier={item.tier}
              endTime={item.endTime}
              bid={item.bid}
              participants={item.participants}
              onJoin={() => console.log('join', item.id)}
              onWaypoint={(active) => console.log('waypoint', item.id, active)}
            />
          )
        })}
      </div>

      <div className={styles.bottomBar}>{/* prev / next */}</div>
    </div>
  )
}