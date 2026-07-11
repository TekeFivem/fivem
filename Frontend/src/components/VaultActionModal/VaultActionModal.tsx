import { useState } from 'react'
import type { AuctionItem } from '../../lib/auctions'
import { fetchNui } from '../../lib/fetchNui'
import { useNuiEvent } from '../../hooks/useNuiEvent'
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

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(' ')

export const VaultActionModal = ({ item, onClose, onAction }: Props) => {
  const v = item.estValue ?? item.bid
  const insured = item.security === 'insured' || item.security === 'secured'
  const secured = item.security === 'secured'
  const hasLoc = !!item.loc
  const [askPrice, setAskPrice] = useState(Math.round(v))
  const [marked, setMarked] = useState(false)
  const [atLocation, setAtLocation] = useState(false)

  // FiveM konum yakınlık sinyali → "Kendin Temizle" butonunu aktifleştirir
  useNuiEvent<{ id: string; at: boolean }>('vaultAtLocation', (d) => {
    if (d && d.id === item.id) setAtLocation(!!d.at)
  })

  const fire = (action: VaultAction, close = true) => {
    onAction(action)
    if (close) onClose()
  }

  const markLocation = () => {
    setMarked(true)
    fetchNui('vaultMarkLocation', { id: item.id, loc: item.loc }, { ok: true }).catch(() => {})
  }

  // konum yoksa (ör. eski kayıt) sunucu zaten mesafe kontrol eder; UI'de engelleme
  const canSelfClean = !hasLoc || atLocation

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.head}>
          <span className={styles.title}>{item.name} — AKSİYON</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </header>

        <div className={styles.body}>
          {/* ÜST: 2 sütun × 3 satır */}
          <div className={styles.topGrid}>
            {/* SOL sütun: kiralık temizlikçiler (acemi / profesyonel / elit) */}
            <div className={styles.col}>
              {CLEANERS.map((c) => (
                <div key={c.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.cardIcon}>🧹</span>
                    <span className={styles.cardName}>{c.label}</span>
                    <span className={cx(styles.badge, styles.risk)}>%{Math.round(c.theftChance * 100)} risk</span>
                  </div>
                  <p className={styles.cardDesc}>{c.desc}</p>
                  <div className={styles.cardFoot}>
                    <button type="button" className={styles.btn} onClick={() => fire({ type: 'cleaner', tier: c.id })}>
                      Temizlet · {money(c.price)}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SAĞ sütun: kendin temizle / sisteme sat / oyuncuya sat */}
            <div className={styles.col}>
              {/* Kendin Temizle */}
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon}>👷</span>
                  <span className={styles.cardName}>Kendin Temizle</span>
                  <span className={cx(styles.badge, styles.ok)}>Ücretsiz</span>
                </div>
                <p className={styles.cardDesc}>
                  {hasLoc
                    ? (atLocation ? 'Konumdasın — temizleyebilirsin.' : 'Lokasyonu işaretle ve kutunun yanına git.')
                    : 'İtemler tanımlama ekranında listelenir.'}
                </p>
                <div className={styles.cardFoot}>
                  {hasLoc && (
                    <button
                      type="button"
                      className={cx(styles.btn, styles.btnGhost, marked && styles.marked)}
                      onClick={markLocation}
                    >
                      📍 {marked ? 'İşaretli' : 'İşaretle'}
                    </button>
                  )}
                  <button
                    type="button"
                    className={cx(styles.btn, styles.btnPrimary)}
                    disabled={!canSelfClean}
                    onClick={() => fire({ type: 'cleanSelf' })}
                  >
                    Kendin Temizle
                  </button>
                </div>
              </div>

              {/* Sisteme Sat */}
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon}>💰</span>
                  <span className={styles.cardName}>Sisteme Sat</span>
                  <span className={cx(styles.badge, styles.ok)}>{money(systemOffer(v))}</span>
                </div>
                <p className={styles.cardDesc}>Kutuyu anında sisteme devret.</p>
                <div className={styles.cardFoot}>
                  <button type="button" className={styles.btn} onClick={() => fire({ type: 'sellSystem' })}>
                    Anında Sat
                  </button>
                </div>
              </div>

              {/* Oyuncuya Sat */}
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon}>🤝</span>
                  <span className={styles.cardName}>Oyuncuya Sat</span>
                  <span className={styles.badge}>Konumda devir</span>
                </div>
                <p className={styles.cardDesc}>Yakındaki oyuncuya kutuyu devret.</p>
                <div className={styles.cardFoot}>
                  <input
                    className={styles.price}
                    type="number"
                    min={0}
                    value={askPrice}
                    onChange={(e) => setAskPrice(Number(e.target.value))}
                  />
                  <button type="button" className={styles.btn} onClick={() => fire({ type: 'sellPlayer', price: askPrice })}>
                    Devret
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ALT: 3 sütun × 1 satır */}
          <div className={styles.bottomGrid}>
            {/* Sigorta */}
            <div className={cx(styles.card, insured && styles.done)}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>🛡️</span>
                <span className={styles.cardName}>Sigorta</span>
                <span className={cx(styles.badge, insured && styles.ok)}>{insured ? '✓ Alındı' : money(insurancePremium(v))}</span>
              </div>
              <p className={styles.cardDesc}>Soyulursan para iadesi.</p>
              <div className={styles.cardFoot}>
                <button type="button" className={styles.btn} disabled={insured} onClick={() => fire({ type: 'insurance' }, false)}>
                  {insured ? 'Aktif' : 'Sigorta Yaptır'}
                </button>
              </div>
            </div>

            {/* Yüksek Güvenlik */}
            <div className={cx(styles.card, secured && styles.done)}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>🔒</span>
                <span className={styles.cardName}>Yüksek Güvenlik</span>
                <span className={cx(styles.badge, secured && styles.ok)}>{secured ? '✓ Aktif' : money(securitySurcharge(v))}</span>
              </div>
              <p className={styles.cardDesc}>{insured ? 'Soyulmayı tamamen engeller.' : 'Önce sigorta gerekli.'}</p>
              <div className={styles.cardFoot}>
                <button type="button" className={styles.btn} disabled={!insured || secured} onClick={() => fire({ type: 'security' }, false)}>
                  {secured ? 'Aktif' : 'Güvenlik Ekle'}
                </button>
              </div>
            </div>

            {/* Süre Uzat */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>⏱️</span>
                <span className={styles.cardName}>Süre Uzat</span>
                <span className={styles.badge}>{money(extendPrice(v))}</span>
              </div>
              <p className={styles.cardDesc}>Kutunun süresini +{EXTEND_HOURS} saat uzatır.</p>
              <div className={styles.cardFoot}>
                <button type="button" className={styles.btn} onClick={() => fire({ type: 'extend', hours: EXTEND_HOURS }, false)}>
                  +{EXTEND_HOURS} sa Uzat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}