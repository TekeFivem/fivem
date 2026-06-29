import { Sidebar } from './components/Sidebar'

import { useTabsStore } from './store/tabsStore'
import styles from './App.module.scss'
import { Tablet } from './components/Tablet/Tablet'
import { OngoingTab } from './tabs/OngoingTab/OngoingTab'
import { UpcomingTab } from './tabs/Upcoming/UpcomingTab'

function App() {
  const activeTab = useTabsStore((s) => s.activeTab)

  return (
    <Tablet>
      <div className={styles.layout}>
        <Sidebar />

        <main className={styles.content}>
          {activeTab === 'Ongoing' ? (
            <OngoingTab />
          ) : activeTab === 'Upcoming' ? (
            <UpcomingTab />
          ) : (
            <div className={styles.empty}>{activeTab} — yakında</div>
          )}
        </main>
      </div>
    </Tablet>
  )
}

export default App