import type { CSSProperties } from 'react'
import styles from './SegmentedControl.module.scss'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  accent?: string // aktifken parıltı rengi
}

interface SegmentedControlProps<T extends string> {
  label?: string
  options: SegmentOption<T>[]
  selected: T[] // çoklu seçim
  onToggle: (value: T) => void
}

export function SegmentedControl<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.group}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.segments}>
        {options.map((opt) => {
          const active = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              className={[styles.seg, active && styles.active]
                .filter(Boolean)
                .join(' ')}
              style={
                opt.accent
                  ? ({ '--seg-accent': opt.accent } as CSSProperties)
                  : undefined
              }
              onClick={() => onToggle(opt.value)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}