import type { LootItem, LootLevel } from '../../lib/loot'
import { LOOT_FIELDS } from '../../lib/loot'
import {
  DollarIcon, DropIcon, WrenchIcon, InspectIcon, GemIcon, FlameIcon, ShieldIcon,
} from '../icons'
import styles from './LootFields.module.scss'

const FIELD_ICON = {
  value: DollarIcon,
  clean: DropIcon,
  repair: WrenchIcon,
  authentic: InspectIcon,
  rarity: GemIcon,
  demand: FlameIcon,
  legal: ShieldIcon,
} as const

const LEVEL_CLASS: Record<LootLevel, string> = {
  low: styles.low,
  mid: styles.mid,
  high: styles.high,
}

export const LootFields = ({ item }: { item: LootItem }) => (
  <div className={styles.fields}>
    {LOOT_FIELDS.map(({ key, label }) => {
      const Icon = FIELD_ICON[key]
      const colorClass = item.inspected ? LEVEL_CLASS[item.levels[key]] : styles.unknown
      return (
        <div key={key} className={styles.field}>
          <span className={styles.label}>{label}</span>
          <div className={[styles.pips, colorClass].join(' ')}>
            <span className={styles.pip}><Icon /></span>
            <span className={styles.pip}><Icon /></span>
            <span className={styles.pip}><Icon /></span>
          </div>
        </div>
      )
    })}
  </div>
)