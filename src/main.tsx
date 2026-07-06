import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Telegram Mini App & TON Wallet providers disabled by default on Cloudflare Workers
// Uncomment and wrap App with <TonConnectUIProvider> when external server is configured

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
