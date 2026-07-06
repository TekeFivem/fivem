import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { useUpcomingFiltersStore } from '../../store/createFiltersStore'
import { UPCOMING_TIME_OPTIONS } from '../../lib/auctions'
import { useAuctionStore } from '../../store/auctionStore'

// participants = Reminder'a basan kişi sayısı, endTime = başlamaya kalan süre (2–10 saat)

export const UpcomingTab = () => {
  const items = useAuctionStore((s) => s.upcoming)
  return (
    <AuctionTab items={items} store={useUpcomingFiltersStore} variant="upcoming"
      timeOptions={UPCOMING_TIME_OPTIONS} timeUnitSeconds={3600} thresholdSec={2 * 3600}
      labels={{ bid: 'Start Bid', part: 'Reminders' }}
    />
  )
}
