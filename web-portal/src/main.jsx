import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { ThemeProvider } from './ThemeContext' // <-- 1. IMPORT

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> {/* <-- 2. BUNGKUS APP */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
)