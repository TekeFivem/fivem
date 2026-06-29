import { useEffect, useState } from 'react'

export const useNow = (live: boolean) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [live])

  return now
}