import { useCallback, useEffect, useState } from 'react'
import { fetchNui } from '../lib/fetchNui'
import { useNuiEvent } from './useNuiEvent'
import type { ChatMessage, ChatParticipant } from '../lib/chat'

const DEV_PARTICIPANTS: ChatParticipant[] = [
  { cid: 'A', name: 'Mike_T', self: true },
  { cid: 'B', name: 'Kaan_99' },
  { cid: 'C', name: 'Deniz' },
  { cid: 'D', name: 'Berkay' },
]
const DEV_MESSAGES: ChatMessage[] = [
  { id: 'm1', cid: 'B', name: 'Kaan_99', message: 'Selam @Mike_T bu kutu senin mi?', ts: Date.now() - 60000 },
  { id: 'm2', cid: 'A', name: 'Mike_T', message: 'Evet, @Kaan_99 @Deniz teklif verin', ts: Date.now() - 30000, self: true },
]

export function useAuctionChat(auctionId?: string) {
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const me = participants.find((p) => p.self)
  const myName = me?.name

  const loadParticipants = useCallback(() => {
    if (!auctionId) return
    fetchNui<ChatParticipant[]>('getParticipants', { id: auctionId }, DEV_PARTICIPANTS)
      .then((list) => setParticipants(list ?? []))
      .catch(() => {})
  }, [auctionId])

  // İlk açılış: katılımcılar + eski mesajlar (getChat)
  useEffect(() => {
    if (!auctionId) return
    loadParticipants()
    fetchNui<ChatMessage[]>('getChat', { id: auctionId }, DEV_MESSAGES)
      .then((list) => setMessages(list ?? []))
      .catch(() => {})
  }, [auctionId, loadParticipants])

  // CANLI: biri katılınca participants sayısı değişir → listeyi tazele
  useNuiEvent<{ id: string; participants?: number }>('auctionStats', (d) => {
    if (d.id === auctionId && d.participants !== undefined) loadParticipants()
  })

  // CANLI: yeni mesaj
  useNuiEvent<ChatMessage & { auctionId: string }>('auctionChat', (d) => {
    if (d.auctionId !== auctionId) return
    setMessages((prev) =>
      prev.some((m) => m.id === d.id)
        ? prev
        : [...prev, { ...d, self: myName ? d.name === myName : d.self }],
    )
  })

  const send = useCallback(
    (text: string) => {
      const message = text.trim()
      if (!message || !auctionId) return
      fetchNui<{ ok?: boolean; id?: string; ts?: number }>(
        'sendChat',
        { id: auctionId, message },
        { ok: true, id: `dev-${Date.now()}`, ts: Date.now() }, // dev fallback
      )
        .then((res) => {
          if (!res || res.ok === false) return
          // DEV'de sunucu echo'su yok → kendi mesajını ekle
          if (import.meta.env.DEV) {
            setMessages((prev) => [
              ...prev,
              {
                id: res.id ?? `dev-${Date.now()}`,
                cid: me?.cid ?? 'me',
                name: myName ?? 'Ben',
                message,
                ts: res.ts ?? Date.now(),
                self: true,
              },
            ])
          }
        })
        .catch(() => {})
    },
    [auctionId, me?.cid, myName],
  )

  return { participants, messages, myName, send }
}