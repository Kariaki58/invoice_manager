'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Plus, Settings as SettingsIcon } from 'lucide-react';
import Logo from './Logo';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/create', label: 'Create', icon: Plus },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Bottom Navigation - Simplified Icons Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-40 md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.5)] h-20 safe-area-bottom">
        <div className="flex justify-around items-center h-full px-4 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-4 transition-all duration-300 relative group ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
                aria-label={item.label}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-primary rounded-b-2xl shadow-[0_0_20px_#8b5cf6]" />
                )}
                <Icon className={`w-7 h-7 transition-transform duration-300 ${active ? 'scale-110 active:scale-95' : 'group-active:scale-90'}`} />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-24 md:fixed md:inset-y-0 md:left-0 md:bg-card md:border-r md:border-border md:z-40 shadow-2xl">
        <div className="flex flex-col items-center py-6 space-y-8 h-full">
          <div className="px-2">
            <Logo variant="compact" showText={false} />
          </div>
          <div className="flex flex-col items-center space-y-8 flex-1 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-4 rounded-4xl transition-all duration-300 group relative ${
                    active
                      ? 'bg-primary text-white shadow-xl shadow-primary/40 transform scale-110'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-7 h-7 transition-transform group-hover:scale-110" />
                  {!active && (
                    <span className="absolute left-24 bg-card border border-border text-foreground text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
