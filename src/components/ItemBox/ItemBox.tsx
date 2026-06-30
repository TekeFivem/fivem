import styles from './ItemBox.module.scss'
import { AuctionControls } from '../AuctionControls/AuctionControls'
import { NameBadge, TimerBadge, BidBadge, PartBadge, WinnerBadge, PaidBadge, ValueBadge, SecurityBadge } from '../AuctionStats/AuctionStats'
import { useAuctionCard } from '../../hooks/useAuctionCard'
import type { AuctionCardProps } from '../../lib/auctions'
import { ExpiredMask } from '../ExpiredMask/ExpiredMask'

export const ItemBox = ({
  name, tier = 'bronze', endTime, bid, participants,
  onJoin, onWaypoint, onRemind, variant = 'ongoing',
  winner, paid, result, onInspect, onBid,
  estValue, security, onAction,
}: AuctionCardProps) => {
  const c = useAuctionCard({ endTime, onWaypoint, onRemind })
  const recent = variant === 'recent' || (variant === 'joined' && !!result)
  const vault = variant === 'vault'
  const expired = vault && c.remaining === '00:00:00'
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
            onAction={onAction}
          />
        </div>
      </div>

      <div className={[styles.band, styles.bandBottom].join(' ')}>
        {vault
          ? <ValueBadge value={estValue ?? bid} className={styles.bid} />
          : recent
          ? <PaidBadge paid={paid} bid={bid} className={styles.bid} />
          : <BidBadge bid={bid} className={styles.bid} />}

        {vault
          ? <SecurityBadge security={security} className={styles.part} />
          : <PartBadge participants={participants} className={styles.part} />}
      </div>
      {expired && <ExpiredMask />}
    </div>
  )
}