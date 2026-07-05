import { LeaderboardFilterBar } from '../../components/Leaderboard/LeaderboardFilterBar'
import { Podium } from '../../components/Leaderboard/Podium'
import { LeaderboardRow } from '../../components/Leaderboard/LeaderboardRow'
import { useLeaderboardFiltersStore } from '../../store/leaderboardFiltersStore'
import { useTabletStore } from '../../store/tabletStore'
import { queryLeaderboard } from '../../hooks/useLeaderboardQuery'
import { LEADERBOARD_MOCK } from '../../lib/leaderboard'
import styles from '../../components/AuctionTab/AuctionTab.module.scss'
import board from '../../components/Leaderboard/Leaderboard.module.scss'

export const LeaderboardTab = () => {
  const filters = useLeaderboardFiltersStore()
  const closeTablet = useTabletStore((s) => s.close)

  const handleRefresh = () => {
    // TODO: FiveM NUI veri yenileme (fetchNui) buraya bağlanacak
    console.log('refresh leaderboard')
  }

  const { podium, pageItems, totalPages, safePage, totalCount } = queryLeaderboard(LEADERBOARD_MOCK, filters)

  return (
    <div className={styles.panel}>
      <LeaderboardFilterBar filters={filters} onRefresh={handleRefresh} onClose={closeTablet} />

      <div className={board.board}>
        {totalCount === 0 ? (
          <div className={styles.empty}>Sonuç yok</div>
        ) : (
          <>
            {podium.length > 0 && <Podium entries={podium} metric={filters.metric} />}
            <div className={board.list}>
              {pageItems.map((e) => (
                <LeaderboardRow key={e.id} entry={e} metric={filters.metric} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.bottomBar}>
        <button type="button" className={styles.navBtn} onClick={filters.prevPage} disabled={safePage === 0}>
          ‹ Prev
        </button>
        <span className={styles.pageInfo}>
          {safePage + 1} / {totalPages}
        </span>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => filters.nextPage(totalPages)}
          disabled={safePage >= totalPages - 1}
        >
          Next ›
        </button>
      </div>
    </div>
  )
}