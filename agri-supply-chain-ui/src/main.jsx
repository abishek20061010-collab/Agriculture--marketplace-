import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            success: { 
              duration: 3000,
              style: { background: "#f0faf4", color: "#1a2e1a", border: "1px solid #4CAF50" } 
            },
            error: { 
              duration: 4000,
              style: { background: "#fef2f2", color: "#7f1d1d", border: "1px solid #fca5a5" } 
            }
          }}
        />
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
