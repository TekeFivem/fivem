import styles from './ItemBox.module.scss'
import { AuctionControls } from '../AuctionControls/AuctionControls'
import { NameBadge, TimerBadge, BidBadge, PartBadge, WinnerBadge, PaidBadge } from '../AuctionStats/AuctionStats'
import { useAuctionCard } from '../../hooks/useAuctionCard'
import type { AuctionCardProps } from '../../lib/auctions'

export const ItemBox = ({
  name, tier = 'bronze', endTime, bid, participants,
  onJoin, onWaypoint, onRemind, variant = 'ongoing',
  winner, paid, result, onInspect, onBid,
}: AuctionCardProps) => {
  const c = useAuctionCard({ endTime, onWaypoint, onRemind })
  const recent = variant === 'recent' || (variant === 'joined' && !!result)

  return (
    <div className={[styles.unit, styles[tier]].join(' ')}>
      <div className={[styles.band, styles.bandTop].join(' ')}>
        <NameBadge name={name} className={styles.name} />
        {recent
          ? <WinnerBadge winner={winner} className={styles.timer} />
          : <TimerBadge value={c.remaining} className={styles.timer} />}
      </div>

      <div className={styles.body}>
        <span className={styles.seam} />
        <span className={[styles.latch, styles.latchL].join(' ')} />
        <span className={[styles.latch, styles.latchR].join(' ')} />
        <span className={styles.hasp} />

        <div className={styles.controls}>
          <AuctionControls
            variant={variant}
            marked={c.marked}
            compassActive={c.compassActive}
            reminded={c.reminded}
            result={result}
            onLocation={c.handleLocation}
            onCompass={c.handleCompass}
            onReminder={c.handleReminder}
            onJoin={onJoin}
            onInspect={onInspect}
            onBid={onBid}
          />
        </div>
      </div>

      <div className={[styles.band, styles.bandBottom].join(' ')}>
        {recent
          ? <PaidBadge paid={paid} bid={bid} className={styles.bid} />
          : <BidBadge bid={bid} className={styles.bid} />}
        <PartBadge participants={participants} className={styles.part} />
      </div>
    </div>
  )
}