import { useState } from 'react'
import { useCountdown } from './useCountdown'

interface UseAuctionCardArgs {
  endTime: string
  onWaypoint?: (active: boolean) => void
  onRemind?: (active: boolean) => void
}

export const useAuctionCard = ({ endTime, onWaypoint, onRemind }: UseAuctionCardArgs) => {
  const remaining = useCountdown(endTime)
  const [marked, setMarked] = useState(false)
  const [compassActive, setCompassActive] = useState(false)
  const [reminded, setReminded] = useState(false)

  const handleLocation = () =>
    setMarked((prev) => {
      const next = !prev
      setCompassActive(next) 
      return next
    })

  const handleCompass = () => {
    if (!marked) return
    setCompassActive((a) => {
      const next = !a
      onWaypoint?.(next)
      return next
    })
  }

  const handleReminder = () =>
    setReminded((prev) => {
      const next = !prev
      onRemind?.(next)
      return next
    })

  return { remaining, marked, compassActive, reminded, handleLocation, handleCompass, handleReminder }
}