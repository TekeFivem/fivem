import { useEffect, useRef } from 'react'

type Handler<T> = (data: T) => void

// Lua'dan gelen SendNUIMessage({ action, data }) mesajlarını dinler.
export function useNuiEvent<T = unknown>(action: string, handler: Handler<T>) {
  const saved = useRef<Handler<T>>(handler)
  saved.current = handler
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      const msg = e.data ?? {}
      if (msg.action === action) saved.current(msg.data as T)
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [action])
}