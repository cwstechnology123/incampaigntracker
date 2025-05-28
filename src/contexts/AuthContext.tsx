import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
       console.log(profile,'profile');
      if (error) {
        if (error.code === 'PGRST116') {
          
          // Profile doesn't exist, get user data and create profile
          const { data: authData } = await supabase.auth.getUser();
          if (!authData.user) throw new Error('No authenticated user found');
          console.log(userId, 'userId');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              email: authData.user.email || '',
              name: authData.user.user_metadata.name || authData.user.email?.split('@')[0] || 'User',
            }])
            .select()
            .single();

          if (createError) throw createError;
          if (!newProfile) throw new Error('Failed to create profile');

          setUser({
            id: userId,
            email: newProfile.email,
            name: newProfile.name,
            createdAt: newProfile.created_at,
          });
        } else {
          throw error;
        }
      } else if (profile) {
        setUser({
          id: userId,
          email: profile.email,
          name: profile.name,
          createdAt: profile.created_at,
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      await fetchProfile(data.user.id);
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // passed to raw_user_meta_data
          },
        },
      });
    // console.log(data, error);
      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');
      await fetchProfile(data.user.id);
    } catch (error) {
      setIsLoading(false);
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null); // triggers re-render in components using user/isAuthenticated
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};