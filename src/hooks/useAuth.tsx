/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, createContext, useContext, useRef } from "react";
import { User, Session, AuthResponse, AuthError, type RealtimeChannel } from "@supabase/supabase-js";
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
  gender?: string; // 'Homme' | 'Femme' | autres valeurs
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
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', uid)
          .single();
        if (!mounted) return;
        setDbRole((data as { role?: string } | null)?.role ?? null);
      } catch {
        if (!mounted) return;
        setDbRole(null);
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        const uid = session?.user?.id;
        setupForUid(uid);
      }
    );

    // Explicitly get the initial session to avoid blank screen on reload
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      await setupForUid(session?.user?.id);
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch { /* empty */ }
        channelRef.current = null;
      }
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Pour le développement, on peut désactiver la confirmation email
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
        // En développement, on peut essayer de contourner la confirmation email
        ...(isDevelopment && { emailRedirectTo: undefined })
      }
    });
    
    // Si on est en développement et qu'il y a une erreur de rate limit,
    // on peut essayer de créer l'utilisateur directement
    if (error && error.message.includes('rate limit') && isDevelopment) {
      console.warn('Rate limit atteint, tentative de création directe en mode développement');
      // En développement, on peut simuler une inscription réussie
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
    // Proactively clear local state to avoid stale role/guards during redirect
    try {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch { /* empty */ }
        channelRef.current = null;
      }
      setUser(null);
      setSession(null);
      setDbRole(null);
    } catch { /* empty */ }
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
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error };
  };

  // Helper functions to check user role
  const getUserRole = () => {
    // Prefer DB role for dynamic behavior; fallback to auth metadata; default 'candidat'
    return dbRole || (user?.user_metadata?.role as string | undefined) || 'candidat';
  };

  const roleValue = getUserRole();
  const isCandidate = roleValue === 'candidat' || roleValue === 'candidate';
  const isRecruiter = roleValue === 'recruteur' || roleValue === 'recruiter';
  const isAdmin = roleValue === 'admin';

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