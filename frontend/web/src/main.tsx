import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './utils/authHashBootstrap'
import './styles/guidedTour.css'
import './index.css'
import { bootstrapAppStorage } from './utils/storageBootstrap'
import App from './App.tsx'
import { store } from './store'

bootstrapAppStorage()

if (import.meta.env.DEV) {
  void import('./utils/clearLocalStorage.js')
  void import('./utils/devWelcome')
}

/** After a new deploy, old cached bundles may request missing chunks (HTML 404 → MIME error). */
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  const reloaded = sessionStorage.getItem('timelymate_chunk_reload')
  if (!reloaded) {
    sessionStorage.setItem('timelymate_chunk_reload', '1')
    window.location.reload()
  }
})

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const msg = reason instanceof Error ? reason.message : String(reason ?? '')
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed')
  ) {
    event.preventDefault()
    const reloaded = sessionStorage.getItem('timelymate_chunk_reload')
    if (!reloaded) {
      sessionStorage.setItem('timelymate_chunk_reload', '1')
      window.location.reload()
    }
  }
})

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML =
    '<p style="font-family:system-ui;padding:24px;text-align:center">Timely Mate failed to start. Please refresh the page.</p>';
} else {
createRoot(rootEl).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
}
