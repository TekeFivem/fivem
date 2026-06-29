import { BidIcon, UsersIcon, TrophyIcon } from '../icons'
import { MetalBadge } from '../MetalBadge/MetalBadge'
import { SevenSegment } from '../SevenSegment/SevenSegment'

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