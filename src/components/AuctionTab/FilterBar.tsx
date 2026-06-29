import { RefreshIcon, CloseIcon } from '../icons'
import { SegmentedControl } from '../SegmentedControl/SegmentedControl'
import { SelectControl, type SelectOption } from '../SelectControl/SelectControl'
import {
  TIER_OPTIONS, KIND_OPTIONS, DIR_OPTIONS, BID_OPTIONS,
  PART_OPTIONS, type Tier, type AuctionKind, type Dir,
} from '../../lib/auctions'
import type { FiltersState } from '../../store/createFiltersStore'
import styles from './AuctionTab.module.scss'

interface FilterBarProps {
  filters: FiltersState
  timeOptions: SelectOption[]
  labels?: { bid?: string; part?: string }
  onRefresh: () => void
  onClose: () => void
}

export const FilterBar = ({ filters, timeOptions, labels, onRefresh, onClose }: FilterBarProps) => {
  const {
    tiers, kinds, bidPreset, bidDir, timePreset, timeDir, partPreset, partDir,
    toggleTier, toggleKind, setBidPreset, setBidDir,
    setTimePreset, setTimeDir, setPartPreset, setPartDir, clearFilters,
  } = filters

  const hasFilters =
    tiers.length > 0 || kinds.length > 0 ||
    bidPreset !== null || timePreset !== null || partPreset !== null

  return (
    <div className={styles.topBar}>
      {hasFilters && (
        <div className={styles.cornerLeft}>
          <button type="button" className={styles.clearBtn} onClick={clearFilters} aria-label="Temizle">
            {'CLEAR'.split('').map((ch, i) => (
              <span key={i}>{ch}</span>
            ))}
          </button>
        </div>
      )}

      <div className={styles.filterStack}>
        <div className={styles.filterRow}>
          <SegmentedControl<Tier> label="Tier" options={TIER_OPTIONS} selected={tiers} onToggle={toggleTier} />
          <span className={styles.divider} />
          <SegmentedControl<AuctionKind> label="Type" options={KIND_OPTIONS} selected={kinds} onToggle={toggleKind} />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <SelectControl
              label={labels?.bid ?? 'Money'}
              value={bidPreset === null ? '' : String(bidPreset)}
              options={BID_OPTIONS}
              onChange={(v) => setBidPreset(v === '' ? null : Number(v))}
            />
            <SelectControl value={bidDir} options={DIR_OPTIONS} onChange={(v) => setBidDir(v as Dir)} />
          </div>

          <span className={styles.divider} />

          <div className={styles.filterGroup}>
            <SelectControl
              label="Time"
              value={timePreset === null ? '' : String(timePreset)}
              options={timeOptions}
              onChange={(v) => setTimePreset(v === '' ? null : Number(v))}
            />
            <SelectControl value={timeDir} options={DIR_OPTIONS} onChange={(v) => setTimeDir(v as Dir)} />
          </div>

          <span className={styles.divider} />

          <div className={styles.filterGroup}>
            <SelectControl
              label={labels?.part ?? 'Participants'}
              value={partPreset === null ? '' : String(partPreset)}
              options={PART_OPTIONS}
              onChange={(v) => setPartPreset(v === '' ? null : Number(v))}
            />
            <SelectControl value={partDir} options={DIR_OPTIONS} onChange={(v) => setPartDir(v as Dir)} />
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