import { useEffect, useMemo, useState } from 'react'
import type { AuctionItem, Tier } from '../../lib/auctions'
import { SevenSegment } from '../SevenSegment/SevenSegment'
import { BidIcon } from '../icons'
import { fetchNui } from '../../lib/fetchNui'
import { useNuiEvent } from '../../hooks/useNuiEvent'
import styles from './BidPanel.module.scss'

interface BidEntry { id: string; player: string; amount: number; hidden: boolean; doubled?: boolean }

const MIN_BID: Record<Tier, number> = { bronze: 150, silver: 300, gold: 600 }
const presetsFor = (tier: Tier) => [1, 2, 4, 8].map((m) => MIN_BID[tier] * m)
const money = (n: number) => `$${n.toLocaleString('en-US')}`
const label = (b: BidEntry) => (b.hidden ? 'Gizli Teklif' : b.player)

interface Props {
  item: AuctionItem
  phase?: 'open' | 'final' | 'ended'
}

export const BidPanel = ({ item, phase = 'open' }: Props) => {
  const tier: Tier = item.tier ?? 'bronze'
  const presets = useMemo(() => presetsFor(tier), [tier])
  const [bids, setBids] = useState<BidEntry[]>([])
  const [price, setPrice] = useState(item.bid)
  const [hidden, setHidden] = useState(false)
  const [custom, setCustom] = useState('')
  const [finalBidUsed, setFinalBidUsed] = useState(false)

  // hack durumları (epoch ms). 0 = etkisiz
  const [lockUntil, setLockUntil] = useState(0)
  const [blindUntil, setBlindUntil] = useState(0)
  const [frozenUntil, setFrozenUntil] = useState(0)
  const [revealed, setRevealed] = useState<string | null>(null)
  const [fakeArmed, setFakeArmed] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const active = Math.max(lockUntil, blindUntil, frozenUntil)
    if (active <= Date.now()) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [lockUntil, blindUntil, frozenUntil])

  const secLeft = (until: number) => Math.max(0, Math.ceil((until - now) / 1000))
  const lockLeft = secLeft(lockUntil)
  const blindLeft = secLeft(blindUntil)
  const frozenLeft = secLeft(frozenUntil)
  const isLocked = lockLeft > 0
  const isBlind = blindLeft > 0
  const isFrozen = frozenLeft > 0

  // açılışta son 5 bid
  useEffect(() => {
    fetchNui<BidEntry[]>('getBids', { id: item.id }, [])
      .then(setBids)
      .catch(() => { })
  }, [item.id])

  // canlı fiyat
  useEffect(() => { setPrice(item.bid) }, [item.bid])

  // canlı: başkalarının teklifleri
  useNuiEvent<{ id: string; entry: BidEntry }>('auctionBid', (d) => {
    if (d.id !== item.id) return
    setBids((prev) => [d.entry, ...prev].slice(0, 5))
  })

  // hack event'leri
  useNuiEvent<{ id: string; secondsLeft: number }>('bidLocked', (d) => {
    if (d.id === item.id) setLockUntil(Date.now() + (d.secondsLeft ?? 0) * 1000)
  })
  useNuiEvent<{ id: string; secondsLeft: number }>('bidBlinded', (d) => {
    if (d.id === item.id) setBlindUntil(Date.now() + (d.secondsLeft ?? 0) * 1000)
  })
  useNuiEvent<{ id: string; secondsLeft: number }>('priceFrozen', (d) => {
    if (d.id === item.id) setFrozenUntil(Date.now() + (d.secondsLeft ?? 0) * 1000)
  })
  useNuiEvent<{ id: string; name: string }>('hiddenRevealed', (d) => {
    if (d.id === item.id) setRevealed(d.name)
  })
  useNuiEvent<{ id: string }>('fakeArmed', (d) => {
    if (d.id === item.id) setFakeArmed(true)
  })

  // reveal banner otomatik kaybolsun
  useEffect(() => {
    if (!revealed) return
    const t = setTimeout(() => setRevealed(null), 8000)
    return () => clearTimeout(t)
  }, [revealed])

  const lockBids = (phase === 'final' && finalBidUsed) || isLocked || isFrozen

  const placeBid = (amount: number) => {
    if (!amount || amount <= 0 || phase === 'ended') return
    if (isLocked || isFrozen) return
    if (phase === 'final' && finalBidUsed) return
    fetchNui<{ ok?: boolean; price?: number; doubled?: boolean; fake?: boolean; reason?: string; secondsLeft?: number }>(
      'placeBid',
      { id: item.id, amount, hidden },
      { ok: true, price: price + amount },
    )
      .then((res) => {
        if (!res || res.ok === false) {
          if (res?.reason === 'locked') setLockUntil(Date.now() + (res.secondsLeft ?? 0) * 1000)
          if (res?.reason === 'frozen') setFrozenUntil(Date.now() + (res.secondsLeft ?? 0) * 1000)
          return
        }
        if (res.fake) setFakeArmed(false) // sahte teklif kullanıldı
        const shown = res.doubled ? amount * 2 : amount
        setPrice(res.price ?? price + shown)
        setBids((prev) => [{ id: `me-${Date.now()}`, player: 'Sen', amount: shown, hidden, doubled: !!res.doubled }, ...prev].slice(0, 5))
        if (phase === 'final') setFinalBidUsed(true)
      })
  }

  const submitCustom = () => {
    const amt = Math.round(Number(custom))
    if (Number.isFinite(amt) && amt > 0) {
      placeBid(amt)
      setCustom('')
    }
  }

  const winner = useMemo(() => {
    if (item.winner) return { name: item.winner, amount: item.paid ?? price }
    const top = [...bids].sort((a, b) => b.amount - a.amount)[0]
    return top ? { name: label(top), amount: top.amount } : null
  }, [bids, item.winner, item.paid, price])

  const priceLabel = phase === 'ended' ? 'Son Fiyat' : phase === 'final' ? 'Son Teklif' : isFrozen ? 'Donduruldu' : 'Güncel Fiyat'
  const priceValue = phase === 'ended' ? (winner?.amount ?? price) : price

  return (
    <div className={styles.panel}>
      <div className={[styles.priceBar, isFrozen && styles.priceBarFrozen].filter(Boolean).join(' ')}>
        <span className={styles.priceIcon}><BidIcon /></span>
        <span className={styles.priceLabel}>{priceLabel}</span>
        <span className={styles.priceValue}>
          <SevenSegment value={`${priceValue}$`} color={isFrozen ? '#6ec8ff' : '#f3d979'} size={20} />
        </span>
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
      ) : isBlind ? (
        <div className={styles.blindHack}>
          <span className={styles.blindHackIcon}>🚫</span>
          <span className={styles.blindHackText}>HACKED — Teklifler gizlendi</span>
          <span className={styles.blindHackTimer}>{blindLeft}s</span>
        </div>
      ) : (
        <ul className={styles.bidList}>
          {bids.map((b) => (
            <li key={b.id} className={[styles.bidRow, b.hidden && styles.secret, b.doubled && styles.doubled].filter(Boolean).join(' ')}>
              <span className={styles.player}>{label(b)}</span>
              <span className={styles.right}>
                {b.doubled && <span className={styles.x2}>×2</span>}
                <span className={styles.amount}>
                  <SevenSegment value={`${b.amount}$`} color="#5fe06f" size={12} />
                </span>
              </span>
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
          {isFrozen && (
            <div className={styles.freezeNote}>
              <span className={styles.freezeIcon}>❄️</span>
              <span className={styles.freezeText}>Fiyat donduruldu — teklif kapalı</span>
              <span className={styles.freezeTimer}>{frozenLeft}s</span>
            </div>
          )}
          {isLocked && (
            <div className={styles.lockNote}>
              <span className={styles.lockIcon}>⛔</span>
              <span className={styles.lockText}>HACKED — Teklif kilitli</span>
              <span className={styles.lockTimer}>{lockLeft}s</span>
            </div>
          )}
          {revealed && (
            <div className={styles.revealNote}>
              <span className={styles.revealIcon}>👁</span>
              <span className={styles.revealText}>Gizli teklif sahibi: {revealed}</span>
            </div>
          )}
          {fakeArmed && !isFrozen && (
            <div className={styles.fakeNote}>
              <span className={styles.fakeIcon}>🎭</span>
              <span className={styles.fakeText}>Sıradaki teklifin SAHTE (para düşmez)</span>
            </div>
          )}
          <div className={styles.presets}>
            {presets.map((amt) => (
              <button
                key={amt}
                type="button"
                className={styles.preset}
                disabled={lockBids}
                onClick={() => placeBid(amt)}
              >
                +{amt}$
              </button>
            ))}
          </div>
          <div className={styles.customRow}>
            <input
              className={styles.customInput}
              type="number"
              min={0}
              placeholder={isFrozen ? 'Fiyat donduruldu…' : isLocked ? 'Teklif kilitli…' : 'Özel tutar'}
              value={custom}
              disabled={lockBids}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
            />
            <button
              type="button"
              className={styles.customBtn}
              disabled={lockBids}
              onClick={submitCustom}
            >
              Bid Ver
            </button>
          </div>
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