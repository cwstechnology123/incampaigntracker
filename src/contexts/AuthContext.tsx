// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { AuthContextType } from '../types';
import { useSessionStore } from '../states/stores/useSessionStore';
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, setSession } = useSessionStore();
  const [isLoading, setIsLoading] = useState(true);

  const mapUser = (supabaseUser: User | null): import('../types').User | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name: (supabaseUser.user_metadata?.name as string) ?? '',
      created_at: supabaseUser.created_at ?? '',
    };
  };

  const user = useMemo(() => mapUser(session?.user ?? null), [session]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession); // Sync session to global store
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      console.log('fetchProfile profile:', profile);
      if (error) {
        if ((error as any).code === 'PGRST116') {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData.user) throw authError ?? new Error('No authenticated user found');

          const { email, user_metadata } = authData.user;
          const name = user_metadata?.name || email?.split('@')[0] || 'User';

          const { error: createError } = await supabase
            .from('profiles')
            .insert([{ id: userId, email, name }]);

          if (createError) throw createError;
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error('fetchProfile error:', err);
      throw err;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session ?? null);
      if (data.user) await fetchProfile(data.user.id);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      setSession(data.session ?? null);
      if (data.user) await fetchProfile(data.user.id);
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const logoutPromise = supabase.auth.signOut();
      // Wrap signOut in a timeout of 5 seconds
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Logout timed out')), 5000)
      );
      await Promise.race([logoutPromise, timeout]);
      console.log('User logged out successfully');
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};