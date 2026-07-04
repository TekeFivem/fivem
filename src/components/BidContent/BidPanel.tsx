import { useMemo, useState } from 'react'
import type { AuctionItem, Tier } from '../../lib/auctions'
import { SevenSegment } from '../SevenSegment/SevenSegment'
import { BidIcon } from '../icons'
import styles from './BidPanel.module.scss'

interface BidEntry { id: string; player: string | null; amount: number }

const MIN_BID: Record<Tier, number> = { bronze: 150, silver: 300, gold: 600 }
const presetsFor = (tier: Tier) => [1, 2, 4, 8].map((m) => MIN_BID[tier] * m)

const SEED_BIDS: BidEntry[] = [
  { id: 'b1', player: 'Mike_T', amount: 600 },
  { id: 'b2', player: null, amount: 300 },
  { id: 'b3', player: 'Aria', amount: 150 },
  { id: 'b4', player: 'Berkay', amount: 300 },
  { id: 'b5', player: 'Deniz', amount: 150 },
]

interface Props {
  item: AuctionItem
}

export const BidPanel = ({ item }: Props) => {
  const tier: Tier = item.tier ?? 'bronze'
  const presets = useMemo(() => presetsFor(tier), [tier])
  const [bids, setBids] = useState<BidEntry[]>(SEED_BIDS)
  const [price, setPrice] = useState(item.bid)
  const [hidden, setHidden] = useState(false)
  const [custom, setCustom] = useState('')

  const placeBid = (amount: number) => {
    if (!amount || amount <= 0) return
    setBids((prev) =>
      [{ id: `me-${Date.now()}`, player: hidden ? null : 'Sen', amount }, ...prev].slice(0, 5),
    )
    setPrice((p) => p + amount)
    // TODO: FiveM → fetchNui('placeBid', { auctionId: item.id, amount, hidden })
  }
  const submitCustom = () => {
    const amt = Math.round(Number(custom))
    if (Number.isFinite(amt) && amt > 0) {
      placeBid(amt)
      setCustom('')
    }
  }

  return (
    <div className={styles.panel}>
      {/* güncel fiyat */}
      <div className={styles.priceBar}>
        <span className={styles.priceIcon}><BidIcon /></span>
        <span className={styles.priceLabel}>Current</span>
        <span className={styles.priceValue}>
          <SevenSegment value={`${price}$`} color="#f3d979" size={20} />
        </span>
      </div>

      {/* son 5 bid */}
      <ul className={styles.bidList}>
        {bids.map((b) => (
          <li key={b.id} className={[styles.bidRow, b.player === null && styles.secret].filter(Boolean).join(' ')}>
            <span className={styles.player}>{b.player ?? 'Gizli Teklif'}</span>
            <span className={styles.amount}>
              <SevenSegment value={`${b.amount}$`} color="#5fe06f" size={12} />
            </span>
          </li>
        ))}
      </ul>

      {/* preset + custom */}
      <div className={styles.presets}>
        {presets.map((amt) => (
          <button key={amt} type="button" className={styles.preset} onClick={() => placeBid(amt)}>
            +{amt}$
          </button>
        ))}
      </div>
      <div className={styles.customRow}>
        <input
          className={styles.customInput}
          type="number"
          min={0}
          placeholder="Özel tutar"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
        />
        <button type="button" className={styles.customBtn} onClick={submitCustom}>Bid Ver</button>
      </div>

      {/* gizli bid tabela */}
      <button
        type="button"
        className={[styles.secretPlate, hidden && styles.secretOn].filter(Boolean).join(' ')}
        onClick={() => setHidden((h) => !h)}
        aria-pressed={hidden}
      >
        <span className={styles.secretDot} />
        <span className={styles.secretText}>Gizli Bid</span>
        <span className={styles.secretState}>{hidden ? 'AÇIK' : 'KAPALI'}</span>
      </button>
    </div>
  )
}