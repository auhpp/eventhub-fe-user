import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContex.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { FavoriteProvider } from './context/FavoriteContext.jsx'
import { QAWebSocketProvider } from './context/QAWebSocketContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <FavoriteProvider>
        <ChatProvider>
          <QAWebSocketProvider>
            <App />
          </QAWebSocketProvider>
        </ChatProvider>
      </FavoriteProvider>
    </AuthProvider>
  </BrowserRouter>,
)
