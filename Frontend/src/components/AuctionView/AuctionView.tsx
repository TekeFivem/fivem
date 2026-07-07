import { useEffect, useState } from 'react'
import { AuctionTab, type AuctionTabProps } from '../AuctionTab/AuctionTab'
import { BidContent } from '../BidContent/BidContent'
import { useAuctionStore } from '../../store/auctionStore'
import type { AuctionItem } from '../../lib/auctions'

type Props = Omit<AuctionTabProps, 'onJoin'> & { bidMode?: 'live' | 'history' }

export const AuctionView = ({ bidMode = 'live', ...tabProps }: Props) => {
  const [bidItem, setBidItem] = useState<AuctionItem | null>(null)

  const live = useAuctionStore((s) =>
    bidItem ? s.ongoing.find((a) => a.id === bidItem.id) ?? s.upcoming.find((a) => a.id === bidItem.id) : undefined,
  )

  // canlı delta'ları (bid / participants / endTime) açık item'e işle; bitince son değer elde kalsın
  useEffect(() => {
    if (live) setBidItem((prev) => (prev ? { ...prev, ...live } : prev))
  }, [live])

  if (bidItem) {
    return <BidContent item={bidItem} mode={bidMode} onBack={() => setBidItem(null)} />
  }

  return <AuctionTab {...tabProps} onJoin={(item) => setBidItem(item)} />
}