import { useMemo, useState } from 'react'
import { buildScratchCells, scratchCost } from '../../lib/scratch'
import styles from './ScratchGrid.module.scss'

const money = (n: number) => `$${n.toLocaleString('en-US')}`

export const ScratchGrid = () => {
  // Diziliş: item seti herkeste aynı, pozisyon farklı. Mock: her açılışta seed.
  const seed = useMemo(() => Math.floor(Math.random() * 1e9), [])
  const cells = useMemo(() => buildScratchCells(seed), [seed])

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
                <span className={styles.content}>
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
  )
}