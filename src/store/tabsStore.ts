import { create } from 'zustand'

export type AuctionTab =
  | 'Ongoing'
  | 'Upcoming'
  | 'Recent'
  | 'Joined'
  | 'Vault'
  | 'Loot'
  | 'Leaderboard'

interface TabsState {
  activeTab: AuctionTab
  setActiveTab: (tab: AuctionTab) => void
}

export const useTabsStore = create<TabsState>((set) => ({
  activeTab: 'Ongoing',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))