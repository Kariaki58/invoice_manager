'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function PWAUpdatePrompt() {
  const [show, setShow] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleUpdate = (event: any) => {
      setRegistration(event.detail);
      setShow(true);
    };

    window.addEventListener('pwa-update-available', handleUpdate);
    return () => window.removeEventListener('pwa-update-available', handleUpdate);
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-card/90 backdrop-blur-xl border border-primary/20 p-4 rounded-3xl shadow-[0_20px_50px_rgba(139,92,246,0.3)] flex items-center justify-between gap-6 max-w-md mx-auto group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center animate-pulse">
            <RefreshCw className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-foreground tracking-tight">Update Available</h3>
            <p className="text-muted-foreground text-xs font-medium">New features are ready for you!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpdate}
            className="bg-primary text-white px-5 py-2.5 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-95 whitespace-nowrap"
          >
            Reload
          </button>
          <button
            onClick={() => setShow(false)}
            className="p-2.5 text-muted-foreground hover:bg-muted/10 rounded-2xl transition-colors"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
