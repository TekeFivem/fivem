import { useTabsStore } from '../../store/tabsStore'
import { OngoingTab } from '../../tabs/OngoingTab/OngoingTab'
import { RecentTab } from '../../tabs/RecentTab/RecentTab'
import { UpcomingTab } from '../../tabs/UpcomingTab/UpcomingTab'
// import { UpcomingTab } from '../../tabs/Upcoming/UpcomingTab' // mevcutsa aç

export const TabContent = () => {
    const activeTab = useTabsStore((s) => s.activeTab)

    switch (activeTab) {
        case 'Ongoing':
            return <OngoingTab />
        case 'Recent':
            return <RecentTab />
        case 'Upcoming': return <UpcomingTab />
        default:
            return null
    }
}