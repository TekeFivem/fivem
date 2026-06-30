import { fmtRange, type VaultSecurity } from '../../lib/vault'
import { MetalBadge } from '../MetalBadge/MetalBadge'
import styles from './VaultStats.module.scss'

export const ValueBadge = ({ min, max, className }: { min: number; max: number; className?: string }) => (
  <MetalBadge className={className}><span className={styles.value}>{fmtRange(min, max)}</span></MetalBadge>
)

const SEC = {
  unprotected: { label: 'KORUMASIZ', cls: 'unprotected', icon: '🔓' },
  insured:     { label: 'SİGORTALI', cls: 'insured',     icon: '🛡️' },
  secured:     { label: 'GÜVENLİ',   cls: 'secured',     icon: '🔒' },
} as const

export const SecurityBadge = ({ status, className }: { status: VaultSecurity; className?: string }) => {
  const s = SEC[status]
  return (
    <MetalBadge className={className}>
      <span className={[styles.sec, styles[s.cls]].join(' ')}>{s.icon} {s.label}</span>
    </MetalBadge>
  )
}