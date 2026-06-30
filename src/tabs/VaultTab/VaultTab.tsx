import { AuctionTab } from '../../components/AuctionTab/AuctionTab'
import { useVaultFiltersStore } from '../../store/createFiltersStore'
import { VAULT_TIME_OPTIONS, type AuctionItem } from '../../lib/auctions'

// Kazanılan kutular — endTime = temizlemek için kalan 24s geri sayım, bid = kazanılan fiyat
const MOCK: AuctionItem[] = [
  { kind: 'storage',   id: 'va1', name: 'STR-12', tier: 'gold',   endTime: '23:40:00', bid: 12500, participants: 7 },
  { kind: 'container', id: 'va2', name: 'CNT-A',  tier: 'silver', endTime: '18:05:00', bid: 9100,  participants: 5 },
  { kind: 'itembox',   id: 'va3', name: 'TMB-X',  tier: 'bronze', endTime: '06:30:00', bid: 2400,  participants: 3 },
  { kind: 'storage',   id: 'va4', name: 'STR-07', tier: 'silver', endTime: '00:45:00', bid: 5200,  participants: 4 },
]

export const VaultTab = () => (
  <AuctionTab
    items={MOCK}
    store={useVaultFiltersStore}
    variant="vault"
    timeOptions={VAULT_TIME_OPTIONS}
    timeUnitSeconds={3600}
  />
)
