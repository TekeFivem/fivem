import type { ReactNode } from 'react'
import { HazardSign } from '../HazardSign/HazardSign'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  /** Tabela altındaki nav öğeleri vb. */
  children?: ReactNode
}

export const Sidebar = ({ children }: SidebarProps) => (
  <aside className={styles.sidebar}>
    <div className={styles.header}>
      <HazardSign label="Auctions" />
    </div>
    <nav className={styles.nav}>{children}</nav>
  </aside>
)