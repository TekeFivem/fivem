import { AuctionView } from '../../components/AuctionView/AuctionView'
import { useJoinedFiltersStore } from '../../store/createFiltersStore'
import { useJoinedStore } from '../../store/joinedStore'
import { ONGOING_TIME_OPTIONS } from '../../lib/auctions'

export const JoinedTab = () => {
  const items = useJoinedStore((s) => s.items)
  return (
    <AuctionView
      items={items}
      store={useJoinedFiltersStore}
      variant="joined"
      timeOptions={ONGOING_TIME_OPTIONS}
      timeUnitSeconds={60}
      bidMode="live"
    />
  )
}