import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { useUpcomingFiltersStore } from '../../store/createFiltersStore'
import { UPCOMING_TIME_OPTIONS, type AuctionItem } from '../../lib/auctions'

// participants = Reminder'a basan kişi sayısı, endTime = başlamaya kalan süre (2–10 saat)
const MOCK: AuctionItem[] = [
  { kind: 'storage', id: 'us1', name: 'STR-21', tier: 'gold', endTime: '09:30:00', bid: 15000, participants: 12 },
  { kind: 'storage', id: 'us2', name: 'STR-08', tier: 'silver', endTime: '04:05:00', bid: 5000, participants: 4 },
  { kind: 'container', id: 'uc1', name: 'CNT-C', tier: 'bronze', endTime: '07:15:00', bid: 9000, participants: 6 },
  { kind: 'container', id: 'uc2', name: 'CNT-D', tier: 'gold', endTime: '02:45:00', bid: 22000, participants: 20 },
  { kind: 'itembox', id: 'ui1', name: 'TMB-Z', tier: 'silver', endTime: '05:40:00', bid: 17000, participants: 9 },
  { kind: 'itembox', id: 'ui2', name: 'TMB-W', tier: 'bronze', endTime: '03:20:00', bid: 1200, participants: 2 },
  { kind: 'storage', id: 'us3', name: 'STR-33', tier: 'silver', endTime: '08:00:00', bid: 6500, participants: 5 },
  { kind: 'container', id: 'uc3', name: 'CNT-E', tier: 'gold', endTime: '06:10:00', bid: 30000, participants: 25 },
  { kind: 'itembox', id: 'ui3', name: 'TMB-V', tier: 'gold', endTime: '10:00:00', bid: 40000, participants: 31 },
  { kind: 'storage', id: 'us4', name: 'STR-41', tier: 'bronze', endTime: '02:30:00', bid: 3000, participants: 3 },
]

export const UpcomingTab = () => (
  <AuctionTab
    items={MOCK}
    store={useUpcomingFiltersStore}
    variant="upcoming"
    timeOptions={UPCOMING_TIME_OPTIONS}
    timeUnitSeconds={3600}
    thresholdSec={2 * 3600}
    labels={{ bid: 'Start Bid', part: 'Reminders' }}
  />
)
