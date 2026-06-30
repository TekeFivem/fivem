import { useTabsStore } from '../../store/tabsStore'
import { OngoingTab } from '../../tabs/OngoingTab/OngoingTab'
import { UpcomingTab } from '../../tabs/UpcomingTab/UpcomingTab'
import { RecentTab } from '../../tabs/RecentTab/RecentTab'
import { JoinedTab } from '../../tabs/JoinedTab/JoinedTab'
import { VaultTab } from '../../tabs/VaultTab/VaultTab'

export const TabContent = () => {
  const activeTab = useTabsStore((s) => s.activeTab)

  switch (activeTab) {
    case 'Ongoing':
      return <OngoingTab />
    case 'Upcoming':
      return <UpcomingTab />
    case 'Recent':
      return <RecentTab />
    case 'Joined':
      return <JoinedTab />
    case 'Vault':
      return <VaultTab />
    default:
      return null
  }
}