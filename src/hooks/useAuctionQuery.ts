import { toSeconds, formatHMS, type AuctionItem } from '../lib/auctions'
import type { FiltersState } from '../store/createFiltersStore'

const PAGE_SIZE = 6

interface QueryOpts {
  timeUnitSeconds: number // ongoing: 60 (dk), upcoming: 3600 (saat)
  thresholdSec?: number // upcoming: bu eşiğe inen item düşer
  now: number
  deadlines: Map<string, number>
}

export const queryAuctions = (items: AuctionItem[], f: FiltersState, opts: QueryOpts) => {
  const live = opts.thresholdSec != null

  const withRemaining = items.map((it) => {
    if (!opts.deadlines.has(it.id)) {
      opts.deadlines.set(it.id, opts.now + toSeconds(it.endTime) * 1000)
    }
    const remainingSec = live
      ? Math.max(0, Math.round((opts.deadlines.get(it.id)! - opts.now) / 1000))
      : toSeconds(it.endTime)
    return { ...it, remainingSec }
  })

  const q = f.nameQuery.trim().toLowerCase()

  const filtered = withRemaining.filter((item) => {
    if (opts.thresholdSec != null && item.remainingSec <= opts.thresholdSec) return false

    const tierOk = f.tiers.length === 0 || f.tiers.includes(item.tier)
    const kindOk = f.kinds.length === 0 || f.kinds.includes(item.kind)
    const bidOk =
      f.bidPreset === null || (f.bidDir === 'gte' ? item.bid >= f.bidPreset : item.bid <= f.bidPreset)
    const timeOk =
      f.timePreset === null ||
      (f.timeDir === 'gte'
        ? item.remainingSec >= f.timePreset * opts.timeUnitSeconds
        : item.remainingSec <= f.timePreset * opts.timeUnitSeconds)
    const partOk =
      f.partPreset === null ||
      (f.partDir === 'gte' ? item.participants >= f.partPreset : item.participants <= f.partPreset)
    const nameOk =
      q === '' ||
      (item.winner?.toLowerCase().includes(q) ?? false) ||
      item.name.toLowerCase().includes(q)

    return tierOk && kindOk && bidOk && timeOk && partOk && nameOk
  })

  const sorted = [...filtered].sort((a, b) => a.remainingSec - b.remainingSec)

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(f.page, totalPages - 1)
  const pageItems = sorted
    .slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
    .map((it) => ({ ...it, endTime: formatHMS(it.remainingSec) }))

  return { pageItems, totalPages, safePage }
}