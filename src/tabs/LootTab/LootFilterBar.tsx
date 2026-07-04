import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl'
import { SelectControl } from '../../components/SelectControl/SelectControl'
import { SearchControl } from '../../components/SearchControl/SearchControl'
import { FilterField } from '../../components/FilterField/FilterField'
import { FilterBarShell } from '../../components/FilterBarShell/FilterBarShell'
import { LEVEL_OPTIONS, type LootLevel } from '../../lib/loot'
import type { LootFiltersState, InspectFilter, LootSortKey } from '../../store/lootFiltersStore'
import styles from '../../components/AuctionTab/AuctionTab.module.scss'

const INSPECT_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'yes', label: 'İncelendi' },
  { value: 'no', label: 'İncelenmedi' },
]
const SORT_OPTIONS = [
  { value: '', label: 'Varsayılan' },
  { value: 'value', label: 'Değer' },
  { value: 'rarity', label: 'Nadirlik' },
  { value: 'demand', label: 'Talep' },
]
const DIR_OPTIONS = [
  { value: 'desc', label: 'Yüksek→Düşük' },
  { value: 'asc', label: 'Düşük→Yüksek' },
]

export const LootFilterBar = ({
  filters,
  onRefresh,
  onClose,
}: {
  filters: LootFiltersState
  onRefresh: () => void
  onClose: () => void
}) => {
  const {
    valueLevels, rarityLevels, nameQuery, inspected, sortKey, sortDir,
    toggleValue, toggleRarity, setNameQuery, setInspected, setSortKey, setSortDir, clearFilters,
  } = filters

  const hasFilters =
    valueLevels.length > 0 || rarityLevels.length > 0 ||
    nameQuery.trim() !== '' || inspected !== 'all' || sortKey !== null

  return (
    <FilterBarShell hasFilters={hasFilters} onClear={clearFilters} onRefresh={onRefresh} onClose={onClose}>
      <div className={styles.filterRow}>
        <FilterField label="Değer">
          <SegmentedControl<LootLevel> options={LEVEL_OPTIONS} selected={valueLevels} onToggle={toggleValue} />
        </FilterField>
        <FilterField label="Nadirlik">
          <SegmentedControl<LootLevel> options={LEVEL_OPTIONS} selected={rarityLevels} onToggle={toggleRarity} />
        </FilterField>
      </div>

      <div className={styles.filterRow}>
        <FilterField label="İsim">
          <SearchControl value={nameQuery} placeholder="Search" onChange={setNameQuery} />
        </FilterField>

        <FilterField label="Durum">
          <SelectControl
            value={inspected === 'all' ? '' : inspected}
            options={INSPECT_OPTIONS}
            onChange={(v) => setInspected(v === '' ? 'all' : (v as InspectFilter))}
          />
        </FilterField>

        <FilterField label="Sırala">
          <SelectControl
            value={sortKey ?? ''}
            options={SORT_OPTIONS}
            onChange={(v) => setSortKey(v === '' ? null : (v as LootSortKey))}
          />
          <SelectControl value={sortDir} options={DIR_OPTIONS} onChange={(v) => setSortDir(v as 'asc' | 'desc')} />
        </FilterField>
      </div>
    </FilterBarShell>
  )
}