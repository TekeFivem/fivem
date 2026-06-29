import styles from './SelfStorage.module.scss'
import { AuctionControls } from '../AuctionControls/AuctionControls'
import { NameBadge, TimerBadge, BidBadge, PartBadge } from '../AuctionStats/AuctionStats'
import { useAuctionCard } from '../../hooks/useAuctionCard'
import type { AuctionCardProps } from '../../lib/auctions'

export const SelfStorage = ({
  name, tier = 'bronze', endTime, bid, participants,
  onJoin, onWaypoint, onRemind, variant = 'ongoing',
}: AuctionCardProps) => {
  const c = useAuctionCard({ endTime, onWaypoint, onRemind })

  return (
    <div className={[styles.unit, styles[tier]].join(' ')}>
      <NameBadge name={name} className={styles.tlName} />
      <TimerBadge value={c.remaining} className={styles.trTimer} />
      <BidBadge bid={bid} className={styles.blBid} />
      <PartBadge participants={participants} className={styles.brPart} />

      <div className={styles.door}>
        <AuctionControls
          variant={variant}
          marked={c.marked}
          compassActive={c.compassActive}
          reminded={c.reminded}
          onLocation={c.handleLocation}
          onCompass={c.handleCompass}
          onReminder={c.handleReminder}
          onJoin={onJoin}
        />
      </div>
    </div>
  )
}