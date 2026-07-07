import { create } from 'zustand'
import type { AuctionItem } from '../lib/auctions'

type ListKey = 'ongoing' | 'upcoming'

interface AuctionState {
  loaded: boolean
  ongoing: AuctionItem[]
  upcoming: AuctionItem[]
  setSnapshot: (s: { ongoing: AuctionItem[]; upcoming: AuctionItem[] }) => void
  updateStats: (p: { id: string; bid?: number; participants?: number; endTime?: string }) => void
  addAuction: (p: { list: ListKey; item: AuctionItem }) => void
  openAuction: (p: { id: string }) => void
  endAuction: (p: { id: string }) => void
}

const patch = (arr: AuctionItem[], id: string, p: Partial<AuctionItem>) =>
  arr.map((a) => (a.id === id ? { ...a, ...p } : a))

export const useAuctionStore = create<AuctionState>((set) => ({
  loaded: false,
  ongoing: [],
  upcoming: [],

  setSnapshot: (s) => set({ ongoing: s.ongoing, upcoming: s.upcoming, loaded: true }),

  updateStats: ({ id, bid, participants, endTime }) =>
    set((st) => {
      const p: Partial<AuctionItem> = {}
      if (bid !== undefined) p.bid = bid
      if (participants !== undefined) p.participants = participants
      if (endTime !== undefined) p.endTime = endTime   // ✅ endTime senkronizasyonu
      return { ongoing: patch(st.ongoing, id, p), upcoming: patch(st.upcoming, id, p) }
    }),

  addAuction: ({ list, item }) =>
    set((st) =>
      st[list].some((a) => a.id === item.id)
        ? {}
        : ({ [list]: [item, ...st[list]] } as Partial<AuctionState>)
    ),

  openAuction: ({ id }) =>
    set((st) => {
      const found = st.upcoming.find((a) => a.id === id)
      return {
        upcoming: st.upcoming.filter((a) => a.id !== id),
        ongoing: found ? [found, ...st.ongoing] : st.ongoing,
      }
    }),

  // recent artık cache değil (sunucu-sayfalı) → sadece ongoing'den çıkar
  endAuction: ({ id }) =>
    set((st) => ({ ongoing: st.ongoing.filter((a) => a.id !== id) })),
}))
