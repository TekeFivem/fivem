import type { LootItem } from '../../lib/loot'
import { LootFields } from '../LootFields/LootFields'
import { LootImage } from '../LootImage/LootImage'
import styles from './LootDetailModal.module.scss'

interface Props {
    item: LootItem
    onClose: () => void
    onInspect?: () => void
    onSell?: () => void
    onClean?: () => void
    onRepair?: () => void
}

export const LootDetailModal = ({ item, onClose, onInspect, onSell, onClean, onRepair }: Props) => (
    <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.head}>
                <span className={styles.title}>{item.name}</span>
                <button className={styles.close} onClick={onClose}>✕</button>
            </header>

            <div className={styles.body}>
                <div className={styles.imageCol}>
                    <div className={styles.image}>
                        <LootImage item={item} />
                        {!item.inspected && (
                            <button type="button" className={styles.inspectBtn} onClick={onInspect}>
                                🔍 İncele
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.fieldsCol}>
                    <LootFields item={item} />
                </div>
            </div>

            <div className={styles.actions}>
                <button type="button" className={[styles.action, styles.sell].join(' ')} onClick={onSell}>💰 Sat</button>
                <button type="button" className={styles.action} onClick={onClean}>🧽 Temizle</button>
                <button type="button" className={styles.action} onClick={onRepair}>🔧 Tamir</button>
            </div>
        </div>
    </div>
)