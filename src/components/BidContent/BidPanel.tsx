import { useMemo, useState } from 'react'
import type { AuctionItem, Tier } from '../../lib/auctions'
import { SevenSegment } from '../SevenSegment/SevenSegment'
import { BidIcon } from '../icons'
import styles from './BidPanel.module.scss'

interface BidEntry { id: string; player: string | null; amount: number }
const MIN_BID: Record<Tier, number> = { bronze: 150, silver: 300, gold: 600 }
const presetsFor = (tier: Tier) => [1, 2, 4, 8].map((m) => MIN_BID[tier] * m)
const money = (n: number) => `$${n.toLocaleString('en-US')}`

const SEED_BIDS: BidEntry[] = [
  { id: 'b1', player: 'Mike_T', amount: 600 },
  { id: 'b2', player: null, amount: 300 },
  { id: 'b3', player: 'Aria', amount: 150 },
  { id: 'b4', player: 'Berkay', amount: 300 },
  { id: 'b5', player: 'Deniz', amount: 150 },
]

interface Props {
  item: AuctionItem
  phase?: 'open' | 'final' | 'ended'
}

export const BidPanel = ({ item, phase = 'open' }: Props) => {
  const tier: Tier = item.tier ?? 'bronze'
  const presets = useMemo(() => presetsFor(tier), [tier])
  const [bids, setBids] = useState<BidEntry[]>(SEED_BIDS)
  const [price, setPrice] = useState(item.bid)
  const [hidden, setHidden] = useState(false)
  const [custom, setCustom] = useState('')

  const placeBid = (amount: number) => {
    if (!amount || amount <= 0 || phase === 'ended') return
    // final fazda gizli (blind) — isim daima gizli
    const player = phase === 'final' || hidden ? null : 'Sen'
    setBids((prev) => [{ id: `me-${Date.now()}`, player, amount }, ...prev].slice(0, 5))
    setPrice((p) => p + amount)
    // TODO: FiveM → fetchNui('placeBid', { auctionId: item.id, amount, blind: phase === 'final' })
  }
  const submitCustom = () => {
    const amt = Math.round(Number(custom))
    if (Number.isFinite(amt) && amt > 0) { placeBid(amt); setCustom('') }
  }

  const winner = useMemo(() => {
    if (item.winner) return { player: item.winner, amount: item.paid ?? price }
    const top = [...bids].sort((a, b) => b.amount - a.amount)[0]
    return top ? { player: top.player ?? 'Gizli Teklif', amount: top.amount } : null
  }, [bids, item.winner, item.paid, price])

  const priceLabel = phase === 'ended' ? 'Son Fiyat' : phase === 'final' ? 'Son Teklif' : 'Güncel Fiyat'
  const priceValue = phase === 'ended' ? (winner?.amount ?? price) : price

  return (
    <div className={styles.panel}>
      <div className={styles.priceBar}>
        <span className={styles.priceIcon}><BidIcon /></span>
        <span className={styles.priceLabel}>{priceLabel}</span>
        <span className={styles.priceValue}><SevenSegment value={`${priceValue}$`} color="#f3d979" size={20} /></span>
      </div>

      {phase === 'final' ? (
        <div className={styles.blind}>
          <span className={styles.blindIcon}>🔒</span>
          <span className={styles.blindText}>Son 10 saniye — rakiplerin teklifleri gizli. Son teklifini gir!</span>
        </div>
      ) : (
        <ul className={styles.bidList}>
          {bids.map((b) => (
            <li key={b.id} className={[styles.bidRow, b.player === null && styles.secret].filter(Boolean).join(' ')}>
              <span className={styles.player}>{b.player ?? 'Gizli Teklif'}</span>
              <span className={styles.amount}><SevenSegment value={`${b.amount}$`} color="#5fe06f" size={12} /></span>
            </li>
          ))}
        </ul>
      )}

      {phase === 'ended' ? (
        <div className={styles.winner}>
          <span className={styles.winnerIcon}>🏆</span>
          <span className={styles.winnerName}>{winner?.player ?? '—'}</span>
          <span className={styles.winnerAmount}>{winner ? money(winner.amount) : ''}</span>
        </div>
      ) : (
        <>
          <div className={styles.presets}>
            {presets.map((amt) => (
              <button key={amt} type="button" className={styles.preset} onClick={() => placeBid(amt)}>+{amt}$</button>
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
          {phase === 'open' && (
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
          )}
        </>
      )}
    </div>
  )
}