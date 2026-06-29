import { LocationIcon, CompassIcon, AlarmIcon } from '../icons'
import type { Variant } from '../../lib/auctions'
import styles from './AuctionControls.module.scss'

interface AuctionControlsProps {
  variant: Variant
  marked: boolean
  compassActive: boolean
  reminded: boolean
  onLocation: () => void
  onCompass: () => void
  onReminder: () => void
  onJoin?: () => void
}

export const AuctionControls = ({
  variant,
  marked,
  compassActive,
  reminded,
  onLocation,
  onCompass,
  onReminder,
  onJoin,
}: AuctionControlsProps) => (
  <>
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

    {variant === 'upcoming' ? (
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
    ) : (
      <button type="button" className={styles.joinBtn} onClick={onJoin}>
        Join
      </button>
    )}
  </>
)