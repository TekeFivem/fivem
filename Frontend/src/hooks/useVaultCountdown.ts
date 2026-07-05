import { useNow } from './useNow'

const pad = (n: number) => String(n).padStart(2, '0')

export const useVaultCountdown = (deadline: number) => {
  const now = useNow(true)
  const diff = deadline - now
  const expired = diff <= 0
  const total = Math.max(0, Math.floor(diff / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return { remaining: `${pad(h)}:${pad(m)}:${pad(s)}`, expired }
}