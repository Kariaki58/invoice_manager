'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/supabase/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single<ProfileRow>();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    let mounted = true;

    // Get initial session (non-blocking)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).catch(err => {
          console.error('Error fetching profile:', err);
        });
      }
      setLoading(false);
    }).catch(err => {
      console.error('Error getting session:', err);
      if (mounted) setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).catch(err => {
          console.error('Error fetching profile:', err);
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      router.push('/');
      router.refresh();
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });
    if (!error) {
      router.push('/auth/login?message=Check your email to confirm your account');
      router.refresh();
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/auth/login');
    router.refresh();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      // Build update object with only defined fields
      const updatePayload: Record<string, any> = {};
      
      if (updates.email !== undefined) {
        updatePayload.email = updates.email;
      }
      if (updates.full_name !== undefined) {
        updatePayload.full_name = updates.full_name;
      }
      if (updates.avatar_url !== undefined) {
        updatePayload.avatar_url = updates.avatar_url;
      }

      // If no updates, return early
      if (Object.keys(updatePayload).length === 0) {
        return;
      }

      const { error } = await (supabase
        .from('profiles') as any)
        .update(updatePayload)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

