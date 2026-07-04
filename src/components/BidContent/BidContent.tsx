import { useEffect, useState } from 'react'
import { toSeconds, formatHMS, type AuctionItem } from '../../lib/auctions'
import { NameBadge, TimerBadge, BidBadge, PartBadge } from '../AuctionStats/AuctionStats'
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
  const [secondsLeft, setSecondsLeft] = useState(() => toSeconds(item.endTime))

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  // open → final (son 10 sn) → ended (0 sn). Recent'ta endTime 00:00:00 → direkt ended.
  const phase: 'open' | 'final' | 'ended' =
    secondsLeft <= 0 ? 'ended' : secondsLeft <= 10 ? 'final' : 'open'
  const remaining = formatHMS(secondsLeft)

  return (
    <div className={styles.content}>
      <header className={styles.topbar}>
        <NameBadge name={item.name} />
        <div className={styles.stats}>
          <TimerBadge value={remaining} />
          <BidBadge bid={item.bid} />
          <PartBadge participants={item.participants} />
        </div>
      </header>

      <div className={styles.storageArea}>
        {item.kind === 'container' ? (
          <BidContainer tier={item.tier} />
        ) : item.kind === 'itembox' ? (
          <BidItemBox tier={item.tier} />
        ) : (
          <BidStorage tier={item.tier} />
        )}
      </div>

      <div className={styles.scratchArea}><BidScratch /></div>
      <div className={styles.infoArea}><BidInfo item={item} /></div>
      <div className={styles.bidArea}><BidPanel item={item} phase={phase} /></div>
      <div className={styles.hackArea}><BidHack /></div>
      <div className={styles.chatArea}><BidChat /></div>
    </div>
  )
}