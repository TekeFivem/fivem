import { create } from 'zustand'
import type { AuctionItem } from '../lib/auctions'

const MAX_JOINED = 20

interface JoinedState {
  items: AuctionItem[]
  join: (item: AuctionItem) => void
  updateStats: (p: { id: string; bid?: number; participants?: number }) => void
  setResult: (id: string, result: 'won' | 'lost') => void
  clear: () => void
}

export const useJoinedStore = create<JoinedState>((set) => ({
  items: [],

  join: (item) =>
    set((s) => {
      const without = s.items.filter((x) => x.id !== item.id)
      return { items: [{ ...item }, ...without].slice(0, MAX_JOINED) }
    }),

  // canlı bid / participant güncellemesi (auctionStats delta'sı)
  updateStats: ({ id, bid, participants }) =>
    set((s) => ({
      items: s.items.map((x) =>
        x.id === id
          ? {
              ...x,
              ...(bid !== undefined ? { bid } : {}),
              ...(participants !== undefined ? { participants } : {}),
            }
          : x,
      ),
    })),

  setResult: (id, result) =>
    set((s) => ({
      items: s.items.map((x) => (x.id === id ? { ...x, result, decidedAt: Date.now() } : x)),
    })),

  clear: () => set({ items: [] }),
}))