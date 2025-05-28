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

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, get user data and create profile
          const { data: authData } = await supabase.auth.getUser();
          if (!authData.user) throw new Error('No authenticated user found');

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: authData.user.email || '',
              name: authData.user.user_metadata.name || authData.user.email?.split('@')[0] || 'User',
            })
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      await fetchProfile(data.user.id);
      return data.user;
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      throw error;
    }
  };

  // const register = async (name: string, email: string, password: string) => {
  //   try {
  //     setIsLoading(true);
  //     const { data, error } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         data: {
  //           name: name, // passed to raw_user_meta_data
  //         },
  //       },
  //     });
  //    console.log(data, error);
  //     if (error) throw error;
  //     if (!data.user) throw new Error('No user data returned');

  //     await fetchProfile(data.user.id);
  //     return data.user;
  //   } catch (error) {
  //     setIsLoading(false);
  //     console.error('Registration error:', error);
  //     throw error;
  //   }
  // };

  const register = async (name: string, email: string, password: string) => {
  setIsLoading(true); // move outside try so it always sets loading

  try {
    // 1. Register the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("Auth Response:", authData, authError);

    if (authError) throw authError;
    if (!authData.user) throw new Error("User not returned from auth");

    const user = authData.user;

    // 2. Wait for session if required (optional)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn("No active session yet – email confirmation might be required.");
    }

    // 3. Upsert profile (to avoid duplicate insert errors)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,     // must match auth.users.id
      name,
      email,
    });

    if (profileError) throw profileError;

    return user;
  } catch (err) {
    console.error("Registration error:", err);
    setIsLoading(false);
    throw err;
  } finally {
    // This runs regardless of success/failure
    setIsLoading(false);
  }
};

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
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