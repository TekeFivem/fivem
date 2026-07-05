import { useEffect } from 'react'
import { useNuiEvent } from './useNuiEvent'
import { useTabletStore } from '../store/tabletStore'
import { fetchNui } from '../lib/fetchNui'

// Lua 'setVisible' event'ini store'a bağlar + ESC ile kapatır.
export function useTabletVisibility() {
  const open = useTabletStore((s) => s.open)
  const close = useTabletStore((s) => s.close)
  const isOpen = useTabletStore((s) => s.isOpen)

  useNuiEvent<boolean>('setVisible', (v) => (v ? open() : close()))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close()
        fetchNui('close').catch(() => {})
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])
}