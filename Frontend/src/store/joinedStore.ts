import { create } from 'zustand'
import type { AuctionItem } from '../lib/auctions'

const MAX_JOINED = 20

interface JoinedState {
  items: AuctionItem[]
  join: (item: AuctionItem) => void
  setResult: (id: string, result: 'won' | 'lost') => void
  clear: () => void
}

export const useJoinedStore = create<JoinedState>((set) => ({
  items: [],

  join: (item) =>
    set((s) => {
      const without = s.items.filter((x) => x.id !== item.id)
      const joinedItem: AuctionItem = { ...item, paid: item.bid }
      return { items: [joinedItem, ...without].slice(0, MAX_JOINED) }
    }),

  // sonuç belli olunca (başkası kazandı / sen kazandın) çağrılır
  setResult: (id, result) =>
    set((s) => ({
      items: s.items.map((x) =>
        x.id === id ? { ...x, result, decidedAt: Date.now() } : x,
      ),
    })),

  clear: () => set({ items: [] }),
}))