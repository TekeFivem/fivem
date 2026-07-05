declare global {
  interface Window { GetParentResourceName?: () => string }
}

const RESOURCE = window.GetParentResourceName ? window.GetParentResourceName() : 'teke_auction'

// Tarayıcı (npm run dev) modunda mock döner; oyunda gerçek NUI callback'i çağırır.
export async function fetchNui<T = unknown>(cb: string, data: unknown = {}, mock?: T): Promise<T> {
  if (import.meta.env.DEV) return (mock ?? ({} as T))
  const resp = await fetch(`https://${RESOURCE}/${cb}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  })
  return (await resp.json()) as T
}