
import { useTabsStore, type AuctionTab } from '../../store/tabsStore'
import { Tab } from '../Tab/Tab';
import styles from './SidebarTabs.module.scss'

// Her tab'ın kendi rengi (inaktifken grayscale, aktifken bu renk)
const TABS: { label: AuctionTab; accent: string }[] = [
  { label: 'Ongoing', accent: '#46e06b' }, // yeşil
  { label: 'Upcoming', accent: '#3f9bd1' }, // mavi
  { label: 'Recent', accent: '#e0c33a' }, // sarı
  { label: 'Joined', accent: '#9b6cf0' }, // mor
  { label: 'Vault', accent: '#e0883a' }, // turuncu
  { label: 'Loot', accent: '#e04f8a' }, // pembe
  { label: 'Leaderboard', accent: '#46c7c7' }, // turkuaz
]

export const SidebarTabs = () => {
  const activeTab = useTabsStore((s) => s.activeTab)
  const setActiveTab = useTabsStore((s) => s.setActiveTab)

  return (
    <div className={styles.tabs}>
      {TABS.map((t) => (
        <Tab
          key={t.label}
          label={t.label}
          accent={t.accent}
          active={activeTab === t.label}
          onClick={() => setActiveTab(t.label)}
        />
      ))}
    </div>
  )
}