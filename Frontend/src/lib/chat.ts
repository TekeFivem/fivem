export interface ChatParticipant {
  cid: string
  name: string
  self?: boolean
}

export interface ChatMessage {
  id: string
  cid: string
  name: string
  message: string
  ts: number
  self?: boolean
}