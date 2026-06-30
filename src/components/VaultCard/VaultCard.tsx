import { useState } from 'react'
import styles from './VaultCard.module.scss'
import { NameBadge, TimerBadge } from '../AuctionStats/AuctionStats'
import { MetalBadge } from '../MetalBadge/MetalBadge'
import { LocationIcon, CompassIcon } from '../icons'
import { useVaultCountdown } from '../../hooks/useVaultCountdown'
import type { VaultItem } from '../../lib/vault'

interface VaultCardProps {
  item: VaultItem
  onWaypoint?: (active: boolean) => void
  onAction?: (item: VaultItem) => void
}

const SECURITY_LABEL = {
  unprotected: 'NONE',
  insured: 'INSURED',
  secured: 'SECURED',
} as const

const money = (n: number) => `$${n.toLocaleString('en-US')}`

const MASK_TEXT = {
  expired: 'EXPIRED',
  cleared: 'CLEARED',
  sold: 'SOLD',
  robbed: 'ROBBED',
} as const

export const VaultCard = ({ item, onWaypoint, onAction }: VaultCardProps) => {
  const { remaining, expired } = useVaultCountdown(item.deadline)
  const [marked, setMarked] = useState(false)
  const [compassActive, setCompassActive] = useState(false)

  // expired → kart yerinde kalır, sadece aksiyon kilitlenir
  const done = expired || item.state !== 'active'
  const maskKey = item.state !== 'active' ? item.state : expired ? 'expired' : null

  const handleLocation = () =>
    setMarked((prev) => {
      const next = !prev
      setCompassActive(next)
      return next
    })

  const handleCompass = () => {
    if (!marked) return
    setCompassActive((a) => {
      const next = !a
      onWaypoint?.(next)
      return next
    })
  }

  return (
    <div className={[styles.unit, styles[item.tier]].join(' ')}>
      <NameBadge name={item.name} className={styles.tlName} />
      <TimerBadge value={remaining} className={styles.trTimer} />

      <MetalBadge className={styles.blValue}>
        {money(item.estValueMin)}–{money(item.estValueMax)}
      </MetalBadge>
      <MetalBadge className={styles.brSecurity}>
        {SECURITY_LABEL[item.security]}
      </MetalBadge>

      <div className={styles.center}>
        <div className={styles.locationRow}>
          <button
            type="button"
            onClick={handleLocation}
            className={[styles.locBtn, marked && styles.locActive].filter(Boolean).join(' ')}
          >
            <span className={styles.btnIcon}><LocationIcon /></span>
            Location
          </button>

          {marked && (
            <button
              type="button"
              onClick={handleCompass}
              className={[styles.locBtn, compassActive && styles.locActive].filter(Boolean).join(' ')}
            >
              <span className={styles.btnIcon}><CompassIcon /></span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAction?.(item)}
          className={styles.actionBtn}
          disabled={done}
        >
          Action
        </button>
      </div>

      {maskKey && (
        <div className={[styles.mask, styles[maskKey]].join(' ')}>
          <span className={styles.maskText}>{MASK_TEXT[maskKey]}</span>
        </div>
      )}
    </div>
  )
}