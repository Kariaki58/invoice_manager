'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Plus, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/create', label: 'Create', icon: Plus },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-40 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex justify-around items-center h-16 safe-area-bottom px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                  active
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-primary'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-b-full shadow-[0_0_10px_#8b5cf6]" />
                )}
                <Icon className={`w-6 h-6 mb-1 ${active ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <div className="flex items-center px-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-20 md:fixed md:inset-y-0 md:left-0 md:bg-card md:border-r md:border-border md:z-40 shadow-2xl">
        <div className="flex flex-col items-center py-8 space-y-10 h-full">
          <div className="text-2xl font-black bg-linear-to-br from-primary to-purple-400 bg-clip-text text-transparent transform hover:scale-110 transition-transform cursor-default">
            IN
          </div>
          <div className="flex flex-col items-center space-y-6 flex-1 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-3 rounded-2xl transition-all duration-300 group relative ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/40 transform scale-110'
                      : 'text-gray-400 hover:bg-primary/10 hover:text-primary'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-6 h-6" />
                  {!active && (
                    <span className="absolute left-20 bg-card border border-border text-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="pb-4">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
