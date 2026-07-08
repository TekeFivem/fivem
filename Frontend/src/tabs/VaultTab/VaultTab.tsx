import { useEffect, useState } from 'react'
import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { VaultActionModal } from '../../components/VaultActionModal/VaultActionModal'
import { useVaultFiltersStore } from '../../store/createFiltersStore'
import { VAULT_TIME_OPTIONS, type AuctionItem } from '../../lib/auctions'
import { fetchNui } from '../../lib/fetchNui'
import { useNuiEvent } from '../../hooks/useNuiEvent'
import type { VaultAction } from '../../components/VaultActionModal/VaultActionModal'

export const VaultTab = () => {
  const [items, setItems] = useState<AuctionItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = items.find((i) => i.id === activeId) ?? null

  // sunucudan vault kutularını yükle (dev'de boş dizi mock)
  const load = () =>
    fetchNui<AuctionItem[]>('getVault', {}, []).then(setItems).catch(() => { })
  useEffect(() => { load() }, [])

  // kutu tamamen boşaldığında sunucu haber verir → listeden çıkar
  // kutu boşaldığında sunucu haber verir → listeden ÇIKARMA, clean maske ile bırak
  useNuiEvent<{ id: string }>('vaultBoxOpened', ({ id }) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cleaned: true, endTime: '00:00:00' } : i)),
    ),
  )

  const handleAction = (id: string, action: VaultAction) => {
    switch (action.type) {
      case 'cleaner':
      case 'cleanSelf': {
        // "Kendin Temizle" → sunucu: lokasyon + sahiplik + stash aç
        fetchNui<{ ok: boolean; reason?: string }>('openBox', { id })
          .then((res) => {
            if (res?.ok) {
              setActiveId(null) // stash açıldı; kutu boşalınca 'vaultBoxOpened' gelir
            } else {
              // TODO: kullanıcıya toast: res?.reason ('toofar' | 'expired' | 'notfound' ...)
              console.warn('openBox reddedildi:', res?.reason)
            }
          })
          .catch(() => { })
        break
      }
      // Sonraki fazlar (satış / sigorta / güvenlik / uzatma):
      case 'insurance':
      case 'security':
      case 'extend':
      case 'sellSystem':
      case 'sellPlayer':
      default:
        break
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