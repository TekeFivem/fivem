import type { ReactNode } from 'react'
import { RefreshIcon, CloseIcon } from '../icons'
import styles from '../AuctionTab/AuctionTab.module.scss'

interface Props {
  hasFilters: boolean
  onClear: () => void
  onRefresh: () => void
  onClose: () => void
  className?: string
  children: ReactNode // filtre satırları (styles.filterRow içinde FilterField'lar)
}

export const FilterBarShell = ({ hasFilters, onClear, onRefresh, onClose, className, children }: Props) => (
  <div className={[styles.topBar, className].filter(Boolean).join(' ')}>
    {hasFilters && (
      <div className={styles.cornerLeft}>
        <button type="button" className={styles.clearBtn} onClick={onClear} aria-label="Temizle">
          {'CLEAR'.split('').map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </button>
      </div>
    )}

    <div className={styles.filterStack}>{children}</div>

    <div className={styles.cornerActions}>
      <button type="button" className={[styles.iconBtn, styles.closeBtn].join(' ')} aria-label="Kapat" onClick={onClose}>
        <CloseIcon />
      </button>
      <button type="button" className={styles.iconBtn} aria-label="Yenile" onClick={onRefresh}>
        <RefreshIcon />
      </button>
    </div>
  </div>
)