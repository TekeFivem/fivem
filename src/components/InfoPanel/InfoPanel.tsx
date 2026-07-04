import type { AuctionItem } from '../../lib/auctions'
import styles from './InfoPanel.module.scss'

interface Props {
  item: AuctionItem
}

export const InfoPanel = ({ item }: Props) => {
  // TODO: FiveM → sunucudan gerçek veri (eski sahip, içerik notları)
  const prevOwner = item.winner ?? 'Bilinmiyor'
  return (
    <div className={styles.info}>
      <div className={styles.row}>
        <span className={styles.label}>Eski Sahip</span>
        <span className={styles.value}>{prevOwner}</span>
      </div>
      <p className={styles.desc}>
        {item.name} — içerik hakkında sınırlı bilgi. Kazıdıkça ipucu artar.
      </p>
    </div>
  )
}