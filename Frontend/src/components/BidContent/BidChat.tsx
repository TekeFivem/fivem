import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './BidChat.module.scss'
import { fetchNui } from '../../lib/fetchNui'
import { useNuiEvent } from '../../hooks/useNuiEvent'

interface Props {
  auctionId?: string
}

interface Participant { cid: string; name: string; self?: boolean }
interface ChatRow { id: string; cid: string; name: string; message: string; ts: number; self?: boolean }
interface Message { id: string; author: string; text: string }

const toMsg = (r: ChatRow): Message => ({ id: r.id, author: r.name, text: r.message })
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// npm run dev için örnek veri (oyunda gerçek NUI'dan gelir)
const DEV_PARTICIPANTS: Participant[] = [
  { cid: 'me', name: 'Sen', self: true },
  { cid: 'b1', name: 'Mike_T' },
  { cid: 'b2', name: 'Aria' },
  { cid: 'b3', name: 'Berkay' },
  { cid: 'b4', name: 'Deniz' },
  { cid: 'b5', name: 'Kaan_99' },
]
const DEV_CHAT: ChatRow[] = [
  { id: 'm1', cid: 'b1', name: 'Mike_T', message: 'Bu storage bende olacak', ts: Date.now() - 90000 },
  { id: 'm2', cid: 'b3', name: 'Berkay', message: '@Sen fiyatı çok yükseltme :)', ts: Date.now() - 60000 },
  { id: 'm3', cid: 'b2', name: 'Aria', message: 'Kutulardan telefon çıktı @Berkay', ts: Date.now() - 30000 },
]

