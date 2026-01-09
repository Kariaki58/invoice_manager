'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      // Check for standalone mode (iOS)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check if running as PWA (iOS-specific property)
      const nav = window.navigator as any;
      const isPWA = nav.standalone || isStandalone;
      
      if (isPWA) {
        setIsInstalled(true);
        return;
      }

      // Check if already installed (Android/Chrome)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          if (registration.active) {
            // Check localStorage for install status
            const installStatus = localStorage.getItem('pwa-installed');
            if (installStatus === 'true') {
              setIsInstalled(true);
            }
          }
        });
      }

      // Check if user has dismissed the prompt before
      const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          return;
        }
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      // Show prompt after a short delay to ensure page is loaded
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handler);
      
      // Also check if we can show a manual install option
      // For browsers that support it but haven't fired the event yet
      setTimeout(() => {
        // If we have service worker and manifest, we can potentially install
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
              setCanInstall(true);
              // Show manual install prompt after 5 seconds if beforeinstallprompt hasn't fired
              setTimeout(() => {
                if (!deferredPrompt && !isInstalled) {
                  setShowPrompt(true);
                }
              }, 5000);
            }
          });
        }
      }, 1000);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handler);
      }
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Directly trigger the install prompt
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          localStorage.setItem('pwa-installed', 'true');
          setIsInstalled(true);
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.error('Error during installation:', error);
        setShowPrompt(false);
      }
    } else {
      // If beforeinstallprompt is not available, hide the prompt
      // The user can use the install button in settings or browser's native install option
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled) return null;
  if (!showPrompt && !canInstall) return null;
  
  // Show prompt even if beforeinstallprompt hasn't fired (manual install option)
  if (!showPrompt && canInstall && !deferredPrompt) {
    // Don't show yet, wait for user interaction or the event
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-auto md:top-0 left-0 right-0 bg-card border-t md:border-b border-border shadow-2xl z-50 p-4 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">
            IN
          </div>
          <div>
            <p className="font-black text-foreground text-sm md:text-base">Install invoiceme</p>
            <p className="text-xs md:text-sm text-muted-foreground">Add to home screen for quick access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-black text-xs md:text-sm shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

