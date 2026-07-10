import { useEffect, useState } from 'react'
import { fetchNui } from '../../lib/fetchNui'
import styles from './BidScratch.module.scss'

interface ScratchLabel { id: string; name: string; emoji?: string }
interface ScratchCell { index: number; opened: boolean; empty?: boolean; item?: ScratchLabel }
interface ScratchState {
  ok?: boolean
  reason?: string
  cellCount: number
  openedCount: number
  nextCost: number
  cells: ScratchCell[]
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`

// tarayıcı geliştirme için mock
const MOCK: ScratchState = {
  ok: true, cellCount: 6, openedCount: 0, nextCost: 250,
  cells: Array.from({ length: 6 }, (_, i) => ({ index: i, opened: false })),
}

interface Props { auctionId: string; disabled?: boolean }

export const BidScratch = ({ auctionId, disabled }: Props) => {
  const [state, setState] = useState<ScratchState | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    let timer: number | undefined
    const load = () => {
      fetchNui<ScratchState>('getScratch', { auctionId }, MOCK)
        .then((res) => {
          if (!alive) return
          setState(res)
          // katılımcı değilse periyodik dene, katılınca dur
          if (res && res.ok === false && res.reason === 'notparticipant') {
            if (!timer) timer = window.setInterval(load, 3000)
          } else if (timer) {
            window.clearInterval(timer); timer = undefined
          }
        })
        .catch(() => { if (alive) setState(MOCK) })
    }
    load()
    return () => { alive = false; if (timer) window.clearInterval(timer) }
  }, [auctionId])

  const locked = !!disabled || (!!state && state.ok === false && state.reason === 'notparticipant')
  const cellCount = state?.cellCount ?? 6
  const nextCost = state?.nextCost ?? 0
  const cells: ScratchCell[] = state?.cells ?? Array.from({ length: cellCount }, (_, i) => ({ index: i, opened: false }))

  const open = (index: number) => {
    if (busy || locked) return
    const cell = cells.find((c) => c.index === index)
    if (!cell || cell.opened) return
    setBusy(true)
    fetchNui<{ ok?: boolean; reason?: string; index: number; empty?: boolean; item?: ScratchLabel; openedCount: number; nextCost: number }>(
      'scratchOpen',
      { auctionId, cellIndex: index },
      { ok: true, index, empty: Math.random() < 0.3, item: { id: 'phone', name: 'Telefon', emoji: '📱' }, openedCount: (state?.openedCount ?? 0) + 1, nextCost: Math.round(nextCost * 1.6) },
    )
      .then((res) => {
        if (!res || res.ok === false) return
        setState((prev) => {
          const base = prev ?? MOCK
          return {
            ...base,
            openedCount: res.openedCount,
            nextCost: res.nextCost,
            cells: base.cells.map((c) =>
              c.index === index ? { index, opened: true, empty: res.empty, item: res.item } : c),
          }
        })
      })
      .finally(() => setBusy(false))
  }

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        {cells.map((cell) => (
          <button
            key={cell.index}
            type="button"
            className={[styles.box, cell.opened && styles.open].filter(Boolean).join(' ')}
            onClick={() => open(cell.index)}
            disabled={cell.opened || busy || locked}
          >
            {cell.opened ? (
              cell.empty ? (
                <span className={styles.empty}>BOŞ</span>
              ) : (
                <span className={styles.inner}>
                  <span className={styles.emoji}>{cell.item?.emoji}</span>
                  <span className={styles.name}>{cell.item?.name}</span>
                </span>
              )
            ) : (
              <span className={styles.cover}>
                <span className={styles.q}>?</span>
                <span className={styles.price}>{money(nextCost)}</span>
              </span>
            )}
          </button>
        ))}
      </div>
      {locked && (
        <div className={styles.locked}>
          <span className={styles.lockedText}>{disabled ? 'Kapandı' : 'Katılınca açılır'}</span>
        </div>
      )}
    </div>
  )
}