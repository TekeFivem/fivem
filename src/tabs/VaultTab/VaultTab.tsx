import { useVaultStore } from '../../store/vaultStore'
import { VaultCard } from '../../components/VaultCard/VaultCard'
import styles from './VaultTab.module.scss'

export const VaultTab = () => {
  const items = useVaultStore((s) => s.items)
  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        {items.length === 0
          ? <div className={styles.empty}>VAULT BOŞ</div>
          : items.map((it) => <VaultCard key={it.id} item={it} />)}
      </div>
    </div>
  )
}