import type { CSSProperties } from 'react'
import styles from './Tab.module.scss'

interface TabProps {
  label: string
  accent: string // bu tab'a özel renk
  active?: boolean
  onClick?: () => void
}

export const Tab = ({ label, accent, active = false, onClick }: TabProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{ '--tab-accent': accent } as CSSProperties}
    className={[styles.tab, active && styles.active].filter(Boolean).join(' ')}
  >
    <span className={styles.stripes}>
      <span className={styles.plate}>
        <span className={styles.label}>{label}</span>
      </span>
    </span>
  </button>
)