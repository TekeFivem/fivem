import styles from './Leaderboard.module.scss'

const initials = (name: string) =>
  name.trim().split(/[\s_]+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

export const Avatar = ({ name, src, className }: { name: string; src?: string; className?: string }) =>
  src ? (
    <img className={[styles.avatar, className].filter(Boolean).join(' ')} src={src} alt={name} />
  ) : (
    <span className={[styles.avatar, styles.avatarFallback, className].filter(Boolean).join(' ')}>
      {initials(name)}
    </span>
  )