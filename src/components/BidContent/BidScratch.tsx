import { useMemo, useState } from 'react'
import styles from './BidScratch.module.scss'

interface ScratchItem { id: string; name: string; emoji?: string }

const SCRATCH_POOL: ScratchItem[] = [
  { id: 'phone',  name: 'Telefon',    emoji: '📱' },
  { id: 'tv',     name: 'Televizyon', emoji: '📺' },
  { id: 'laptop', name: 'Laptop',     emoji: '💻' },
  { id: 'watch',  name: 'Saat',       emoji: '⌚' },
]
const CELL_COUNT = 6
const EMPTY_COUNT = CELL_COUNT - SCRATCH_POOL.length // sabit boş sayısı
const BASE_COST = 250
const GROWTH = 1.6
const scratchCost = (opened: number) => Math.round(BASE_COST * Math.pow(GROWTH, opened))
const money = (n: number) => `$${n.toLocaleString('en-US')}`

interface ScratchCell { id: string; item: ScratchItem | null }

const mulberry32 = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const buildCells = (seed: number): ScratchCell[] => {
  const rand = mulberry32(seed)
  const contents: (ScratchItem | null)[] = [
    ...SCRATCH_POOL,
    ...Array.from({ length: EMPTY_COUNT }, () => null),
  ]
  for (let i = contents.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[contents[i], contents[j]] = [contents[j], contents[i]]
  }
  return contents.map((item, i) => ({ id: `cell-${i}`, item }))
}

export const BidScratch = () => {
  const seed = useMemo(() => Math.floor(Math.random() * 1e9), [])
  const cells = useMemo(() => buildCells(seed), [seed])
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const nextCost = scratchCost(revealed.size)

  const reveal = (id: string) => {
    if (revealed.has(id)) return
    setRevealed((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    // TODO: FiveM → fetchNui('scratchBox', { cellId: id })
  }

  return (
  <div className={styles.panel}>
    <div className={styles.grid}>
      {cells.map((cell) => {
        const open = revealed.has(cell.id)
        return (
          <button
            key={cell.id}
            type="button"
            className={[styles.box, open && styles.open].filter(Boolean).join(' ')}
            onClick={() => reveal(cell.id)}
            disabled={open}
          >
            {open ? (
              cell.item ? (
                <span className={styles.inner}>
                  <span className={styles.emoji}>{cell.item.emoji}</span>
                  <span className={styles.name}>{cell.item.name}</span>
                </span>
              ) : (
                <span className={styles.empty}>BOŞ</span>
              )
            ) : (
              <span className={styles.cover}>
                <span className={styles.q}>?</span>
                <span className={styles.price}>{money(nextCost)}</span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  </div>
)
}