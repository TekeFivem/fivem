import { BidIcon, UsersIcon } from '../icons'
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