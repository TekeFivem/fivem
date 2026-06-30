import type { AuctionKind, Tier } from './auctions'

export const VAULT_TTL_MS = 24 * 60 * 60 * 1000 // kazanımdan sonra 24 saat

export type VaultSecurity = 'unprotected' | 'insured' | 'secured'
export type VaultState = 'active' | 'expired' | 'cleared' | 'sold' | 'robbed'

// Temizlikçi: tier ↑ → çalma riski ↓, fiyat ↑
export type CleanerId = 'rookie' | 'pro' | 'elite'
export interface CleanerOption {
  id: CleanerId
  label: string
  price: number
  theftChance: number // 0..1
  desc: string
}
export const CLEANERS: CleanerOption[] = [
  { id: 'rookie', label: 'Rookie Cleaner', price: 250,  theftChance: 0.25, desc: 'Ucuz ama güvenilmez — içeriğin bir kısmını çalabilir.' },
  { id: 'pro',    label: 'Pro Cleaner',    price: 750,  theftChance: 0.10, desc: 'Dengeli seçim — düşük çalma riski.' },
  { id: 'elite',  label: 'Elite Cleaner',  price: 1800, theftChance: 0.02, desc: 'Pahalı ama neredeyse kusursuz güven.' },
]

export interface VaultItem {
  kind: AuctionKind
  id: string
  name: string
  tier: Tier
  wonAt: number
  deadline: number      // wonAt + VAULT_TTL_MS
  estValueMin: number
  estValueMax: number
  security: VaultSecurity
  state: VaultState
}

// Fiyatlandırma (değere oranlı)
export const insurancePremium  = (max: number) => Math.round(max * 0.15)
export const securitySurcharge = (max: number) => Math.round(max * 0.25)
export const extendPrice       = (max: number) => Math.round(max * 0.05)
export const systemOffer = (min: number, max: number) => Math.round(((min + max) / 2) * 0.9) // erken sat: ort. %90'ı

export const fmtMoney = (n: number) => `${n.toLocaleString('tr-TR')}$`
export const fmtRange = (min: number, max: number) => `~${fmtMoney(min)}–${fmtMoney(max)}`