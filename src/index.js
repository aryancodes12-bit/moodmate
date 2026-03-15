import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ── Register Service Worker (PWA) ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered:', reg.scope);

        // Check for updates every 60 seconds
        setInterval(() => reg.update(), 60 * 1000);

        // Notify user when new version available
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available! Refresh to update.');
            }
          });
        });
      })
      .catch((err) => console.warn('[PWA] Service Worker registration failed:', err));
  });
}

// ── PWA Install Prompt ─────────────────────────────────────────────────────
// Store the install prompt event so we can trigger it from UI
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaInstallPrompt = e;
  console.log('[PWA] Install prompt ready');
  // Dispatch custom event so React can listen
  window.dispatchEvent(new CustomEvent('pwaInstallReady'));
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] MoodMate installed successfully! 🎉');
  window.__pwaInstallPrompt = null;
  window.dispatchEvent(new CustomEvent('pwaInstalled'));
});

reportWebVitals();