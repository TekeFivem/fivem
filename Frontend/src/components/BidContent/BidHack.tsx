import { useEffect, useRef, useState } from 'react'
import styles from './BidHack.module.scss'
import { fetchNui } from '../../lib/fetchNui'

const money = (n: number) => `$${n.toLocaleString('en-US')}`

interface HackDef {
  id: string
  label: string
  cost: number
  verb: string     // ifşa: "Sen → X: <verb>"
  affected: string // gizli: "X: <affected>"
}
const HACKS: HackDef[] = [
  { id: 'double', label: 'Double Bid', cost: 1000, verb: 'bid’ini katladı', affected: 'bid’i katlandı' },
  { id: 'jam', label: 'Lock Bidder', cost: 1200, verb: 'bid vermesini engelledi', affected: 'bid veremiyor' },
  { id: 'blackout', label: 'Blind Bidder', cost: 800, verb: 'ekranını kör etti', affected: 'kör edildi' },
  { id: 'deanon', label: 'Unreveal Hidden', cost: 1500, verb: 'kimliğini ifşa etti', affected: 'ifşa edildi' },
  { id: 'spoof', label: 'Fake Bid', cost: 600, verb: 'sahte bid enjekte etti', affected: 'sahte bid gördü' },
  { id: 'freeze', label: 'Freeze Price', cost: 900, verb: 'fiyatı dondurdu', affected: 'fiyatı donduruldu' },
]

const TRACE_STEPS = [5, 10, 25, 45, 70, 100]
const CLEAN_COST = 2000
interface LogEntry { id: string; text: string; exposed: boolean }
const TARGETS = ['Mike_T', 'Aria', 'Berkay', 'Deniz', 'Kaan_99']

/* ---- İz temizleme minigame (timing bar) ---- */
const TraceMinigame = ({ onClose, onResult }: { onClose: () => void; onResult: (win: boolean) => void }) => {
  const [pos, setPos] = useState(0)
  const posRef = useRef(0)
  const dirRef = useRef(1)
  const [done, setDone] = useState<boolean | null>(null)
  const ZONE_START = 42
  const ZONE_END = 58

  useEffect(() => {
    if (done !== null) return
    const id = setInterval(() => {
      let p = posRef.current + dirRef.current * 2.5
      if (p >= 100) { p = 100; dirRef.current = -1 }
      else if (p <= 0) { p = 0; dirRef.current = 1 }
      posRef.current = p
      setPos(p)
    }, 16)
    return () => clearInterval(id)
  }, [done])

  const stop = () => {
    if (done !== null) return
    const win = posRef.current >= ZONE_START && posRef.current <= ZONE_END
    setDone(win)
    setTimeout(() => onResult(win), 800)
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>İz Temizleme</span>
          <button type="button" className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <p className={styles.modalHint}>İşaretçi yeşil bölgedeyken DUR'a bas.</p>
        <div className={styles.track}>
          <span className={styles.zone} style={{ left: `${ZONE_START}%`, width: `${ZONE_END - ZONE_START}%` }} />
          <span className={styles.marker} style={{ left: `${pos}%` }} />
        </div>
        {done === null ? (
          <button type="button" className={styles.stopBtn} onClick={stop}>DUR</button>
        ) : (
          <div className={[styles.result, done ? styles.win : styles.lose].join(' ')}>
            {done ? 'BAŞARILI — iz azaldı' : 'BAŞARISIZ'}
          </div>
        )}
      </div>
    </div>
  )
}

