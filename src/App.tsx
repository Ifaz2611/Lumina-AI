import { useSelector } from 'react-redux'
import { RootState } from './store'

import './App.css'
import Welcome from './pages/Welcome/Welcome'
import Chat from './pages/Chat/Chat'

function App() {
  const { API_KEY, theme } = useSelector((state: RootState) => state.user)

  return (
    <main className={`app-wrapper ${theme}`}>
      {API_KEY ? 
        <Chat />
        :
        <Welcome />
      }
    </main>
  )
}

export default App
