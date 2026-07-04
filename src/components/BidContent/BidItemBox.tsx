import type { Tier } from '../../lib/auctions'
import styles from './BidItemBox.module.scss'

interface Props {
  tier?: Tier
}

// 3D item box (perspective) — dış alanı doldurur, küp içte küçük ve ortalı.
export const BidItemBox = ({ tier = 'silver' }: Props) => (
  <div className={[styles.wrap, styles[tier]].join(' ')}>
    <div className={styles.box}>
      <span className={[styles.face, styles.front].join(' ')}>?</span>
      <span className={[styles.face, styles.back].join(' ')}>?</span>
      <span className={[styles.face, styles.right].join(' ')}>?</span>
      <span className={[styles.face, styles.left].join(' ')}>?</span>
      <span className={[styles.face, styles.top].join(' ')}>?</span>
      <span className={[styles.face, styles.bottom].join(' ')}>?</span>
    </div>
  </div>
)