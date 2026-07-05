import { useEffect, useRef, useState } from 'react'
import styles from './SelectControl.module.scss'

export interface SelectOption {
  value: string
  label: string
}

interface SelectControlProps {
  label?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export const SelectControl = ({
  label,
  value,
  options,
  onChange,
}: SelectControlProps) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const current = options.find((o) => o.value === value) ?? options[0]

  // dışarı tıklayınca kapat
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const handleSelect = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  return (
    <div className={styles.group} ref={rootRef}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.selectWrap}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles.value}>{current?.label}</span>
          <span
            className={[styles.caret, open && styles.caretOpen]
              .filter(Boolean)
              .join(' ')}
          >
            ▾
          </span>
        </button>

        {open && (
          <ul className={styles.menu} role="listbox">
            {options.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={[styles.option, o.value === value && styles.optionActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelect(o.value)}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}