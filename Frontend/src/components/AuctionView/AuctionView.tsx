import { useEffect, useState } from 'react'
import { AuctionTab, type AuctionTabProps } from '../AuctionTab/AuctionTab'
import { BidContent } from '../BidContent/BidContent'
import { useAuctionStore } from '../../store/auctionStore'
import { useJoinedStore } from '../../store/joinedStore'
import type { AuctionItem } from '../../lib/auctions'

type Props = Omit<AuctionTabProps, 'onJoin'> & { bidMode?: 'live' | 'history' }

export const AuctionView = ({ bidMode = 'live', ...tabProps }: Props) => {
  const [bidItem, setBidItem] = useState<AuctionItem | null>(null)

  // açık auction: auctionStore.ongoing/upcoming
  const liveAuction = useAuctionStore((s) =>
    bidItem ? s.ongoing.find((a) => a.id === bidItem.id) ?? s.upcoming.find((a) => a.id === bidItem.id) : undefined,
  )
  // bitmiş/joined sonucu (winner + paid): joinedStore
  const liveJoined = useJoinedStore((s) =>
    bidItem ? s.items.find((a) => a.id === bidItem.id) : undefined,
  )

  // canlı delta (bid/participants/endTime) + bitiş sonucu (winner/paid) açık item'e işlensin
  useEffect(() => {
    const live = liveAuction ?? liveJoined
    if (live) setBidItem((prev) => (prev ? { ...prev, ...live } : prev))
  }, [liveAuction, liveJoined])

  if (bidItem) {
    return <BidContent item={bidItem} mode={bidMode} onBack={() => setBidItem(null)} />
  }

  return <AuctionTab {...tabProps} onJoin={(item) => setBidItem(item)} />
}