export type VaultSecurity = 'unprotected' | 'insured' | 'secured'

// "12.500$ – 18.000$" aralık gösterimi
export const fmtRange = (min: number, max: number) =>
  `${min.toLocaleString('tr-TR')}$ – ${max.toLocaleString('tr-TR')}$`