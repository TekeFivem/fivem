import { RefreshIcon, CloseIcon } from '../icons'
import { SelectControl } from '../SelectControl/SelectControl'
import { SearchControl } from '../SearchControl/SearchControl'
import { FilterField } from './FilterField'
import {
  METRIC_OPTIONS, PERIOD_OPTIONS, LB_DIR_OPTIONS,
  type LeaderboardMetric, type LeaderboardPeriod,
} from '../../lib/leaderboard'
import type { LeaderboardFiltersState } from '../../store/leaderboardFiltersStore'
import styles from '../AuctionTab/AuctionTab.module.scss'
import board from './Leaderboard.module.scss'

interface Props {
  filters: LeaderboardFiltersState
  onRefresh: () => void
  onClose: () => void
}

export const LeaderboardFilterBar = ({ filters, onRefresh, onClose }: Props) => {
  const {
    metric, period, nameQuery, sortDir,
    setMetric, setPeriod, setNameQuery, setSortDir, clearFilters,
  } = filters

  const hasFilters =
    metric !== 'total' || period !== 'all' || sortDir !== 'desc' || nameQuery.trim() !== ''

  return (
    <div className={[styles.topBar, board.topBarFixed].join(' ')}>
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
        {/* 1. satır */}
        <div className={styles.filterRow}>
          <FilterField label="Sıralama">
            <SelectControl value={metric} options={METRIC_OPTIONS}
              onChange={(v) => setMetric(v as LeaderboardMetric)} />
          </FilterField>
          <FilterField label="Dönem">
            <SelectControl value={period} options={PERIOD_OPTIONS}
              onChange={(v) => setPeriod(v as LeaderboardPeriod)} />
          </FilterField>
        </div>

        {/* 2. satır */}
        <div className={styles.filterRow}>
          <FilterField label="Yön">
            <SelectControl value={sortDir} options={LB_DIR_OPTIONS}
              onChange={(v) => setSortDir(v as 'asc' | 'desc')} />
          </FilterField>
          <FilterField label="Oyuncu">
            <SearchControl value={nameQuery} placeholder="Search" onChange={setNameQuery} />
          </FilterField>
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