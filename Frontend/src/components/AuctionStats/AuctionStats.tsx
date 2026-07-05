import { BidIcon, UsersIcon, TrophyIcon } from '../icons'
import { MetalBadge } from '../MetalBadge/MetalBadge'
import { SevenSegment } from '../SevenSegment/SevenSegment'
import type { VaultSecurity } from '../../lib/auctions'
export const NameBadge = ({ name, className }: { name: string; className?: string }) => (
  <MetalBadge className={className}>{name}</MetalBadge>
)

export const TimerBadge = ({ value, className }: { value: string; className?: string }) => (
  <MetalBadge className={className}>
    <SevenSegment value={value} color="#ff5252" size={16} />
  </MetalBadge>
)

export const BidBadge = ({ bid, className }: { bid: number; className?: string }) => (
  <MetalBadge className={className} icon={<BidIcon />}>
    <SevenSegment value={`${bid}$`} color="#5fe06f" size={15} />
  </MetalBadge>
)

export const PartBadge = ({ participants, className }: { participants: number; className?: string }) => (
  <MetalBadge className={className} icon={<UsersIcon />}>
    {participants}
  </MetalBadge>
)

// 🆕 recent: sağ üstte kazananın ismi (geri sayım yerine)
export const WinnerBadge = ({ winner, className }: { winner?: string; className?: string }) => (
  <MetalBadge className={className} icon={<TrophyIcon />}>
    {winner ?? '—'}
  </MetalBadge>
)

// 🆕 recent: sol altta ödenen para (bid yerine)
export const PaidBadge = ({ paid, bid, className }: { paid?: number; bid: number; className?: string }) => (
  <MetalBadge className={className} icon={<BidIcon />}>
    <SevenSegment value={`${paid ?? bid}$`} color="#f3d979" size={15} />
  </MetalBadge>
)
const SECURITY_LABEL: Record<VaultSecurity, string> = {
  none: 'NONE',
  insured: 'INSURED',
  secured: 'SECURED',
}
const SECURITY_COLOR: Record<VaultSecurity, string> = {
  none: '#d98b8b',
  insured: '#7fc6e0',
  secured: '#6fe0a0',
}

// vault: sol-altta tahmini değer (bid yerine)
export const ValueBadge = ({ value, className }: { value: number; className?: string }) => (
  <MetalBadge className={className} icon={<BidIcon />}>
    <SevenSegment value={`~${value}$`} color="#f3d979" size={15} />
  </MetalBadge>
)

// vault: sağ-altta güvenlik durumu (participants yerine)
export const SecurityBadge = ({ security = 'none', className }: { security?: VaultSecurity; className?: string }) => (
  <MetalBadge className={className}>
    <span style={{ color: SECURITY_COLOR[security], fontFamily: "'NoctrdripSolidmelt', sans-serif", letterSpacing: '1px' }} >
      {SECURITY_LABEL[security]}
    </span>
  </MetalBadge>
)
