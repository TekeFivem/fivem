import type { Tier } from '../../lib/auctions'
import styles from './BidStorage.module.scss'

interface Props {
  tier?: Tier
}

// Metal duvar + kepenk kapı — bağımsız, sadece görsel. Kapsayıcısını doldurur.
export const BidStorage = ({ tier = 'silver' }: Props) => (
  <div className={[styles.wall, styles[tier]].join(' ')}>
    <div className={styles.door} />
  </div>
)