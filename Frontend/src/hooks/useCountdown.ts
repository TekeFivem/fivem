import { useEffect, useState } from 'react'
import { toSeconds, formatHMS } from '../lib/auctions'

export const useCountdown = (endTime: string) => {
  const [remaining, setRemaining] = useState(() => toSeconds(endTime))

  useEffect(() => {
    setRemaining(toSeconds(endTime))
    const id = setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [endTime])

  return formatHMS(remaining)
}