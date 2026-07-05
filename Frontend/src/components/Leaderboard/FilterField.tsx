import type { ReactNode } from 'react'
import styles from './Leaderboard.module.scss'

// Etiket + kontrolü tek bir metal tabelada birleştirir
export const FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    <span className={styles.fieldGroove} />
    <div className={styles.fieldControl}>{children}</div>
  </div>
)