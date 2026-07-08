import { AuctionView } from '../../components/AuctionView/AuctionView'
import { useJoinedStore } from '../../store/joinedStore'
import { useJoinedFiltersStore } from '../../store/createFiltersStore'
import { ONGOING_TIME_OPTIONS, formatHMS } from '../../lib/auctions'
import { useNow } from '../../hooks/useNow'

export const JoinedTab = () => {
  const raw = useJoinedStore((s) => s.items)
  const now = useNow(true) // canlı saat — sayaç bunun üzerinden akar

  // Karara bağlanmamış item'ların endTime'ını MUTLAK deadline'dan hesapla.
  // Böylece tab değişip geri gelince sayaç 15'ten değil, gerçek kalan süreden devam eder.
  const items = raw.map((it) =>
    it.result || it.deadline == null
      ? it
      : { ...it, endTime: formatHMS(Math.max(0, Math.round((it.deadline - now) / 1000))) },
  )

  return (
    <AuctionView
      items={items}
      store={useJoinedFiltersStore}
      variant="joined"
      timeOptions={ONGOING_TIME_OPTIONS}
      timeUnitSeconds={60}
      bidMode="live"
    />
  )
}