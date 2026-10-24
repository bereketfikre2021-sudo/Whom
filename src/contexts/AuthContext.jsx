import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Handle OAuth callback from URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      console.log('Session user:', session?.user);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle OAuth callback from URL hash on mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      console.log('Checking URL hash:', hash);
      if (hash && hash.includes('access_token')) {
        console.log('Processing OAuth callback from hash');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session from OAuth callback:', session?.user?.email);
        if (session) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        }
        // Clear the hash from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    handleOAuthCallback();
  }, []);

  const checkAdminStatus = async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setIsAdmin(data.is_admin);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Google OAuth error:', error);
    }
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setIsAdmin(false);
    }
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
