import styles from './SearchControl.module.scss'

interface SearchControlProps {
  label?: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export const SearchControl = ({ label, value, placeholder, onChange }: SearchControlProps) => (
  <div className={styles.group}>
    {label && <span className={styles.label}>{label}</span>}
    <input
      type="text"
      className={styles.input}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
)