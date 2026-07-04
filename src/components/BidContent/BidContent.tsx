import type { AuctionItem } from '../../lib/auctions'
import { NameBadge, TimerBadge, BidBadge, PartBadge } from '../AuctionStats/AuctionStats'
import { useCountdown } from '../../hooks/useCountdown'
import { BidStorage } from './BidStorage'
import { BidScratch } from './BidScratch'
import styles from './BidContent.module.scss'
import { BidInfo } from './BidInfo'
import { BidPanel } from './BidPanel'
import { BidHack } from './BidHack'
import { BidChat } from './BidChat'
import { BidContainer } from './BidContainer'
import { BidItemBox } from './BidItemBox'

interface Props {
  item: AuctionItem
}

export const BidContent = ({ item }: Props) => {
  const remaining = useCountdown(item.endTime)

  return (
    <div className={styles.content}>
      {/* TOPBAR */}
      <header className={styles.topbar}>
        <NameBadge name={item.name} />
        <div className={styles.stats}>
          <TimerBadge value={remaining} />
          <BidBadge bid={item.bid} />
          <PartBadge participants={item.participants} />
        </div>
      </header>

      {/* SELF STORAGE */}
      <div className={styles.storageArea}>
        {item.kind === 'container' ? (
          <BidContainer tier={item.tier} />
        ) : item.kind === 'itembox' ? (
          <BidItemBox tier={item.tier} />
        ) : (
          <BidStorage tier={item.tier} />
        )}
      </div>

      {/* SCRATCH */}
      <div className={styles.scratchArea}>
        <BidScratch />
      </div>
      {/* INFO — scratch'in yanında */}
      <div className={styles.infoArea}>
        <BidInfo item={item} />
      </div>
      {/* BID PANELİ — storage'ın altında */}
      <div className={styles.bidArea}>
        <BidPanel item={item} />
      </div>
      {/* HACK PANELİ — bid panelin sağı */}
      <div className={styles.hackArea}>
        <BidHack />
      </div>
      {/* CHAT — kalan bölge */}
      <div className={styles.chatArea}>
        <BidChat />
      </div>
    </div>
  )
}