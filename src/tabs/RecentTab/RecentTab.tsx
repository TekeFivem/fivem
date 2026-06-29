import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { useRecentFiltersStore } from '../../store/createFiltersStore'
import { type AuctionItem } from '../../lib/auctions'

const MOCK: AuctionItem[] = [
  { kind: 'storage',   id: 'r1', name: 'STR-12', tier: 'gold',   endTime: '00:00:00', bid: 10000, participants: 7,  winner: 'Mike_T',  paid: 12500 },
  { kind: 'storage',   id: 'r2', name: 'STR-07', tier: 'silver', endTime: '00:00:00', bid: 4500,  participants: 3,  winner: 'Aria',    paid: 5200 },
  { kind: 'container', id: 'r3', name: 'CNT-A',  tier: 'bronze', endTime: '00:00:00', bid: 8000,  participants: 5,  winner: 'Berkay',  paid: 9100 },
  { kind: 'container', id: 'r4', name: 'CNT-B',  tier: 'silver', endTime: '00:00:00', bid: 12000, participants: 9,  winner: 'Deniz',   paid: 14000 },
  { kind: 'itembox',   id: 'r5', name: 'TMB-X',  tier: 'gold',   endTime: '00:00:00', bid: 30000, participants: 18, winner: 'Kaan_99', paid: 38500 },
  { kind: 'itembox',   id: 'r6', name: 'TMB-Y',  tier: 'bronze', endTime: '00:00:00', bid: 750,   participants: 1,  winner: 'Elif',    paid: 800 },
  { kind: 'storage',   id: 'r7', name: 'STR-22', tier: 'gold',   endTime: '00:00:00', bid: 15000, participants: 11, winner: 'Cem',     paid: 17250 },
]

export const RecentTab = () => (
  <AuctionTab
    items={MOCK}
    store={useRecentFiltersStore}
    variant="recent"
    timeUnitSeconds={3600}
    searchByName
    labels= {{bid: 'Paid' }}
  />
)