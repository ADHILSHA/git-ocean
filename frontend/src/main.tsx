import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/instrument-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

if (import.meta.env.DEV) {
  // e2e/manual debugging handle; stripped from production builds.
  import('./store/oceanStore').then(({ useOcean }) => {
    ;(window as unknown as { __ocean: typeof useOcean }).__ocean = useOcean
  })
}
