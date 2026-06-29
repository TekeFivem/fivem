import { useEffect, useState } from 'react'

const toSeconds = (t: string) => {
  const p = t.split(':').map(Number)
  const [h, m, s] = p.length === 3 ? p : [0, p[0] ?? 0, p[1] ?? 0]
  return h * 3600 + m * 60 + s
}

const format = (total: number) => {
  const c = Math.max(0, total)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(c / 3600))}:${pad(Math.floor((c % 3600) / 60))}:${pad(c % 60)}`
}

export const useCountdown = (endTime: string) => {
  const [remaining, setRemaining] = useState(() => toSeconds(endTime))

  useEffect(() => {
    setRemaining(toSeconds(endTime))
    const id = setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [endTime])

  return format(remaining)
}