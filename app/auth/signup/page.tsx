'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/app/components/Logo';

export default function SignupPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login?message=Account created successfully. Please sign in.');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Logo variant="default" showText={true} />
          </div>
          <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-border text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-foreground mb-2">
              Account Created!
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mb-4">
              Please check your email to verify your account.
            </p>
            <p className="text-muted-foreground text-xs">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Logo variant="default" showText={true} />
        </div>

        {/* Signup Card */}
        <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-border">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Start managing your invoices today
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 md:space-y-6">
            {/* Full Name Input */}
            <div>
              <label className="block text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-background border border-border rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground font-medium text-sm md:text-base placeholder:text-muted-foreground/50"
                  disabled={loading}
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  minLength={6}
                  className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-background border border-border rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground font-medium text-sm md:text-base placeholder:text-muted-foreground/50"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  minLength={6}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 md:mt-8 text-center">
            <p className="text-muted-foreground text-xs md:text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary font-black hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-[10px] md:text-xs">
            By signing up, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}

