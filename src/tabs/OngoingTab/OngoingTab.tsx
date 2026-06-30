import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { useOngoingFiltersStore } from '../../store/createFiltersStore'
import { useJoinedStore } from '../../store/joinedStore'
import { ONGOING_TIME_OPTIONS, type AuctionItem } from '../../lib/auctions'

const MOCK: AuctionItem[] = [
  { kind: 'storage', id: 's1', name: 'STR-12', tier: 'gold', endTime: '01:23:45', bid: 10000, participants: 7 },
  { kind: 'storage', id: 's2', name: 'STR-07', tier: 'silver', endTime: '00:41:10', bid: 4500, participants: 3 },
  { kind: 'container', id: 'c1', name: 'CNT-A', tier: 'bronze', endTime: '02:05:30', bid: 8000, participants: 5 },
  { kind: 'container', id: 'c2', name: 'CNT-B', tier: 'silver', endTime: '00:58:00', bid: 12000, participants: 9 },
  { kind: 'itembox', id: 'i1', name: 'TMB-X', tier: 'gold', endTime: '00:12:00', bid: 30000, participants: 18 },
  { kind: 'itembox', id: 'i2', name: 'TMB-Y', tier: 'bronze', endTime: '00:03:40', bid: 750, participants: 1 },
  { kind: 'storage', id: 's3', name: 'STR-12', tier: 'gold', endTime: '01:23:45', bid: 10000, participants: 7 },
  { kind: 'storage', id: 's4', name: 'STR-07', tier: 'silver', endTime: '00:41:10', bid: 4500, participants: 3 },
  { kind: 'container', id: 'c3', name: 'CNT-A', tier: 'bronze', endTime: '02:05:30', bid: 8000, participants: 5 },
  { kind: 'container', id: 'c4', name: 'CNT-B', tier: 'silver', endTime: '00:58:00', bid: 12000, participants: 9 },
  { kind: 'itembox', id: 'i3', name: 'TMB-X', tier: 'gold', endTime: '00:12:00', bid: 30000, participants: 18 },
  { kind: 'itembox', id: 'i4', name: 'TMB-Y', tier: 'bronze', endTime: '00:03:40', bid: 750, participants: 1 },
]

export const OngoingTab = () => {
  const joined = useJoinedStore((s) => s.items)
  const joinedIds = new Set(joined.map((j) => j.id))
  const items = MOCK.filter((m) => !joinedIds.has(m.id))

  return (
    <AuctionTab
      items={items}
      store={useOngoingFiltersStore}
      variant="ongoing"
      timeOptions={ONGOING_TIME_OPTIONS}
      timeUnitSeconds={60}
    />
  )
}