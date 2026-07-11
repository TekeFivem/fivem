import { useState } from 'react'
import type { AuctionItem } from '../../lib/auctions'
import styles from './VaultActionModal.module.scss'

export type CleanerTier = 'rookie' | 'pro' | 'elite'

export type VaultAction =
  | { type: 'cleanSelf' }
  | { type: 'cleaner'; tier: CleanerTier }
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

        {/* Boşaltma / Temizleme → reveal modalını açar */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Boşaltma / Temizleme</h4>
          <div className={styles.grid}>
            <button type="button" className={styles.card} onClick={() => fire({ type: 'cleanSelf' })}>
              <span className={styles.cardIcon}>👷</span>
              <span className={styles.cardName}>Kendin Temizle</span>
              <span className={styles.cardMeta}>Ücretsiz · risk yok</span>
              <span className={styles.cardDesc}>Lokasyona git; itemler tanımlama ekranında listelenir.</span>
            </button>

            {CLEANERS.map((c) => (
              <button type="button" key={c.id} className={styles.card} onClick={() => fire({ type: 'cleaner', tier: c.id })}>
                <span className={styles.cardIcon}>🧹</span>
                <span className={styles.cardName}>{c.label}</span>
                <span className={styles.cardMeta}>{money(c.price)} · risk %{Math.round(c.theftChance * 100)}</span>
                <span className={styles.cardDesc}>{c.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Satış */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Satış</h4>
          <div className={styles.grid}>
            <button type="button" className={styles.card} onClick={() => fire({ type: 'sellSystem' })}>
              <span className={styles.cardIcon}>💰</span>
              <span className={styles.cardName}>Sisteme Sat</span>
              <span className={styles.cardMeta}>Anında {money(systemOffer(v))}</span>
              <span className={styles.cardDesc}>Kutuyu anında sisteme devret.</span>
            </button>

            <div className={styles.card}>
              <span className={styles.cardIcon}>🤝</span>
              <span className={styles.cardName}>Oyuncuya Sat</span>
              <span className={styles.cardMeta}>Yakındaki oyuncuya devir</span>
              <div className={styles.sellRow}>
                <input className={styles.price} type="number" min={0} value={askPrice}
                  onChange={(e) => setAskPrice(Number(e.target.value))} />
                <button type="button" className={styles.smallBtn} onClick={() => fire({ type: 'sellPlayer', price: askPrice })}>
                  Devret
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Koruma & Sigorta (modal açık kalır) */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Koruma & Sigorta</h4>
          <div className={styles.grid}>
            <button type="button" className={[styles.card, insured ? styles.cardDone : ''].join(' ')}
              disabled={insured} onClick={() => fire({ type: 'insurance' }, false)}>
              <span className={styles.cardIcon}>🛡️</span>
              <span className={styles.cardName}>Sigorta</span>
              <span className={styles.cardMeta}>{insured ? '✓ Alındı' : money(insurancePremium(v))}</span>
              <span className={styles.cardDesc}>Soyulursan para iadesi.</span>
            </button>

            <button type="button" className={[styles.card, secured ? styles.cardDone : ''].join(' ')}
              disabled={!insured || secured} onClick={() => fire({ type: 'security' }, false)}>
              <span className={styles.cardIcon}>🔒</span>
              <span className={styles.cardName}>Yüksek Güvenlik</span>
              <span className={styles.cardMeta}>{secured ? '✓ Aktif' : money(securitySurcharge(v))}</span>
              <span className={styles.cardDesc}>{insured ? 'Soyulmayı tamamen engeller.' : 'Önce sigorta gerekli.'}</span>
            </button>

            <button type="button" className={styles.card} onClick={() => fire({ type: 'extend', hours: EXTEND_HOURS }, false)}>
              <span className={styles.cardIcon}>⏱️</span>
              <span className={styles.cardName}>Süre Uzat</span>
              <span className={styles.cardMeta}>+{EXTEND_HOURS} sa · {money(extendPrice(v))}</span>
              <span className={styles.cardDesc}>Kutunun süresini uzatır.</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}