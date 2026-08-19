import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// On startup: sync .env key → localStorage so Settings modal always shows the correct key
const envKey = import.meta.env.VITE_GEMINI_API_KEY;
if (envKey) {
  // Always write the .env key to localStorage so it's visible in Settings
  localStorage.setItem('gemini_api_key', envKey.trim());
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
