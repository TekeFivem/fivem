import { LocationIcon, CompassIcon, AlarmIcon, InspectIcon, BidIcon } from '../icons'
import type { Variant } from '../../lib/auctions'
import styles from './AuctionControls.module.scss'

interface AuctionControlsProps {
  variant: Variant
  marked: boolean
  compassActive: boolean
  reminded: boolean
  result?: 'won' | 'lost'
  onLocation: () => void
  onCompass: () => void
  onReminder: () => void
  onJoin?: () => void
  onInspect?: () => void
  onBid?: () => void
}

export const AuctionControls = ({
  variant,
  marked,
  compassActive,
  reminded,
  result,
  onLocation,
  onCompass,
  onReminder,
  onJoin,
  onInspect,
  onBid,
}: AuctionControlsProps) => (
  <>
    {/* Üst satır: Location + (işaretliyse) pusula — HER VARIANT'TA AYNI */}
    <div className={styles.locationRow}>
      <button
        type="button"
        onClick={onLocation}
        className={[styles.locBtn, marked && styles.locActive].filter(Boolean).join(' ')}
      >
        <span className={styles.btnIcon}>
          <LocationIcon />
        </span>
        Location
      </button>

      {marked && (
        <button
          type="button"
          onClick={onCompass}
          aria-label="Compass"
          className={[styles.compass, compassActive && styles.compassActive].filter(Boolean).join(' ')}
        >
          <CompassIcon />
        </button>
      )}
    </div>

    {/* Alt buton: variant + sonuç durumuna göre TEK biri görünür */}
    {variant === 'upcoming' ? (
      /* ---- UPCOMING: Reminder ---- */
      <div className={styles.reminderRow}>
        <button
          type="button"
          onClick={onReminder}
          className={[styles.joinBtn, reminded && styles.reminderActive].filter(Boolean).join(' ')}
        >
          <span className={styles.btnIcon}>
            <AlarmIcon />
          </span>
          Reminder
        </button>

        {reminded && (
          <button
            type="button"
            aria-label="Alarm"
            onClick={onReminder}
            className={[styles.alarm, styles.alarmActive].join(' ')}
          >
            <AlarmIcon />
          </button>
        )}
      </div>
    ) : variant === 'recent' || (variant === 'joined' && result) ? (
      /* ---- RECENT & JOINED(sonuçlu): Inspect ---- */
      <button type="button" className={styles.joinBtn} onClick={onInspect}>
        <span className={styles.btnIcon}>
          <InspectIcon />
        </span>
        Inspect
      </button>
    ) : variant === 'joined' ? (
      /* ---- JOINED(sonuçsuz): Bid ---- */
      <button type="button" className={styles.joinBtn} onClick={onBid}>
        <span className={styles.btnIcon}>
          <BidIcon />
        </span>
        Bid
      </button>
    ) : (
      /* ---- ONGOING (default): Join ---- */
      <button type="button" className={styles.joinBtn} onClick={onJoin}>
        Join
      </button>
    )}
  </>
)