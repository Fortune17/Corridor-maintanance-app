import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New content available, reloading...');
    window.location.reload();
  },
  onOfflineReady() {
    console.log('[PWA] App is ready for offline usage.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