export const BidChat = ({ auctionId }: Props) => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [anchor, setAnchor] = useState(0) // '@' konumu
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const myName = participants.find((p) => p.self)?.name ?? 'Sen'
  // sadece bu auction'ın katılımcıları (tagleme kaynağı)
  const SORTED = useMemo(
    () => participants.map((p) => p.name).sort((a, b) => a.localeCompare(b, 'tr')),
    [participants],
  )

  const loadParticipants = useCallback(() => {
    if (!auctionId) return
    fetchNui<Participant[]>('getParticipants', { id: auctionId }, DEV_PARTICIPANTS)
      .then((list) => setParticipants(list ?? []))
      .catch(() => {})
  }, [auctionId])

  // ilk açılış: katılımcılar + eski mesajlar (getChat)
  useEffect(() => {
    if (!auctionId) return
    loadParticipants()
    fetchNui<ChatRow[]>('getChat', { id: auctionId }, DEV_CHAT)
      .then((rows) => setMessages((rows ?? []).map(toMsg).slice(-50)))
      .catch(() => {})
  }, [auctionId, loadParticipants])

  // CANLI: biri katıldığında participants sayısı değişir → listeyi tazele
  useNuiEvent<{ id: string; participants?: number }>('auctionStats', (d) => {
    if (d.id === auctionId && d.participants !== undefined) loadParticipants()
  })

  // CANLI: yeni mesaj
  useNuiEvent<ChatRow & { auctionId: string }>('auctionChat', (d) => {
    if (d.auctionId !== auctionId) return
    setMessages((prev) =>
      prev.some((m) => m.id === d.id) ? prev : [...prev, toMsg(d)].slice(-50),
    )
  })

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const suggestions = suggestOpen
    ? SORTED.filter((p) => p.toLocaleLowerCase('tr').startsWith(query.toLocaleLowerCase('tr')))
    : []

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    const caret = e.target.selectionStart ?? value.length
    const before = value.slice(0, caret)
    const at = before.lastIndexOf('@') // isimler boşluk içerebilir → son '@'ı baz al
    if (at >= 0) {
      const q = before.slice(at + 1)
      if (!/[\n@]/.test(q)) {
        setQuery(q)
        setAnchor(at)
        setSuggestOpen(true)
        return
      }
    }
    setSuggestOpen(false)
  }

  const applySuggestion = (name: string) => {
    const caret = inputRef.current?.selectionStart ?? input.length
    const next = input.slice(0, anchor) + '@' + name + ' ' + input.slice(caret)
    setInput(next)
    setSuggestOpen(false)
    const pos = anchor + name.length + 2
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (el) { el.focus(); el.setSelectionRange(pos, pos) }
    })
  }

  const send = () => {
    const text = input.trim()
    if (!text || !auctionId) return
    fetchNui<{ ok?: boolean; id?: string; ts?: number }>(
      'sendChat',
      { id: auctionId, message: text },
      { ok: true, id: `me-${Date.now()}`, ts: Date.now() }, // dev fallback
    )
      .then((res) => {
        if (!res || res.ok === false) return
        // DEV: sunucu echo'su yok → kendi mesajını ekle (oyunda auctionChat ile gelir)
        if (import.meta.env.DEV) {
          setMessages((prev) =>
            [...prev, { id: res.id ?? `me-${Date.now()}`, author: myName, text }].slice(-50),
          )
        }
      })
      .catch(() => {})
    setInput('')
    setSuggestOpen(false)
  }

  const mention = (name: string) => {
    setInput((prev) => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}@${name} `)
    inputRef.current?.focus()
  }

  // etiket eşleşmesini gerçek isim listesine göre yap (boşluk/Türkçe karakter destekli)
  const mentionRe = useMemo(() => {
    if (SORTED.length === 0) return null
    const alts = [...SORTED].sort((a, b) => b.length - a.length).map(esc).join('|')
    return new RegExp(`@(${alts})`, 'g')
  }, [SORTED])

  const renderText = (text: string) => {
    if (!mentionRe) return text
    const re = new RegExp(mentionRe.source, 'g')
    const out: React.ReactNode[] = []
    let last = 0
    let i = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push(<span key={`t${i++}`}>{text.slice(last, m.index)}</span>)
      const me = m[1] === myName
      out.push(
        <span
          key={`m${i++}`}
          className={[styles.mention, me && styles.mentionMe].filter(Boolean).join(' ')}
        >
          @{m[1]}
        </span>,
      )
      last = m.index + m[0].length
    }
    if (last < text.length) out.push(<span key={`t${i++}`}>{text.slice(last)}</span>)
    return out
  }

  const mentionsMe = (text: string) => {
    if (!mentionRe) return false
    const re = new RegExp(mentionRe.source, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m[1] === myName) return true
    }
    return false
  }

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.title}>Sohbet</span>
        <button type="button" className={styles.partToggle} onClick={() => setOpen((o) => !o)}>
          Katılımcılar ({SORTED.length}) {open ? '▾' : '▸'}
        </button>
      </div>

      {open && (
        <div className={styles.participants}>
          {SORTED.map((p) => (
            <button key={p} type="button" className={styles.partChip} onClick={() => mention(p)}>
              <span className={styles.partDot} />
              {p}
            </button>
          ))}
        </div>
      )}

      <ul className={styles.messages} ref={listRef}>
        {messages.map((m) => (
          <li key={m.id} className={[styles.msg, mentionsMe(m.text) && styles.msgMe].filter(Boolean).join(' ')}>
            <span className={styles.author}>{m.author}:</span>{' '}
            <span className={styles.text}>{renderText(m.text)}</span>
          </li>
        ))}
      </ul>

      <div className={styles.inputWrap}>
        {suggestOpen && suggestions.length > 0 && (
          <ul className={styles.suggest}>
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className={styles.suggestItem}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applySuggestion(s)}
                >
                  <span className={styles.partDot} />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            placeholder="Mesaj yaz… (@ ile etiketle)"
            maxLength={256}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (suggestOpen && suggestions.length > 0) {
                if (e.key === 'Enter') { e.preventDefault(); applySuggestion(suggestions[0]); return }
                if (e.key === 'Escape') { setSuggestOpen(false); return }
              }
              if (e.key === 'Enter') send()
            }}
          />
          <button type="button" className={styles.sendBtn} onClick={send}>Gönder</button>
        </div>
      </div>
    </div>
  )
}