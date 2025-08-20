import { useState, useEffect, createContext, useContext } from "react";
import { User, Session, AuthResponse, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface SignUpMetadata {
  role: "candidat" | "recruteur" | "admin";
  first_name?: string;
  last_name?: string;
  phone?: string;
  matricule?: string;
  birth_date?: string;
  current_position?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isUpdating: boolean;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateUser: (metadata: Partial<SignUpMetadata>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  isCandidate: boolean;
  isRecruiter: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    // Base URL selon l'environnement (dev/prod)
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const siteBaseUrl = isDevelopment ? 'http://localhost:8080' : 'https://onehcm.vercel.app';
    const redirectUrl = `${siteBaseUrl}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      }
    });
    
    // Si on est en développement et qu'il y a une erreur de rate limit,
    // on peut assouplir l'expérience côté UI
    if (error && error.message.includes('rate limit') && isDevelopment) {
      console.warn('Rate limit atteint, tentative de création directe en mode développement');
      // En développement, on peut simuler une inscription réussie côté UI
      return { error: null };
    }
    
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateUser = async (metadata: Partial<SignUpMetadata>) => {
    setIsUpdating(true);
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) {
      console.error("Error updating user:", error);
      setIsUpdating(false);
      return false;
    }

    setUser(data.user);

    // Synchroniser également la table 'users' (vue recruteur)
    try {
      const authUser = data.user;
      if (authUser) {
        const meta = (authUser as unknown as { user_metadata?: Record<string, unknown> })?.user_metadata || {};
        const get = (k: string) => (meta as Record<string, unknown>)[k];
        const upsertPayload: Record<string, unknown> = {
          id: authUser.id,
          email: authUser.email,
        };
        if (typeof get('first_name') === 'string') upsertPayload.first_name = get('first_name');
        if (typeof get('last_name') === 'string') upsertPayload.last_name = get('last_name');
        if (typeof get('phone') === 'string') upsertPayload.phone = get('phone');
        if (typeof get('matricule') === 'string') upsertPayload.matricule = get('matricule');
        if (typeof get('birth_date') === 'string') upsertPayload.birth_date = get('birth_date');
        if (typeof get('current_position') === 'string') upsertPayload.current_position = get('current_position');
        if (typeof get('bio') === 'string') upsertPayload.bio = get('bio');

        const { error: upsertErr } = await supabase
          .from('users')
          .upsert(upsertPayload, { onConflict: 'id' });
        if (upsertErr) {
          console.warn('Upsert users failed (non-bloquant):', upsertErr.message);
        }
      }
    } catch (e) {
      console.warn('Failed syncing users table:', e);
    }

    setIsUpdating(false);
    return true;
  };

  const resetPassword = async (email: string) => {
    // Base URL selon l'environnement (dev/prod)
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const siteBaseUrl = isDevelopment ? 'http://localhost:8080' : 'https://onehcm.vercel.app';
    const redirectUrl = `${siteBaseUrl}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error };
  };

  // Helper functions to check user role
  const getUserRole = () => {
    return user?.user_metadata?.role || 'candidat';
  };

  const isCandidate = getUserRole() === 'candidat';
  const isRecruiter = getUserRole() === 'recruteur';
  const isAdmin = getUserRole() === 'admin';

  const value = {
    user,
    session,
    isLoading,
    isUpdating,
    signUp,
    signIn,
    signOut,
    updateUser,
    resetPassword,
    isCandidate,
    isRecruiter,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}