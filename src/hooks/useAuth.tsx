/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, createContext, useContext, useRef } from "react";
import { User, Session, AuthResponse, AuthError, type RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface SignUpMetadata {
  role: "candidat" | "recruteur" | "admin" | "observateur";
  first_name?: string;
  last_name?: string;
  phone?: string;
  matricule?: string;
  birth_date?: string;
  current_position?: string;
  bio?: string;
  gender?: string; // 'Homme' | 'Femme' | autres valeurs
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isRoleLoading: boolean;
  isUpdating: boolean;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateUser: (metadata: Partial<SignUpMetadata>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  isCandidate: boolean;
  isRecruiter: boolean;
  isAdmin: boolean;
  isObserver: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [dbRole, setDbRole] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupForUid = async (uid: string | undefined | null) => {
      if (!uid) {
        setDbRole(null);
        return;
      }
      // Remove previous channel if any
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch { /* empty */ }
        channelRef.current = null;
      }
      try {
        setIsRoleLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', uid)
          .single();
        if (!mounted) return;
        
        if (error) {
          console.warn('Failed to fetch user role:', error.message);
          setDbRole(null);
        } else {
          setDbRole((data as { role?: string } | null)?.role ?? null);
        }
      } catch (err) {
        if (!mounted) return;
        console.warn('Error fetching user role:', err);
        setDbRole(null);
      } finally {
        if (mounted) {
          setIsRoleLoading(false);
        }
      }
      // Realtime subscription on own row
      const channel = supabase.channel(`users-role-${uid}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${uid}`,
        }, (payload) => {
          const nextRole = (payload as any)?.new?.role as string | undefined;
          if (typeof nextRole === 'string') setDbRole(nextRole);
        })
        .subscribe();
      channelRef.current = channel;
    };

    // Keep track of current user ID to avoid unnecessary updates
    let currentUserIdRef = user?.id;
    
    // Set up auth state listener - with stability check to avoid unnecessary re-renders
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        const newUserId = session?.user?.id;
        
        // Skip redundant updates during focus changes that don't change user
        if (event === 'TOKEN_REFRESHED' && newUserId === currentUserIdRef) {
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        currentUserIdRef = newUserId;
        
        // Always setup role for new sessions, but avoid redundant calls
        setupForUid(newUserId);
      }
    );

    // Explicitly get the initial session to avoid blank screen on reload
    (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session retrieval error:', error);
          // Si le refresh token est invalide, nettoyer le state
          if (error.message?.includes('refresh_token_not_found') || error.message?.includes('Invalid Refresh Token')) {
            if (mounted) {
              setUser(null);
              setSession(null);
              setDbRole(null);
              setIsLoading(false);
              setIsRoleLoading(false);
            }
            return;
          }
        }
        
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        await setupForUid(session?.user?.id);
        setIsLoading(false);
      } catch (sessionError) {
        console.warn('Session setup error:', sessionError);
        if (mounted) {
          setUser(null);
          setSession(null);
          setDbRole(null);
          setIsLoading(false);
          setIsRoleLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch { /* empty */ }
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  // Remove this redundant useEffect as role is already fetched in the main effect above

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    // Désactivation de l'email de confirmation côté client: ne pas fournir emailRedirectTo
    // Pour une désactivation complète, configurer Supabase (Auth -> Email -> désactiver "Confirm email").
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
    try {
      // Clear local state first to ensure immediate UI update
      setUser(null);
      setSession(null);
      setDbRole(null);
      setIsLoading(false);
      setIsRoleLoading(false);
      
      // Clean up realtime channel
      if (channelRef.current) {
        try { 
          supabase.removeChannel(channelRef.current); 
        } catch { 
          /* empty */ 
        }
        channelRef.current = null;
      }
      
      // Clear any cached data first
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('supabase.auth.token');
        // Clear all supabase related storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Then perform the actual sign out - ignore errors as we've already cleared local state
      try {
        await supabase.auth.signOut({ scope: 'local' }); // Use local scope to avoid 403 errors
      } catch (signOutError) {
        console.warn('Sign out error (non-blocking):', signOutError);
        // Don't return error as local state is already cleared
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign out:', error);
      return { error: error as AuthError };
    }
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
        // Map auth metadata birth_date -> users.date_of_birth (DB column)
        if (typeof get('birth_date') === 'string') upsertPayload.date_of_birth = get('birth_date');
        if (typeof get('current_position') === 'string') upsertPayload.current_position = get('current_position');
        if (typeof get('bio') === 'string') upsertPayload.bio = get('bio');
        // Facultatif: si 'gender' existe aussi côté users (probablement non), on pourrait le mapper ici

        // IMPORTANT: do not change role from frontend. Only update non-role fields.
        // Also, avoid creating the row here to prevent default role from being applied.
        const { error: updateErr } = await supabase
          .from('users')
          .update(upsertPayload)
          .eq('id', authUser.id);
        if (updateErr) {
          console.warn('Update users failed (non-bloquant):', updateErr.message);
        }
      }
    } catch (e) {
      console.warn('Failed syncing users table:', e);
    }

    // Synchroniser le profil candidat (pour les stats genre et infos profil)
    try {
      const authUser = data.user;
      if (authUser) {
        const meta = (authUser as unknown as { user_metadata?: Record<string, unknown> })?.user_metadata || {};
        const get = (k: string) => (meta as Record<string, unknown>)[k];
        const upsertProfile: Record<string, unknown> = { user_id: authUser.id };
        if (typeof get('gender') === 'string') upsertProfile.gender = get('gender');
        if (typeof get('phone') === 'string') upsertProfile.phone = get('phone');
        if (typeof get('birth_date') === 'string') upsertProfile.birth_date = get('birth_date');
        if (typeof get('current_position') === 'string') upsertProfile.current_position = get('current_position');

        // N'upsert que si au moins un champ utile est présent
        const hasUseful = Object.keys(upsertProfile).length > 1;
        if (hasUseful) {
          const { error: cpErr } = await supabase
            .from('candidate_profiles')
            .upsert(upsertProfile, { onConflict: 'user_id' });
          if (cpErr) {
            console.warn('Upsert candidate_profiles failed (non-bloquant):', cpErr.message);
          }
        }
      }
    } catch (e) {
      console.warn('Failed syncing candidate_profiles:', e);
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

  // Helper functions to check user role (normalize FR/EN + admin)
  const getUserRole = () => {
    // Prefer DB role for dynamic behavior; fallback to auth metadata; default 'candidat'
    return dbRole || (user?.user_metadata?.role as string | undefined) || 'candidat';
  };

  const roleValue = getUserRole();
  const isCandidate = roleValue === 'candidat' || roleValue === 'candidate';
  const isRecruiter = roleValue === 'recruteur' || roleValue === 'recruiter';
  const isAdmin = roleValue === 'admin';
  const isObserver = roleValue === 'observateur' || roleValue === 'observer';

  const value = {
    user,
    session,
    isLoading,
    isRoleLoading,
    isUpdating,
    signUp,
    signIn,
    signOut,
    updateUser,
    resetPassword,
    isCandidate,
    isRecruiter,
    isAdmin,
    isObserver
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
    // En mode développement/test, fournir des valeurs par défaut pour éviter les crashes
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.warn('useAuth called outside AuthProvider, returning default values');
      return {
        user: null,
        session: null,
        isLoading: false,
        isRoleLoading: false,
        isUpdating: false,
        signUp: async () => ({ error: null }),
        signIn: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        updateUser: async () => false,
        resetPassword: async () => ({ error: null }),
        isCandidate: false,
        isRecruiter: false,
        isAdmin: false,
        isObserver: false,
      } as AuthContextType;
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}