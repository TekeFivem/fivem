import { useState } from 'react'

import { BidIcon, UsersIcon, LocationIcon, CompassIcon, AlarmIcon } from '../icons'
import styles from './ItemBox.module.scss'
import { MetalBadge } from '../MetalBadge/MetalBadge'
import { SevenSegment } from '../SevenSegment/SevenSegment'
import { useCountdown } from '../../hooks/useCountdown'

export type ItemBoxTier = 'bronze' | 'silver' | 'gold'

export interface ItemBoxProps {
  name: string
  tier?: ItemBoxTier
  endTime: string
  bid: number
  participants: number
  variant?: 'ongoing' | 'upcoming'
  onRemind?: (active: boolean) => void
  onJoin?: () => void
  onWaypoint?: (active: boolean) => void
}

export const ItemBox = ({
  name,
  tier = 'bronze',
  endTime,
  bid,
  participants,
  onJoin,
  onWaypoint,
  onRemind,
  variant = 'ongoing'
}: ItemBoxProps) => {
  const [marked, setMarked] = useState(false)
  const [compassActive, setCompassActive] = useState(false)
  const remaining = useCountdown(endTime)

  const [reminded, setReminded] = useState(false)

  const handleReminder = () => {
    setReminded((prev) => {
      const next = !prev
      onRemind?.(next)
      return next
    })
  }

  const handleLocation = () => {
    setMarked((prev) => {
      const next = !prev
      setCompassActive(next)
      return next
    })
  }

  const handleCompass = () => {
    if (!marked) return
    setCompassActive((a) => {
      const next = !a
      onWaypoint?.(next)
      return next
    })
  }

  return (
    <div className={[styles.unit, styles[tier]].join(' ')}>
      {/* ---- Üst takviye bandı ---- */}
      <div className={[styles.band, styles.bandTop].join(' ')}>
        <MetalBadge className={styles.name}>{name}</MetalBadge>
        <MetalBadge className={styles.timer}>
          <SevenSegment value={remaining} color="#ff5252" size={16} />
        </MetalBadge>
      </div>

      {/* ---- Gövde (gömük panel) ---- */}
      <div className={styles.body}>
        <span className={styles.seam} />
        <span className={[styles.latch, styles.latchL].join(' ')} />
        <span className={[styles.latch, styles.latchR].join(' ')} />
        <span className={styles.hasp} />

        <div className={styles.controls}>
          <div className={styles.locationRow}>
            <button
              type="button"
              onClick={handleLocation}
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
                onClick={handleCompass}
                aria-label="Compass"
                className={[styles.compass, compassActive && styles.compassActive]
                  .filter(Boolean)
                  .join(' ')}
              >
                <CompassIcon />
              </button>
            )}
          </div>

          {variant === 'upcoming' ? (
            <div className={styles.reminderRow}>
              <button
                type="button"
                onClick={handleReminder}
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
                  onClick={handleReminder}
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
        </div>
      </div>

      {/* ---- Alt takviye bandı ---- */}
      <div className={[styles.band, styles.bandBottom].join(' ')}>
        <MetalBadge className={styles.bid} icon={<BidIcon />}>
          <SevenSegment value={`${bid}$`} color="#5fe06f" size={15} />
        </MetalBadge>
        <MetalBadge className={styles.part} icon={<UsersIcon />}>
          {participants}
        </MetalBadge>
      </div>
    </div>
  )
}