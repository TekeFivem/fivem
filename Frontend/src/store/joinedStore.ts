import { create } from 'zustand'
import type { AuctionItem } from '../lib/auctions'
import { toSeconds } from '../lib/auctions'

const MAX_JOINED = 20

interface JoinedState {
  items: AuctionItem[]
  join: (item: AuctionItem) => void
  updateStats: (p: { id: string; bid?: number; participants?: number; endTime?: string }) => void
  finish: (p: { id: string; winner?: string; paid?: number }) => void
  setResult: (id: string, result: 'won' | 'lost') => void
  clear: () => void
  hydrate: (items: AuctionItem[]) => void
}

const withDeadline = (item: AuctionItem): AuctionItem => ({
  ...item,
  deadline: item.deadline ?? Date.now() + toSeconds(item.endTime) * 1000,
})

export const useJoinedStore = create<JoinedState>((set) => ({
  items: [],
  hydrate: (items) =>
    set(() => ({
      items: items.map((it) => withDeadline({ ...it })).slice(0, MAX_JOINED),
    })),
  join: (item) =>
    set((s) => {
      const without = s.items.filter((x) => x.id !== item.id)
      return { items: [withDeadline({ ...item }), ...without].slice(0, MAX_JOINED) }
    }),

  updateStats: ({ id, bid, participants, endTime }) =>
    set((s) => ({
      items: s.items.map((x) =>
        x.id === id
          ? {
            ...x,
            ...(bid !== undefined ? { bid } : {}),
            ...(participants !== undefined ? { participants } : {}),
            ...(endTime !== undefined
              ? { endTime, deadline: Date.now() + toSeconds(endTime) * 1000 }
              : {}),
          }
          : x,
      ),
    })),

  finish: ({ id, winner, paid }) =>
    set((s) => ({
      items: s.items.map((x) =>
        x.id === id
          ? {
            ...x,
            winner,
            paid,
            endTime: '00:00:00',
            deadline: Date.now(), // artık bitti
            result: x.result ?? 'lost',
            decidedAt: Date.now(),
          }
          : x,
      ),
    })),

  setResult: (id, result) =>
    set((s) => ({
      items: s.items.map((x) =>
        x.id === id ? { ...x, result, decidedAt: Date.now() } : x
      ),
    })),

  clear: () => set({ items: [] }),
}))
