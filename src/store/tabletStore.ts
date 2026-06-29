import { create } from 'zustand'

interface TabletState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useTabletStore = create<TabletState>((set) => ({
  isOpen: true, // geliştirme için açık; FiveM'de NUI mesajıyla yönetilir
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))