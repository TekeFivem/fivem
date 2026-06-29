import { Tablet } from './components/Tablet/Tablet'
import { Sidebar } from './components/Sidebar/Sidebar'

function App() {
  return (
    <Tablet>
      <div style={{ display: 'flex', height: '100%' }} >
        <Sidebar />
        <main style={{ flex: 1 }} >{/* içerik alanı */}</main>
      </div>
    </Tablet>
  )
}

export default App