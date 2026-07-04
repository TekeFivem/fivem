import { useState } from 'react'
import { AuctionTab, type AuctionTabProps } from '../AuctionTab/AuctionTab'
import { BidContent } from '../BidContent/BidContent'
import type { AuctionItem } from '../../lib/auctions'

type Props = Omit<AuctionTabProps, 'onJoin'> & { bidMode?: 'live' | 'history' }

export const AuctionView = ({ bidMode = 'live', ...tabProps }: Props) => {
  const [bidItem, setBidItem] = useState<AuctionItem | null>(null)

  if (bidItem) return <BidContent item={bidItem} mode={bidMode} onBack={() => setBidItem(null)} />

  return <AuctionTab {...tabProps} onJoin={(item) => setBidItem(item)} />
}