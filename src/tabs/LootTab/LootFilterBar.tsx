import { RefreshIcon, CloseIcon } from '../../components/icons'
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl'
import { SelectControl } from '../../components/SelectControl/SelectControl'
import { SearchControl } from '../../components/SearchControl/SearchControl'
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
    <div className={styles.topBar}>
      {hasFilters && (
        <div className={styles.cornerLeft}>
          <button type="button" className={styles.clearBtn} onClick={clearFilters} aria-label="Temizle">
            {'CLEAR'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
          </button>
        </div>
      )}

      <div className={styles.filterStack}>
        <div className={styles.filterRow}>
          <SegmentedControl<LootLevel> label="Değer" options={LEVEL_OPTIONS} selected={valueLevels} onToggle={toggleValue} />
          <span className={styles.divider} />
          <SegmentedControl<LootLevel> label="Nadirlik" options={LEVEL_OPTIONS} selected={rarityLevels} onToggle={toggleRarity} />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <SearchControl label="İsim" value={nameQuery} placeholder="Search" onChange={setNameQuery} />
          </div>

          <span className={styles.divider} />

          <div className={styles.filterGroup}>
            <SelectControl
              label="Durum"
              value={inspected === 'all' ? '' : inspected}
              options={INSPECT_OPTIONS}
              onChange={(v) => setInspected(v === '' ? 'all' : (v as InspectFilter))}
            />
          </div>

          <span className={styles.divider} />

          <div className={styles.filterGroup}>
            <SelectControl
              label="Sırala"
              value={sortKey ?? ''}
              options={SORT_OPTIONS}
              onChange={(v) => setSortKey(v === '' ? null : (v as LootSortKey))}
            />
            <SelectControl value={sortDir} options={DIR_OPTIONS} onChange={(v) => setSortDir(v as 'asc' | 'desc')} />
          </div>
        </div>
      </div>

      <div className={styles.cornerActions}>
        <button type="button" className={[styles.iconBtn, styles.closeBtn].join(' ')} aria-label="Kapat" onClick={onClose}>
          <CloseIcon />
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Yenile" onClick={onRefresh}>
          <RefreshIcon />
        </button>
      </div>
    </div>
  )
}