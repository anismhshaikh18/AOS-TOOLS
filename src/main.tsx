import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { AuthSecurityProvider } from './context/AuthSecurityContext';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    registerSW({
      immediate: true,
      onOfflineReady() {
        window.dispatchEvent(new CustomEvent('aos-pwa-offline-ready'));
      },
    });
  } else {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        if (registration.active?.scriptURL?.includes('dev-sw.js')) {
          void registration.unregister();
        }
      });
    });
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthSecurityProvider>
        <App />
      </AuthSecurityProvider>
    </React.StrictMode>
  );
}
