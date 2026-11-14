import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthSecurityProvider } from './context/AuthSecurityContext';
import './index.css';

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
