import { useState } from 'react'
import type { AuctionItem } from '../../lib/auctions'
import styles from './VaultActionModal.module.scss'

export type CleanerTier = 'rookie' | 'pro' | 'elite'

export type VaultAction =
  | { type: 'cleaner'; tier: CleanerTier }
  | { type: 'cleanSelf' }
  | { type: 'sellSystem' }
  | { type: 'sellPlayer'; price: number }
  | { type: 'insurance' }
  | { type: 'security' }
  | { type: 'extend'; hours: number }

interface Props {
  item: AuctionItem
  onClose: () => void
  onAction: (action: VaultAction) => void
}

// tier ↑ → çalma riski ↓ → fiyat ↑
const CLEANERS: { id: CleanerTier; label: string; price: number; theftChance: number; desc: string }[] = [
  { id: 'rookie', label: 'Acemi Temizlikçi', price: 250,  theftChance: 0.25, desc: 'Ucuz, ama loot çalma riski yüksek.' },
  { id: 'pro',    label: 'Profesyonel',       price: 750,  theftChance: 0.10, desc: 'Dengeli fiyat, düşük risk.' },
  { id: 'elite',  label: 'Elit Ekip',         price: 1800, theftChance: 0.02, desc: 'Pahalı, ama neredeyse hiç çalmaz.' },
]

const EXTEND_HOURS = 6
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
const insurancePremium  = (v: number) => v * 0.15
const securitySurcharge = (v: number) => v * 0.25
const extendPrice       = (v: number) => v * 0.05
const systemOffer       = (v: number) => v * 0.9

export const VaultActionModal = ({ item, onClose, onAction }: Props) => {
  const v = item.estValue ?? item.bid
  const insured = item.security === 'insured' || item.security === 'secured'
  const secured = item.security === 'secured'
  const [askPrice, setAskPrice] = useState(Math.round(v))

  const fire = (action: VaultAction, close = true) => {
    onAction(action)
    if (close) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.head}>
          <span className={styles.title}>{item.name} — AKSİYON</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </header>

        {/* ---- Boşaltma & Satış ---- */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Boşaltma Yöntemi</h4>
          <div className={styles.cleaners}>
            {CLEANERS.map((c) => (
              <button key={c.id} className={styles.cleaner} onClick={() => fire({ type: 'cleaner', tier: c.id })}>
                <span className={styles.cName}>🧹 {c.label}</span>
                <span className={styles.cMeta}>{money(c.price)} · çalma riski %{Math.round(c.theftChance * 100)}</span>
                <span className={styles.cDesc}>{c.desc}</span>
              </button>
            ))}
          </div>

          <button className={styles.row} onClick={() => fire({ type: 'cleanSelf' })}>
            👷 Kendin Temizle <span className={styles.muted}>— risk yok, lokasyona gitmen gerek</span>
          </button>

          <button className={styles.row} onClick={() => fire({ type: 'sellSystem' })}>
            💰 Sisteme Sat <span className={styles.muted}>— anında {money(systemOffer(v))}</span>
          </button>

          <div className={styles.sellRow}>
            <span>🤝 Oyuncuya Sat</span>
            <input
              className={styles.price}
              type="number"
              min={0}
              value={askPrice}
              onChange={(e) => setAskPrice(Number(e.target.value))}
            />
            <button className={styles.smallBtn} onClick={() => fire({ type: 'sellPlayer', price: askPrice })}>
              Listele
            </button>
          </div>
        </section>

        {/* ---- Koruma (modal açık kalır) ---- */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Koruma</h4>

          <button className={styles.row} disabled={insured} onClick={() => fire({ type: 'insurance' }, false)}>
            🛡️ Sigorta {insured ? '✓ Alındı' : `— ${money(insurancePremium(v))}`}
            <span className={styles.muted}> soyulursan para iadesi</span>
          </button>

          <button className={styles.row} disabled={!insured || secured} onClick={() => fire({ type: 'security' }, false)}>
            🔒 Yüksek Güvenlik {secured ? '✓ Aktif' : `— ${money(securitySurcharge(v))}`}
            <span className={styles.muted}>{insured ? ' soyulmayı tamamen engeller' : ' (önce sigorta gerekli)'}</span>
          </button>

          <button className={styles.row} onClick={() => fire({ type: 'extend', hours: EXTEND_HOURS }, false)}>
            ⏱️ Süre Uzat <span className={styles.muted}>— +{EXTEND_HOURS} sa · {money(extendPrice(v))}</span>
          </button>
        </section>
      </div>
    </div>
  )
}