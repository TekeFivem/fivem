import type { AuctionItem } from '../../lib/auctions'
import styles from './BidInfo.module.scss'

interface Props {
  item: AuctionItem
}

// TODO: FiveM → sunucudan gerçek veri (fetchNui). Şimdilik mock.
const OWNER = {
  name: 'Marcus Reid',
  wealth: 'Yüksek',        // maddi durum
  visits: 12,              // kaç kere ziyaret etti
  lastSeen: '2 saat önce', // son görülme
  reputation: 'Güvenilir', // itibar / güven
  wonAuctions: 7,          // kazandığı ihale
  risk: 'Düşük',           // risk seviyesi
}

export const BidInfo = ({ item }: Props) => {
  void item // ileride sahibi item'dan gelebilir
  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.avatar}>{OWNER.name.charAt(0)}</span>
        <div className={styles.headText}>
          <span className={styles.name}>{OWNER.name}</span>
          <span className={styles.sub}>Eski Sahip</span>
        </div>
      </div>

      <ul className={styles.rows}>
        <li className={styles.row}><span className={styles.label}>Maddi Durum</span><span className={styles.value}>{OWNER.wealth}</span></li>
        <li className={styles.row}><span className={styles.label}>Ziyaret</span><span className={styles.value}>{OWNER.visits} kez</span></li>
        <li className={styles.row}><span className={styles.label}>Son Görülme</span><span className={styles.value}>{OWNER.lastSeen}</span></li>
        <li className={styles.row}><span className={styles.label}>İtibar</span><span className={styles.value}>{OWNER.reputation}</span></li>
        <li className={styles.row}><span className={styles.label}>Kazandığı</span><span className={styles.value}>{OWNER.wonAuctions} ihale</span></li>
        <li className={styles.row}><span className={styles.label}>Risk</span><span className={styles.value}>{OWNER.risk}</span></li>
      </ul>
    </div>
  )
}