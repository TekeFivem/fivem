import styles from './HazardSign.module.scss'

interface HazardSignProps {
  label: string
}

export const HazardSign = ({ label }: HazardSignProps) => (
  <div className={styles.sign}>
    <div className={styles.signStripes}>
      <div className={styles.signPlate}>
        <span className={styles.signLabel}>{label}</span>
      </div>
    </div>
  </div>
)