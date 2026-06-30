import { create } from 'zustand'
import { VAULT_TTL_MS, type CleanerId, type VaultItem } from '../lib/vault'

const t = Date.now()
const h = (n: number) => n * 60 * 60 * 1000
const mk = (p: Omit<VaultItem, 'deadline' | 'state'> & Partial<Pick<VaultItem, 'state'>>): VaultItem =>
  ({ ...p, deadline: p.wonAt + VAULT_TTL_MS, state: p.state ?? 'active' })

const MOCK: VaultItem[] = [
  mk({ kind: 'storage',   id: 'v1', name: 'STR-12', tier: 'gold',   wonAt: t - h(2),  estValueMin: 8000,  estValueMax: 18000, security: 'unprotected' }),
  mk({ kind: 'container', id: 'v2', name: 'CNT-A',  tier: 'silver', wonAt: t - h(10), estValueMin: 3000,  estValueMax: 9000,  security: 'insured' }),
  mk({ kind: 'itembox',   id: 'v3', name: 'TMB-X',  tier: 'bronze', wonAt: t - h(23), estValueMin: 500,   estValueMax: 2000,  security: 'secured' }),
  mk({ kind: 'storage',   id: 'v4', name: 'STR-22', tier: 'gold',   wonAt: t - h(25), estValueMin: 12000, estValueMax: 30000, security: 'unprotected', state: 'expired' }),
]

interface VaultStateStore {
  items: VaultItem[]
  hireCleaner: (id: string, cleaner: CleanerId) => void
  cleanSelf: (id: string) => void
  sellToSystem: (id: string) => void
  listForPlayer: (id: string, price: number) => void
  buyInsurance: (id: string) => void
  buySecurity: (id: string) => void
  extendTime: (id: string, ms?: number) => void
  expire: (id: string) => void
}

const patch = (id: string, fn: (it: VaultItem) => VaultItem) =>
  (s: VaultStateStore) => ({ items: s.items.map((it) => (it.id === id ? fn(it) : it)) })

export const useVaultStore = create<VaultStateStore>((set) => ({
  items: MOCK,
  hireCleaner:   (id) => set(patch(id, (it) => ({ ...it, state: 'cleared' }))),
  cleanSelf:     (id) => set(patch(id, (it) => ({ ...it, state: 'cleared' }))),
  sellToSystem:  (id) => set(patch(id, (it) => ({ ...it, state: 'sold' }))),
  listForPlayer: (id) => set(patch(id, (it) => ({ ...it, state: 'sold' }))),
  buyInsurance:  (id) => set(patch(id, (it) => (it.security === 'unprotected' ? { ...it, security: 'insured' } : it))),
  buySecurity:   (id) => set(patch(id, (it) => (it.security === 'insured' ? { ...it, security: 'secured' } : it))),
  extendTime:    (id, ms = h(6)) => set(patch(id, (it) => ({ ...it, deadline: it.deadline + ms }))),
  expire:        (id) => set(patch(id, (it) => ({ ...it, state: 'expired' }))),
}))