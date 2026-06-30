import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 🟢 store'u import et
import { useJoinedStore } from './store/joinedStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 🟢 sadece development modunda window'a aç
if (import.meta.env.DEV) {
  ;(window as any).joined = useJoinedStore
}
