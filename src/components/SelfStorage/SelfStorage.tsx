import { useState } from 'react'

import { BidIcon, UsersIcon, LocationIcon, CompassIcon } from '../icons'
import styles from './SelfStorage.module.scss'
import { MetalBadge } from '../MetalBadge/MetalBadge'
import { SevenSegment } from '../SevenSegment/SevenSegment'
import { useCountdown } from '../../hooks/useCountdown'

export type StorageTier = 'bronze' | 'silver' | 'gold'

export interface SelfStorageProps {
  name: string
  tier?: StorageTier
  endTime: string // "01:23:45"
  bid: number // 10000 -> "10000$"
  participants: number
  onJoin?: () => void
  /** pusula aktif olduğunda tetiklenir (ileride waypoint set) */
  onWaypoint?: (active: boolean) => void
}

export const SelfStorage = ({
  name,
  tier = 'bronze',
  endTime,
  bid,
  participants,
  onJoin,
  onWaypoint,
}: SelfStorageProps) => {
  const [marked, setMarked] = useState(false)
  const [compassActive, setCompassActive] = useState(false)
  const remaining = useCountdown(endTime)

  const handleLocation = () => {
    setMarked((prev) => {
      const next = !prev
      setCompassActive(next) // marked olunca pusula aktif, unmark olunca kapanır
      return next
    })
  }

  const handleCompass = () => {
    if (!marked) return
    setCompassActive((a) => {
      const next = !a
      onWaypoint?.(next) // ileride: waypoint set
      return next
    })
  }

  return (
    <div className={[styles.unit, styles[tier]].join(' ')}>
      {/* ---- METAL WALL: köşe tabelaları ---- */}
      <MetalBadge className={styles.tlName}>{name}</MetalBadge>

      <MetalBadge className={styles.trTimer}>
        <SevenSegment value={remaining} color="#ff5252" size={16} />
      </MetalBadge>

      <MetalBadge className={styles.blBid} icon={<BidIcon />}>
        <SevenSegment value={`${bid}$`} color="#5fe06f" size={15} />
      </MetalBadge>

      <MetalBadge className={styles.brPart} icon={<UsersIcon />}>
        {participants}
      </MetalBadge>

      {/* ---- METAL DOOR: butonlar ---- */}
      <div className={styles.door}>
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

        <button type="button" className={styles.joinBtn} onClick={onJoin}>
          Join
        </button>
      </div>
    </div>
  )
}