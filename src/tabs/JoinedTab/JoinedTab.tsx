import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { useJoinedFiltersStore } from '../../store/createFiltersStore'
import { useJoinedStore } from '../../store/joinedStore'
import { ONGOING_TIME_OPTIONS } from '../../lib/auctions'

export const JoinedTab = () => {
  const items = useJoinedStore((s) => s.items)

  return (
    <AuctionTab
      items={items}
      store={useJoinedFiltersStore}
      variant="joined"
      timeOptions={ONGOING_TIME_OPTIONS}  
      timeUnitSeconds={60}                
    />
  )
}