'use client';

import { FileText } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'default' | 'compact' | 'mobile';
  showText?: boolean;
}

export default function Logo({ variant = 'default', showText = true }: LogoProps) {
  const isCompact = variant === 'compact';
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-purple-400 rounded-full border-2 border-background" />
        </div>
        {showText && (
          <span className="text-lg font-black text-foreground tracking-tight">
            invoiceme
          </span>
        )}
      </div>
    );
  }

  if (isCompact) {
    return (
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-400 rounded-full border-2 border-background animate-pulse" />
        </div>
        {showText && (
          <span className="text-xl font-black bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent tracking-tight">
            invoiceme
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/40 group-hover:shadow-purple-500/60 transition-all group-hover:scale-110 group-hover:rotate-3">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-background animate-pulse" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-black bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 bg-clip-text text-transparent tracking-tight leading-tight">
            invoiceme
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            Invoice Manager
          </span>
        </div>
      )}
    </Link>
  );
}

