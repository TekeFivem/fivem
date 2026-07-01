import type { LootItem, LootLevel } from '../../lib/loot'
import styles from './LootImage.module.scss'

// clean düşük = çok kirli, repair düşük = çok kırık
const GRIME: Record<LootLevel, number> = { low: 0.85, mid: 0.45, high: 0 }
const DUST:  Record<LootLevel, number> = { low: 0.5,  mid: 0.28, high: 0 }
const CRACK: Record<LootLevel, number> = { low: 0.9,  mid: 0.45, high: 0 }
const FILTER: Record<LootLevel, string> = {
  low:  'sepia(0.5) contrast(1.2) brightness(0.82) saturate(0.85)',
  mid:  'sepia(0.22) contrast(1.06) brightness(0.94)',
  high: 'none',
}

export const LootImage = ({ item }: { item: LootItem }) => {
  const grime = GRIME[item.levels.clean]
  const dust = DUST[item.levels.clean]
  const crack = CRACK[item.levels.repair]

  const mask = {
    WebkitMaskImage: `url("${item.image}")`,
    maskImage: `url("${item.image}")`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'cover',
    maskSize: 'cover',
  }

  return (
    <>
      <img
        className={styles.img}
        src={item.image}
        alt={item.name}
        style={{ filter: FILTER[item.levels.clean] }}
      />

      {dust > 0 && (
        <span
          className={styles.dust}
          style={{ ...mask, opacity: dust }}
        />
      )}

      {grime > 0 && (
        <span
          className={styles.grime}
          style={{ ...mask, opacity: grime }}
        />
      )}

      {crack > 0 && (
        <svg
          className={styles.crack}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ ...mask, opacity: crack }}
        >
          <g fill="none" stroke="#0b0c0f" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M50 6 L45 28 L55 44 L43 60 L53 76 L47 96" />
            <path d="M45 28 L26 22 M45 28 L62 18" />
            <path d="M55 44 L78 42 M55 44 L34 50" />
            <path d="M43 60 L20 64 M43 60 L66 70" />
            <path d="M53 76 L74 84 M53 76 L30 86" />
          </g>
          <g fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4">
            <path d="M50 6 L45 28 L55 44 L43 60 L53 76 L47 96" />
          </g>
        </svg>
      )}
    </>
  )
}
