import { useEffect } from 'react'
import { fetchNui } from '../lib/fetchNui'
import { useNuiEvent } from './useNuiEvent'
import { useAuctionStore } from '../store/auctionStore'
import type { AuctionItem } from '../lib/auctions'

const MOCK = {
  ongoing: [
    { kind: 'storage', id: 's1', name: 'STR-12', tier: 'gold', endTime: '01:23:45', bid: 10000, participants: 7 },
  ] as AuctionItem[],
  upcoming: [] as AuctionItem[],
}

export function useAuctionSync() {
  const loaded = useAuctionStore((s) => s.loaded)
  const setSnapshot = useAuctionStore((s) => s.setSnapshot)
  const updateStats = useAuctionStore((s) => s.updateStats)
  const addAuction = useAuctionStore((s) => s.addAuction)
  const openAuction = useAuctionStore((s) => s.openAuction)
  const endAuction = useAuctionStore((s) => s.endAuction)

  useEffect(() => {
    if (loaded) return
    fetchNui('getSnapshot', {}, MOCK).then(setSnapshot).catch(() => {})
  }, [loaded, setSnapshot])

  useNuiEvent('auctionSnapshot', setSnapshot) // abone olunca sunucu güncel snapshot push eder
  useNuiEvent('auctionStats', updateStats)
  useNuiEvent('auctionNew', addAuction)
  useNuiEvent('auctionOpen', openAuction)
  useNuiEvent('auctionEnded', endAuction)
}