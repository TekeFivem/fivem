import { useState } from 'react'
import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { VaultActionModal, type VaultAction } from '../../components/VaultActionModal/VaultActionModal'
import { useVaultFiltersStore } from '../../store/createFiltersStore'
import { VAULT_TIME_OPTIONS, toSeconds, formatHMS, type AuctionItem } from '../../lib/auctions'

const INITIAL: AuctionItem[] = [
  { kind: 'storage',   id: 'va1', name: 'STR-12', tier: 'gold',   endTime: '23:40:00', bid: 12500, participants: 7, estValue: 18000, security: 'secured' },
  { kind: 'container', id: 'va2', name: 'CNT-A',  tier: 'silver', endTime: '18:05:00', bid: 9100,  participants: 5, estValue: 9000,  security: 'insured' },
  { kind: 'storage',   id: 'va4', name: 'STR-07', tier: 'silver', endTime: '00:00:05', bid: 5200,  participants: 4, estValue: 6500,  security: 'none' },
]

export const VaultTab = () => {
  const [items, setItems] = useState<AuctionItem[]>(INITIAL)
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = items.find((i) => i.id === activeId) ?? null

  const handleAction = (id: string, action: VaultAction) => {
    setItems((prev) =>
      prev.flatMap((it) => {
        if (it.id !== id) return [it]
        switch (action.type) {
          case 'insurance':
            return [{ ...it, security: it.security === 'secured' ? it.security : 'insured' }]
          case 'security':
            return [{ ...it, security: 'secured' }]
          case 'extend':
            return [{ ...it, endTime: formatHMS(toSeconds(it.endTime) + action.hours * 3600) }]
          // boşaltma/satış → kutu vault'tan çıkar (sonra loot/satış akışına bağlanacak)
          case 'cleaner':
          case 'cleanSelf':
          case 'sellSystem':
          case 'sellPlayer':
            console.log('vault action', it.id, action) // TODO: fetchNui
            return []
          default:
            return [it]
        }
      }),
    )
    // koruma/uzatma modalı açık bırakır; boşaltma/satış kapatır
    if (action.type === 'cleaner' || action.type === 'cleanSelf' || action.type === 'sellSystem' || action.type === 'sellPlayer') {
      setActiveId(null)
    }
  }

  return (
    <>
      <AuctionTab
        items={items}
        store={useVaultFiltersStore}
        variant="vault"
        timeOptions={VAULT_TIME_OPTIONS}
        timeUnitSeconds={3600}
        onAction={(item) => setActiveId(item.id)}
      />
      {active && (
        <VaultActionModal
          item={active}
          onClose={() => setActiveId(null)}
          onAction={(action) => handleAction(active.id, action)}
        />
      )}
    </>
  )
}