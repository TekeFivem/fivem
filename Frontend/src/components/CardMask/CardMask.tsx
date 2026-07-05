import styles from './CardMask.module.scss'

export type MaskKind = 'victory' | 'defeat' | 'expired'

const LABEL: Record<MaskKind, string> = {
  victory: 'VICTORY',
  defeat: 'DEFEAT',
  expired: 'EXPIRED',
}

// Kartın üstünü kaplar, tüm tıklamaları yakalar (butonlar kilitlenir),
// kart yerinde kalır. JOINED (victory/defeat) ve VAULT (expired) ortak kullanır.
export const CardMask = ({ kind }: { kind: MaskKind }) => (
  <div className={[styles.mask, styles[kind]].join(' ')}>
    <span className={styles.text}>{LABEL[kind]}</span>
  </div>
)