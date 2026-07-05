import { create } from 'zustand'

interface TabletState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useTabletStore = create<TabletState>((set) => ({
  isOpen: import.meta.env.DEV, // dev: açık · oyunda: kapalı (Lua setVisible ile açılır)
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))