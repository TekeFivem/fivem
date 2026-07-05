import type { ReactNode } from 'react'
import styles from './MetalBadge.module.scss'

interface MetalBadgeProps {
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export const MetalBadge = ({ icon, children, className }: MetalBadgeProps) => (
  <div className={[styles.badge, className].filter(Boolean).join(' ')}>
    {icon && <span className={styles.icon}>{icon}</span>}
    <span className={styles.content}>{children}</span>
  </div>
)