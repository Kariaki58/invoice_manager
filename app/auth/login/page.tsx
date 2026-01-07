'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/app/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Logo variant="default" showText={true} />
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-border">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Sign in to manage your invoices
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-background border border-border rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground font-medium text-sm md:text-base placeholder:text-muted-foreground/50"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-background border border-border rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground font-medium text-sm md:text-base placeholder:text-muted-foreground/50"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 md:mt-8 text-center">
            <p className="text-muted-foreground text-xs md:text-sm">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-primary font-black hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-[10px] md:text-xs">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}

