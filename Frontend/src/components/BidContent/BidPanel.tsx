import { useMemo, useState } from 'react'
import type { AuctionItem, Tier } from '../../lib/auctions'
import { SevenSegment } from '../SevenSegment/SevenSegment'
import { BidIcon } from '../icons'
import styles from './BidPanel.module.scss'

interface BidEntry { id: string; player: string; amount: number; hidden: boolean }

const MIN_BID: Record<Tier, number> = { bronze: 150, silver: 300, gold: 600 }
const presetsFor = (tier: Tier) => [1, 2, 4, 8].map((m) => MIN_BID[tier] * m)
const money = (n: number) => `$${n.toLocaleString('en-US')}`
const label = (b: BidEntry) => (b.hidden ? 'Gizli Teklif' : b.player)

const SEED_BIDS: BidEntry[] = [
  { id: 'b1', player: 'Mike_T', amount: 600, hidden: false },
  { id: 'b2', player: 'Cem',    amount: 300, hidden: true },
  { id: 'b3', player: 'Aria',   amount: 150, hidden: false },
  { id: 'b4', player: 'Berkay', amount: 300, hidden: false },
  { id: 'b5', player: 'Deniz',  amount: 150, hidden: true },
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
  const [finalBidUsed, setFinalBidUsed] = useState(false)

  // final fazda tek teklif → verildikten sonra kilit
  const lockBids = phase === 'final' && finalBidUsed

  const placeBid = (amount: number) => {
    if (!amount || amount <= 0 || phase === 'ended') return
    if (phase === 'final' && finalBidUsed) return
    setBids((prev) => [{ id: `me-${Date.now()}`, player: 'Sen', amount, hidden }, ...prev].slice(0, 5))
    setPrice((p) => p + amount)
    if (phase === 'final') setFinalBidUsed(true)
    // TODO: FiveM → fetchNui('placeBid', { auctionId: item.id, amount, hidden, blind: phase === 'final' })
  }
  const submitCustom = () => {
    const amt = Math.round(Number(custom))
    if (Number.isFinite(amt) && amt > 0) { placeBid(amt); setCustom('') }
  }

  const winner = useMemo(() => {
    if (item.winner) return { name: item.winner, amount: item.paid ?? price }
    const top = [...bids].sort((a, b) => b.amount - a.amount)[0]
    return top ? { name: label(top), amount: top.amount } : null
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
          <span className={styles.blindText}>
            {finalBidUsed
              ? 'Son teklifin verildi — sonucu bekle. Rakip teklifleri gizli.'
              : 'Son 10 saniye — rakip teklifleri gizli. Tek son teklifini gir!'}
          </span>
        </div>
      ) : (
        <ul className={styles.bidList}>
          {bids.map((b) => (
            <li key={b.id} className={[styles.bidRow, b.hidden && styles.secret].filter(Boolean).join(' ')}>
              <span className={styles.player}>{label(b)}</span>
              <span className={styles.amount}><SevenSegment value={`${b.amount}$`} color="#5fe06f" size={12} /></span>
            </li>
          ))}
        </ul>
      )}

      {phase === 'ended' ? (
        <div className={styles.winner}>
          <span className={styles.winnerIcon}>🏆</span>
          <span className={styles.winnerName}>{winner?.name ?? '—'}</span>
          <span className={styles.winnerAmount}>{winner ? money(winner.amount) : ''}</span>
        </div>
      ) : (
        <>
          <div className={styles.presets}>
            {presets.map((amt) => (
              <button key={amt} type="button" className={styles.preset} disabled={lockBids} onClick={() => placeBid(amt)}>
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
              disabled={lockBids}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
            />
            <button type="button" className={styles.customBtn} disabled={lockBids} onClick={submitCustom}>Bid Ver</button>
          </div>

          {/* Gizli Bid — koşulsuz (zaten ended değiliz) → open + final'de görünür */}
          <button
            type="button"
            className={[styles.secretPlate, hidden && styles.secretOn].filter(Boolean).join(' ')}
            onClick={() => setHidden((h) => !h)}
            disabled={lockBids}
            aria-pressed={hidden}
          >
            <span className={styles.secretDot} />
            <span className={styles.secretText}>Gizli Bid</span>
            <span className={styles.secretState}>{hidden ? 'AÇIK' : 'KAPALI'}</span>
          </button>
        </>
      )}
    </div>
  )
}