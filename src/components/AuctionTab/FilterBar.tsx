import { SegmentedControl } from '../SegmentedControl/SegmentedControl'
import { SelectControl, type SelectOption } from '../SelectControl/SelectControl'
import { SearchControl } from '../SearchControl/SearchControl'
import { FilterField } from '../FilterField/FilterField'
import { FilterBarShell } from '../FilterBarShell/FilterBarShell'
import {
  TIER_OPTIONS, KIND_OPTIONS, DIR_OPTIONS, BID_OPTIONS,
  PART_OPTIONS, type Tier, type AuctionKind, type Dir,
} from '../../lib/auctions'
import type { FiltersState } from '../../store/createFiltersStore'
import styles from './AuctionTab.module.scss'

interface FilterBarProps {
  filters: FiltersState
  timeOptions?: SelectOption[]
  labels?: { bid?: string; part?: string }
  searchByName?: boolean // recent: Time yerine isim araması
  onRefresh: () => void
  onClose: () => void
}

export const FilterBar = ({ filters, timeOptions = [], labels, searchByName, onRefresh, onClose }: FilterBarProps) => {
  const {
    tiers, kinds, bidPreset, bidDir, timePreset, timeDir, partPreset, partDir, nameQuery,
    toggleTier, toggleKind, setBidPreset, setBidDir,
    setTimePreset, setTimeDir, setPartPreset, setPartDir, setNameQuery, clearFilters,
  } = filters

  const hasFilters =
    tiers.length > 0 || kinds.length > 0 ||
    bidPreset !== null || timePreset !== null || partPreset !== null ||
    nameQuery.trim() !== ''

  return (
    <FilterBarShell hasFilters={hasFilters} onClear={clearFilters} onRefresh={onRefresh} onClose={onClose}>
      <div className={styles.filterRow}>
        <FilterField label="Tier">
          <SegmentedControl<Tier> options={TIER_OPTIONS} selected={tiers} onToggle={toggleTier} />
        </FilterField>
        <FilterField label="Type">
          <SegmentedControl<AuctionKind> options={KIND_OPTIONS} selected={kinds} onToggle={toggleKind} />
        </FilterField>
      </div>

      <div className={styles.filterRow}>
        <FilterField label={labels?.bid ?? 'Money'}>
          <SelectControl
            value={bidPreset === null ? '' : String(bidPreset)}
            options={BID_OPTIONS}
            onChange={(v) => setBidPreset(v === '' ? null : Number(v))}
          />
          <SelectControl value={bidDir} options={DIR_OPTIONS} onChange={(v) => setBidDir(v as Dir)} />
        </FilterField>

        {/* Recent → isim araması, diğerleri → Time filtresi */}
        {searchByName ? (
          <FilterField label="Winner">
            <SearchControl value={nameQuery} placeholder="Search" onChange={setNameQuery} />
          </FilterField>
        ) : (
          <FilterField label="Time">
            <SelectControl
              value={timePreset === null ? '' : String(timePreset)}
              options={timeOptions}
              onChange={(v) => setTimePreset(v === '' ? null : Number(v))}
            />
            <SelectControl value={timeDir} options={DIR_OPTIONS} onChange={(v) => setTimeDir(v as Dir)} />
          </FilterField>
        )}

        <FilterField label={labels?.part ?? 'Participants'}>
          <SelectControl
            value={partPreset === null ? '' : String(partPreset)}
            options={PART_OPTIONS}
            onChange={(v) => setPartPreset(v === '' ? null : Number(v))}
          />
          <SelectControl value={partDir} options={DIR_OPTIONS} onChange={(v) => setPartDir(v as Dir)} />
        </FilterField>
      </div>
    </FilterBarShell>
  )
}