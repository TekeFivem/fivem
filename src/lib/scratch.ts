export interface ScratchItem {
  id: string
  name: string
  emoji?: string
}

// Herkes için AYNI havuz — bu item'lar her oyuncunun kutularında bulunur,
// sadece pozisyonları (hangi kutuda) oyuncudan oyuncuya değişir.
export const SCRATCH_POOL: ScratchItem[] = [
  { id: 'phone',  name: 'Telefon',    emoji: '📱' },
  { id: 'tv',     name: 'Televizyon', emoji: '📺' },
  { id: 'laptop', name: 'Laptop',     emoji: '💻' },
  { id: 'watch',  name: 'Saat',       emoji: '⌚' },
]

export const SCRATCH_CELL_COUNT = 6
// 6 kutu - 4 item = 2 boş. Boş sayısı herkes için sabit; sadece yeri karışık.
export const EMPTY_COUNT = SCRATCH_CELL_COUNT - SCRATCH_POOL.length

// Her kutu açıldıkça açılmamış kutuların kazıma ücreti artar
export const SCRATCH_BASE_COST = 250
export const SCRATCH_GROWTH = 1.6
export const scratchCost = (openedCount: number) =>
  Math.round(SCRATCH_BASE_COST * Math.pow(SCRATCH_GROWTH, openedCount))

export interface ScratchCell {
  id: string
  item: ScratchItem | null // null → boş kutu
}

// seed'den deterministik PRNG (mulberry32)
const mulberry32 = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Aynı item seti + sabit sayıda boş, seed'e göre karıştırılmış dizilim.
// FiveM'de diziliş sunucudan gelecek (fetchNui); seed = oyuncu/açık artırma bazlı.
export const buildScratchCells = (seed: number): ScratchCell[] => {
  const rand = mulberry32(seed)
  const contents: (ScratchItem | null)[] = [
    ...SCRATCH_POOL,
    ...Array.from({ length: EMPTY_COUNT }, () => null),
  ]
  // Fisher–Yates (seed'li)
  for (let i = contents.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[contents[i], contents[j]] = [contents[j], contents[i]]
  }
  return contents.map((item, i) => ({ id: `cell-${i}`, item }))
}