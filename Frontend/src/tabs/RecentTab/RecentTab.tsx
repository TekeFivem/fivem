import { useEffect, useState } from 'react'
import { useRecentFiltersStore } from '../../store/createFiltersStore'
import { AuctionView } from '../../components/AuctionView/AuctionView'
import { fetchNui } from '../../lib/fetchNui'
import type { AuctionItem } from '../../lib/auctions'

const MOCK: AuctionItem[] = [
  { kind: 'itembox', id: 'r5', name: 'TMB-X', tier: 'gold', endTime: '00:00:00', bid: 30000, participants: 18, winner: 'Kaan_99', paid: 38500 },
]

export const RecentTab = () => {
  const f = useRecentFiltersStore()
  const [page, setPage] = useState<{ items: AuctionItem[]; totalPages: number }>({ items: MOCK, totalPages: 1 })

  useEffect(() => {
    const req = {
      page: f.page, pageSize: 6,
      tiers: f.tiers, kinds: f.kinds,
      bidPreset: f.bidPreset, bidDir: f.bidDir,
      nameQuery: f.nameQuery, sortKey: f.sortKey, sortDir: f.sortDir,
    }
    fetchNui<{ items: AuctionItem[]; total: number }>('getRecent', req, { items: MOCK, total: MOCK.length })
      .then((r) => setPage({ items: r.items, totalPages: Math.max(1, Math.ceil(r.total / 6)) }))
      .catch(() => { })
  }, [f.page, f.tiers, f.kinds, f.bidPreset, f.bidDir, f.nameQuery, f.sortKey, f.sortDir])

  return (
    <AuctionView
      items={page.items}
      store={useRecentFiltersStore}
      variant="recent"
      timeUnitSeconds={3600}
      searchByName
      bidMode="history"
      serverPaged
      serverTotalPages={page.totalPages}
      labels={{ bid: 'Paid' }}
    />
  )
}
