
import { HazardSign } from '../HazardSign/HazardSign'
import { SidebarTabs } from '../SidebarTabs/SidebarTabs'
import styles from './Sidebar.module.scss'

export const Sidebar = () => (
  <aside className={styles.sidebar}>
    <div className={styles.header}>
      <HazardSign label="Auctions" />
    </div>
    <nav className={styles.nav}>
      <SidebarTabs />
    </nav>
  </aside>
)