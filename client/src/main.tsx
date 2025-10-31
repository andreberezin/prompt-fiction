import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base/_global.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
