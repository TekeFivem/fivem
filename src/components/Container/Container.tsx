import styles from './Container.module.scss'
import { AuctionControls } from '../AuctionControls/AuctionControls'
import { NameBadge, TimerBadge, BidBadge, PartBadge, WinnerBadge, PaidBadge, ValueBadge, SecurityBadge } from '../AuctionStats/AuctionStats'
import { useAuctionCard } from '../../hooks/useAuctionCard'
import type { AuctionCardProps } from '../../lib/auctions'
import { ExpiredMask } from '../ExpiredMask/ExpiredMask'

export const Container = ({
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
      <div className={styles.railTop} />
      <div className={styles.railBottom} />

      <NameBadge name={name} className={styles.tlName} />

      {recent
        ? <WinnerBadge winner={winner} className={styles.trTimer} />
        : <TimerBadge value={c.remaining} className={styles.trTimer} />}

      {vault
        ? <ValueBadge value={estValue ?? bid} className={styles.blBid} />
        : recent
        ? <PaidBadge paid={paid} bid={bid} className={styles.blBid} />
        : <BidBadge bid={bid} className={styles.blBid} />}

      {vault
        ? <SecurityBadge security={security} className={styles.brPart} />
        : <PartBadge participants={participants} className={styles.brPart} />}

      <div className={styles.doors}>
        <span className={styles.seam} />
        <span className={[styles.rod, styles.rod1].join(' ')} />
        <span className={[styles.rod, styles.rod2].join(' ')} />
        <span className={[styles.rod, styles.rod3].join(' ')} />
        <span className={[styles.rod, styles.rod4].join(' ')} />

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
            {expired && <ExpiredMask />}
    </div>
  )
}