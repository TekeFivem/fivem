import type { LootItem, LootLevel } from '../../lib/loot'
import { DollarIcon } from '../icons'
import { LootImage } from '../LootImage/LootImage'
import styles from './LootCard.module.scss'

const LEVEL_CLASS: Record<LootLevel, string> = {
  low: styles.low,
  mid: styles.mid,
  high: styles.high,
}

export const LootCard = ({ item, onOpen }: { item: LootItem; onOpen?: () => void }) => {
  const valueClass = item.inspected ? LEVEL_CLASS[item.levels.value] : styles.unknown
  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <div className={styles.thumb}>
        <LootImage item={item} />
        <span className={styles.name}>{item.name}</span>
      </div>
      <div className={[styles.value, valueClass].join(' ')}>
        <span className={styles.pip}><DollarIcon /></span>
        <span className={styles.pip}><DollarIcon /></span>
        <span className={styles.pip}><DollarIcon /></span>
      </div>
    </button>
  )
}