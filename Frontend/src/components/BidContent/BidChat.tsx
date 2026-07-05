import { useEffect, useRef, useState } from 'react'
import styles from './BidChat.module.scss'

const CURRENT_USER = 'Sen'
const PARTICIPANTS = ['Mike_T', 'Aria', 'Berkay', 'Deniz', 'Kaan_99', 'Sen']
const SORTED = [...PARTICIPANTS].sort((a, b) => a.localeCompare(b, 'tr'))

interface Message { id: string; author: string; text: string }
const SEED: Message[] = [
  { id: 'm1', author: 'Mike_T', text: 'Bu storage bende olacak' },
  { id: 'm2', author: 'Berkay', text: '@Sen fiyatı çok yükseltme :)' },
  { id: 'm3', author: 'Aria', text: 'Kutulardan telefon çıktı @Berkay' },
]

export const BidChat = () => {
  const [messages, setMessages] = useState<Message[]>(SEED)
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [anchor, setAnchor] = useState(0) // '@' konumu
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const suggestions = suggestOpen
    ? SORTED.filter((p) => p.toLowerCase().startsWith(query.toLowerCase()))
    : []

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    const caret = e.target.selectionStart ?? value.length
    const before = value.slice(0, caret)
    const m = before.match(/(?:^|\s)@(\w*)$/) // @ ile başlayan aktif kelime
    if (m) {
      setQuery(m[1])
      setAnchor(caret - m[1].length - 1)
      setSuggestOpen(true)
    } else {
      setSuggestOpen(false)
    }
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
    if (!text) return
    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, author: CURRENT_USER, text }].slice(-50))
    setInput('')
    setSuggestOpen(false)
    // TODO: FiveM → fetchNui('chatSend', { text })
  }

  const mention = (name: string) => {
    setInput((prev) => `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}@${name} `)
    inputRef.current?.focus()
  }

  const renderText = (text: string) =>
    text.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        const me = part.slice(1) === CURRENT_USER
        return (
          <span key={i} className={[styles.mention, me && styles.mentionMe].filter(Boolean).join(' ')}>
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })

  const mentionsMe = (text: string) => text.split(/(@\w+)/g).some((p) => p === `@${CURRENT_USER}`)

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
                  onMouseDown={(e) => e.preventDefault()} // input focus'u kaybolmasın
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