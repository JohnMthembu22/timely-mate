import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { store } from './store'

if (import.meta.env.DEV) {
  void import('./utils/clearLocalStorage.js')
  void import('./utils/devWelcome')
}

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
