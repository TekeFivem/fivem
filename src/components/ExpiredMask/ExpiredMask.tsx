import styles from './ExpiredMask.module.scss'

// Vault kartı süresi dolunca: kartın üstünü kaplar, tüm tıklamaları yakalar
// (Location + Action dahil her şey kilitlenir), kart yerinde kalır.
export const ExpiredMask = () => (
  <div className={styles.mask}>
    <span className={styles.text}>EXPIRED</span>
  </div>
)