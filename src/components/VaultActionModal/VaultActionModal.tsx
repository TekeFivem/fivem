import { useState } from 'react'
import {
  CLEANERS, fmtMoney, insurancePremium, securitySurcharge, extendPrice, systemOffer,
  type VaultItem,
} from '../../lib/vault'
import { useVaultStore } from '../../store/vaultStore'
import styles from './VaultActionModal.module.scss'

export const VaultActionModal = ({ item, onClose }: { item: VaultItem; onClose: () => void }) => {
  const s = useVaultStore()
  const [askPrice, setAskPrice] = useState(Math.round((item.estValueMin + item.estValueMax) / 2))
  const insured = item.security !== 'unprotected'
  const secured = item.security === 'secured'

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.head}>
          <span className={styles.title}>{item.name} — AKSİYON</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </header>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Boşaltma Yöntemi</h4>
          <div className={styles.cleaners}>
            {CLEANERS.map((c) => (
              <button key={c.id} className={styles.cleaner}
                onClick={() => { s.hireCleaner(item.id, c.id); onClose() }}>
                <span className={styles.cName}>🧹 {c.label}</span>
                <span className={styles.cMeta}>{fmtMoney(c.price)} · çalma riski %{Math.round(c.theftChance * 100)}</span>
                <span className={styles.cDesc}>{c.desc}</span>
              </button>
            ))}
          </div>

          <button className={styles.row} onClick={() => { s.cleanSelf(item.id); onClose() }}>
            👷 Kendin Temizle <span className={styles.muted}>— risk yok, zaman ister</span>
          </button>
          <button className={styles.row} onClick={() => { s.sellToSystem(item.id); onClose() }}>
            💰 Sisteme Sat <span className={styles.muted}>— anında {fmtMoney(systemOffer(item.estValueMin, item.estValueMax))}</span>
          </button>
          <div className={styles.sellRow}>
            <span>🤝 Oyuncuya Sat</span>
            <input className={styles.price} type="number" min={0} value={askPrice}
              onChange={(e) => setAskPrice(Number(e.target.value))} />
            <button className={styles.smallBtn} onClick={() => { s.listForPlayer(item.id, askPrice); onClose() }}>Listele</button>
          </div>
        </section>

        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Koruma</h4>
          <button className={styles.row} disabled={insured} onClick={() => s.buyInsurance(item.id)}>
            🛡️ Sigorta {insured ? '✓ Alındı' : `— ${fmtMoney(insurancePremium(item.estValueMax))}`}
            <span className={styles.muted}> soyulursan para iadesi</span>
          </button>
          <button className={styles.row} disabled={!insured || secured} onClick={() => s.buySecurity(item.id)}>
            🔒 Yüksek Güvenlik {secured ? '✓ Aktif' : `— ${fmtMoney(securitySurcharge(item.estValueMax))}`}
            <span className={styles.muted}>{insured ? ' soyulmayı tamamen engeller' : ' (önce sigorta gerekli)'}</span>
          </button>
          <button className={styles.row} onClick={() => s.extendTime(item.id)}>
            ⏱️ Süre Uzat <span className={styles.muted}>— +6 sa · {fmtMoney(extendPrice(item.estValueMax))}</span>
          </button>
        </section>
      </div>
    </div>
  )
}