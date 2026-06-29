import type { CSSProperties } from 'react'
import styles from './SevenSegment.module.scss'

const SEGMENTS: Record<string, string[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  '-': ['g'],
}
const ALL = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const

const Digit = ({ char }: { char: string }) => {
  const on = SEGMENTS[char] ?? []
  return (
    <span className={styles.digit}>
      {ALL.map((s) => (
        <span
          key={s}
          className={[styles.seg, styles[s], on.includes(s) ? '' : styles.off]
            .filter(Boolean)
            .join(' ')}
        />
      ))}
    </span>
  )
}

interface SevenSegmentProps {
  value: string | number // "01:23:45" veya 10000 veya "10000$"
  color?: string
  size?: number // basamak yüksekliği (px)
}

export const SevenSegment = ({ value, color = '#ff4d4d', size = 18 }: SevenSegmentProps) => (
  <span
    className={styles.display}
    style={{ '--seg-color': color, '--seg-size': `${size}px` } as CSSProperties}
  >
    {String(value).split('').map((ch, i) => {
      if (ch === ':')
        return (
          <span key={i} className={styles.colon}>
            <span />
            <span />
          </span>
        )
      if (SEGMENTS[ch]) return <Digit key={i} char={ch} />
      return (
        <span key={i} className={styles.symbol}>
          {ch}
        </span>
      )
    })}
  </span>
)