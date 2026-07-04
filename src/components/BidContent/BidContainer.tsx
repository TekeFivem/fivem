import type { Tier } from '../../lib/auctions'
import styles from './BidContainer.module.scss'

interface Props {
  tier?: Tier
}

// Metal konteyner + dikey kilit çubuklu kapılar — bağımsız, sadece görsel.
export const BidContainer = ({ tier = 'silver' }: Props) => (
  <div className={[styles.container, styles[tier]].join(' ')}>
    <div className={styles.railTop} />
    <div className={styles.railBottom} />
    <div className={styles.doors}>
      <span className={styles.seam} />
      <span className={[styles.rod, styles.rod1].join(' ')} />
      <span className={[styles.rod, styles.rod2].join(' ')} />
      <span className={[styles.rod, styles.rod3].join(' ')} />
      <span className={[styles.rod, styles.rod4].join(' ')} />
    </div>
  </div>
)