import { Tablet } from './components/Tablet/Tablet'
import { Sidebar } from './components/Sidebar/Sidebar'
import { TabContent } from './components/TabContent/TabContent'
import styles from './App.module.scss'

function App() {
  return (
    <Tablet>
      <div className={styles.layout}>
        <Sidebar />

        <div className={styles.content}>
          <TabContent />
        </div>
      </div>
    </Tablet>
  )
}

export default App