export const BidHack = ({ phase = 'open' }: { phase?: 'open' | 'final' | 'ended' }) => {
  const [view, setView] = useState<'hacks' | 'log'>('hacks')
  const [budget, setBudget] = useState(25000)
  const [traceIndex, setTraceIndex] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])
  const [gameOpen, setGameOpen] = useState(false)
  const [pendingHack, setPendingHack] = useState<HackDef | null>(null)
  const blocked = (id: string) => phase === 'ended' || (phase === 'final' && id !== 'double')
  const exposureChance = TRACE_STEPS[Math.min(traceIndex, TRACE_STEPS.length - 1)]

  const runHack = async (hack: HackDef, target: string) => {
    if (budget < hack.cost) return

    // NUI çağrısı (FiveM backend)
    const res = await fetchNui<{ ok: boolean; cost?: number; reason?: string }>(
      'hack',
      { hackId: hack.id, target },
      { ok: true, cost: hack.cost }, // dev mock
    )

    if (!res.ok) {
      setLog((prev) => [
        { id: `l-${Date.now()}`, text: `Hack başarısız: ${res.reason}`, exposed: true },
        ...prev,
      ])
      return
    }

    const exposed = Math.random() * 100 < exposureChance
    setBudget((b) => b - (res.cost ?? hack.cost))
    setTraceIndex((t) => t + 1)

    const text = exposed
      ? `Sen → ${target}: ${hack.verb}`
      : `${target}: ${hack.affected}`

    setLog((prev) => [{ id: `l-${Date.now()}`, text, exposed }, ...prev].slice(0, 20))
  }


  const chooseTarget = (target: string) => {
    if (pendingHack) runHack(pendingHack, target)
    setPendingHack(null)
  }

  const cleanWithMoney = () => {
    if (budget < CLEAN_COST || traceIndex === 0) return
    setBudget((b) => b - CLEAN_COST)
    setTraceIndex((t) => Math.max(0, t - 1))
  }
  const onGameResult = (win: boolean) => {
    if (win) setTraceIndex((t) => Math.max(0, t - 2))
    setGameOpen(false)
  }

  return (
    <div className={styles.panel}>
      {/* iki ekran sekmesi + bütçe */}
      <div className={styles.head}>
        <div className={styles.tabs}>
          <button type="button" className={[styles.tab, view === 'hacks' && styles.tabOn].filter(Boolean).join(' ')} onClick={() => setView('hacks')}>HACKS</button>
          <button type="button" className={[styles.tab, view === 'log' && styles.tabOn].filter(Boolean).join(' ')} onClick={() => setView('log')}>LOGS</button>
        </div>
        <span className={styles.budget}>{money(budget)}</span>
      </div>

      {/* İZ / İFŞA TABELASI (yüzde + bar birlikte) */}
      <div className={styles.tracePlate}>
        <div className={styles.tracePlateHead}>
          <span className={styles.traceLabel}>Risk of exposure</span>
          <span className={styles.traceVal}>%{exposureChance}</span>
        </div>
        <div className={styles.traceBar}>
          <span className={styles.traceFill} style={{ width: `${exposureChance}%` }} />
        </div>
      </div>

      {view === 'hacks' ? (
        <>
          <div className={styles.hacks}>
            {HACKS.map((h) => (
              <button
                key={h.id}
                type="button"
                className={styles.hackBtn}
                disabled={budget < h.cost || blocked(h.id)}
                onClick={() => setPendingHack(h)}
              >
                <span className={styles.hackName}>{h.label}</span>
                <span className={styles.hackCost}>{money(h.cost)}</span>
              </button>
            ))}
          </div>
          <div className={styles.cleanRow}>
            <button type="button" className={styles.cleanBtn}
              disabled={budget < CLEAN_COST || traceIndex === 0 || phase !== 'open'}
              onClick={cleanWithMoney}>Remove Trace {money(CLEAN_COST)}</button>
            <button type="button" className={styles.cleanBtn}
              disabled={traceIndex === 0 || phase !== 'open'}
              onClick={() => setGameOpen(true)}>Misson</button>
          </div>
        </>
      ) : (
        <ul className={styles.log}>
          {log.length === 0 && <li className={styles.logEmpty}>Henüz işlem yok</li>}
          {log.map((e) => (
            <li key={e.id} className={[styles.logRow, e.exposed && styles.logExposed].filter(Boolean).join(' ')}>
              <span className={styles.logDot} />
              <span className={styles.logText}>{e.text}</span>
            </li>
          ))}
        </ul>
      )}

      {/* HEDEF SEÇME MODALI */}
      {pendingHack && (
        <div className={styles.backdrop} onClick={() => setPendingHack(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span className={styles.modalTitle}>{pendingHack.label} — Hedef Seç</span>
              <button type="button" className={styles.modalClose} onClick={() => setPendingHack(null)}>✕</button>
            </div>
            <p className={styles.modalHint}>{money(pendingHack.cost)} · İfşa riski %{exposureChance}</p>
            <div className={styles.targetList}>
              {TARGETS.map((t) => (
                <button key={t} type="button" className={styles.targetItem} onClick={() => chooseTarget(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameOpen && <TraceMinigame onClose={() => setGameOpen(false)} onResult={onGameResult} />}
    </div>
  )
}