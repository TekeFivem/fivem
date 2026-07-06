import { useOngoingFiltersStore } from '../../store/createFiltersStore'
import { useJoinedStore } from '../../store/joinedStore'
import { ONGOING_TIME_OPTIONS } from '../../lib/auctions'
import { AuctionView } from '../../components/AuctionView/AuctionView'

import { useAuctionStore } from '../../store/auctionStore'


export const OngoingTab = () => {
  const joined = useJoinedStore((s) => s.items)
  const joinedIds = new Set(joined.map((j) => j.id))
  const ongoing = useAuctionStore((s) => s.ongoing)
  const items = ongoing.filter((m) => !joinedIds.has(m.id))
  return (
    <AuctionView items={items} store={useOngoingFiltersStore} variant="ongoing"
      timeOptions={ONGOING_TIME_OPTIONS} timeUnitSeconds={60} bidMode="live" />
  )
}