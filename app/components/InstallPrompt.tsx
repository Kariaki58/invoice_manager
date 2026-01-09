'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      // Check for standalone mode (iOS)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check if running as PWA (iOS-specific property)
      const isPWA = (window.navigator as any).standalone || isStandalone;
      
      if (isPWA) {
        // Use timeout to avoid synchronous setState in effect
        setTimeout(() => setIsInstalled(true), 0);
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
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          localStorage.setItem('pwa-installed', 'true');
          setIsInstalled(true);
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.error('Error during installation:', error);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't clear deferredPrompt here, just hide the UI
    // Remember dismissal for 24 hours instead of 7 days for better visibility during testing
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled) return null;
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-96 bg-card border border-border shadow-2xl z-50 p-5 rounded-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
              IN
            </div>
            <div>
              <p className="font-black text-foreground text-base">Install invoiceme</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Install our app for a better experience and offline access.</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Add to Home Screen
          </button>
        </div>
      </div>
    </div>
  );
}

