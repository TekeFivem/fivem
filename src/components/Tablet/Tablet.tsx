import type { ReactNode } from 'react'
import { useTabletStore } from '../../store/tabletStore'
import styles from './Tablet.module.scss'

interface TabletProps {
  /** Ekran içeriği (uygulamalar, home screen vs.) */
  children?: ReactNode
}

export const Tablet = ({ children }: TabletProps) => {
  const isOpen = useTabletStore((s) => s.isOpen)
  if (!isOpen) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.tablet}>
        {/* Ekran */}
        <div className={styles.screen}>
          {children ?? (
            <div className={styles.placeholder}>
              <span>Tablet Ekranı</span>
              <small>1280 × 720</small>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}