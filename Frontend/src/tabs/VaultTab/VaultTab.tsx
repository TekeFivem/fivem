import { useEffect, useState } from 'react'
import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { VaultActionModal, type VaultAction } from '../../components/VaultActionModal/VaultActionModal'

import { useVaultFiltersStore } from '../../store/createFiltersStore'
import { VAULT_TIME_OPTIONS, type AuctionItem } from '../../lib/auctions'
import { fetchNui } from '../../lib/fetchNui'
import { useNuiEvent } from '../../hooks/useNuiEvent'
import { CleanRevealModal } from '../../components/CleanRevealModal/CleanRevealModal'

export const VaultTab = () => {
  const [items, setItems] = useState<AuctionItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [revealBoxId, setRevealBoxId] = useState<string | null>(null)
  const active = items.find((i) => i.id === activeId) ?? null

  const load = () =>
    fetchNui<AuctionItem[]>('getVault', {}, [])
      .then(setItems)
      .catch(() => {})

  useEffect(() => {
    load()
  }, [])

  // (a) vaultBoxOpened artık sadece listeyi tazeliyor
  useNuiEvent('vaultBoxOpened', () => load())
  useNuiEvent('vaultRefresh', () => load())

  const handleAction = (id: string, action: VaultAction) => {
    switch (action.type) {
      case 'cleanSelf':
      case 'cleaner':
        fetchNui<{ ok: boolean; reason?: string }>(
          'cleanBox',
          {
            id,
            method: action.type === 'cleanSelf' ? 'self' : 'cleaner',
            tier: action.type === 'cleaner' ? action.tier : undefined,
          },
          { ok: true },
        )
          .then((res) => {
            if (res?.ok) {
              setActiveId(null)
              setRevealBoxId(id)
            } else console.warn('cleanBox reddedildi:', res?.reason)
          })
          .catch(() => {})
        break
      case 'sellSystem':
        fetchNui<{ ok: boolean }>('vaultSellSystem', { id }, { ok: true })
          .then((res) => {
            if (res?.ok) {
              setActiveId(null)
              load()
            }
          })
          .catch(() => {})
        break
      case 'sellPlayer':
        fetchNui<{ ok: boolean }>(
          'vaultSellPlayer',
          { id, price: action.price },
          { ok: true },
        )
          .then((res) => {
            if (res?.ok) setActiveId(null)
          })
          .catch(() => {})
        break
      case 'insurance':
        fetchNui<{ ok: boolean }>('vaultInsure', { id }, { ok: true })
          .then((r) => {
            if (r?.ok) load()
          })
          .catch(() => {})
        break
      case 'security':
        fetchNui<{ ok: boolean }>('vaultSecure', { id }, { ok: true })
          .then((r) => {
            if (r?.ok) load()
          })
          .catch(() => {})
        break
      case 'extend':
        fetchNui<{ ok: boolean }>('vaultExtend', { id }, { ok: true })
          .then((r) => {
            if (r?.ok) load()
          })
          .catch(() => {})
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
        // (b) pending loot varsa reveal modal açılıyor
        onAction={(item) =>
          (item.pending ?? 0) > 0
            ? setRevealBoxId(item.id)
            : setActiveId(item.id)
        }
      />
      {active && (
        <VaultActionModal
          item={active}
          onClose={() => setActiveId(null)}
          onAction={(action) => handleAction(active.id, action)}
        />
      )}
      {revealBoxId && (
        <CleanRevealModal
          boxId={revealBoxId}
          onClose={() => {
            setRevealBoxId(null)
            load()
          }}
        />
      )}
    </>
  )
}
