import WatchImg from '../assets/watches_PNG101457.png'
import LaptopImg from '../assets/laptop_PNG5935.png'

export type LootLevel = 'low' | 'mid' | 'high'

export type LootFieldKey =
  | 'value'
  | 'clean'
  | 'repair'
  | 'authentic'
  | 'rarity'
  | 'demand'
  | 'legal'

export interface LootItem {
  id: string
  name: string
  image: string
  inspected?: boolean // false → alanlar soluk/bulanık gelir
  levels: Record<LootFieldKey, LootLevel>
}

// Sıra: ilk 4 üst satır, son 3 alt satır (4 sütunlu grid'de doğal akış)
export const LOOT_FIELDS: { key: LootFieldKey; label: string }[] = [
  { key: 'value', label: 'Değer' },
  { key: 'clean', label: 'Temizlik' },
  { key: 'repair', label: 'Durum' },
  { key: 'authentic', label: 'Orijinallik' },
  { key: 'rarity', label: 'Nadirlik' },
  { key: 'demand', label: 'Talep' },
  { key: 'legal', label: 'Yasallık' },
]

// TODO: FiveM'de nui:// asset yoluyla değiştir
const IMG = WatchImg

export const LOOT_MOCK: LootItem[] = [
  {
    id: 'l1', name: 'Antika Saat', image: IMG, inspected: true,
    levels: { value: 'high', clean: 'mid', repair: 'low', authentic: 'high', rarity: 'high', demand: 'mid', legal: 'high' },
  },
  {
    id: 'l2', name: 'Eski Radyo', image: IMG, inspected: true,
    levels: { value: 'mid', clean: 'low', repair: 'mid', authentic: 'mid', rarity: 'mid', demand: 'low', legal: 'high' },
  },
  {
    id: 'l3', name: 'Altın Kolye', image: IMG, inspected: false,
    levels: { value: 'high', clean: 'high', repair: 'high', authentic: 'low', rarity: 'high', demand: 'high', legal: 'mid' },
  },
  {
    id: 'l4', name: 'Kırık Vazo', image: IMG, inspected: true,
    levels: { value: 'low', clean: 'low', repair: 'low', authentic: 'mid', rarity: 'low', demand: 'low', legal: 'high' },
  },
    {
    id: 'l5', name: 'Antika Saat', image: IMG, inspected: true,
    levels: { value: 'high', clean: 'mid', repair: 'low', authentic: 'high', rarity: 'high', demand: 'mid', legal: 'high' },
  },
  {
    id: 'l6', name: 'Eski Radyo', image: LaptopImg, inspected: true,
    levels: { value: 'mid', clean: 'low', repair: 'mid', authentic: 'mid', rarity: 'mid', demand: 'low', legal: 'high' },
  },
  {
    id: 'l7', name: 'Altın Kolye', image: LaptopImg, inspected: false,
    levels: { value: 'high', clean: 'high', repair: 'high', authentic: 'low', rarity: 'high', demand: 'high', legal: 'mid' },
  },
  {
    id: 'l8', name: 'Kırık Vazo', image: LaptopImg, inspected: true,
    levels: { value: 'low', clean: 'low', repair: 'low', authentic: 'mid', rarity: 'low', demand: 'low', legal: 'high' },
  },
    {
    id: 'l9', name: 'Kırık Vazo', image: IMG, inspected: true,
    levels: { value: 'low', clean: 'low', repair: 'low', authentic: 'mid', rarity: 'low', demand: 'low', legal: 'high' },
  },
    {
    id: '20', name: 'Antika Saat', image: IMG, inspected: true,
    levels: { value: 'high', clean: 'mid', repair: 'low', authentic: 'high', rarity: 'high', demand: 'mid', legal: 'high' },
  },
  {
    id: '21', name: 'Eski Radyo', image: LaptopImg, inspected: true,
    levels: { value: 'mid', clean: 'low', repair: 'mid', authentic: 'mid', rarity: 'mid', demand: 'low', legal: 'high' },
  },
  {
    id: '22', name: 'Altın Kolye', image: LaptopImg, inspected: false,
    levels: { value: 'high', clean: 'high', repair: 'high', authentic: 'low', rarity: 'high', demand: 'high', legal: 'mid' },
  },
  {
    id: '23', name: 'Kırık Vazo', image: LaptopImg, inspected: true,
    levels: { value: 'low', clean: 'low', repair: 'low', authentic: 'mid', rarity: 'low', demand: 'low', legal: 'high' },
  },
]

export const LEVEL_OPTIONS: { value: LootLevel; label: string; accent: string }[] = [
  { value: 'low', label: 'Düşük', accent: '#e0524f' },
  { value: 'mid', label: 'Orta', accent: '#46e06b' },
  { value: 'high', label: 'Yüksek', accent: '#f3d979' },
]