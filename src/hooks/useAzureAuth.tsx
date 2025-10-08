/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, createContext, useContext } from "react";
import { azureApiClient, SignupData, LoginData, UserResponse } from "@/integrations/api/azureClient";
import { supabase } from "@/integrations/supabase/client";

export interface AzureSignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  matricule: string;
  dateOfBirth: string;
  sexe: string;
  adresse: string;
  candidateStatus: "interne" | "externe";
  noSeegEmail: boolean;
}

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
  signUp: (data: AzureSignUpData) => Promise<{ error: string | null; success: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; success: boolean; user?: UserResponse }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  verifyMatricule: (matricule: string) => Promise<boolean>;
}

const AzureAuthContext = createContext<AuthContextType | undefined>(undefined);

export function AzureAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Vérifier si l'utilisateur est déjà connecté (depuis localStorage ou session)
  useEffect(() => {
    const savedUser = localStorage.getItem('azure_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        localStorage.removeItem('azure_user');
      }
    }
  }, []);

  const signUp = async (data: AzureSignUpData): Promise<{ error: string | null; success: boolean }> => {
    setIsUpdating(true);
    try {
      // Validation des données
      if (data.password !== data.confirmPassword) {
        return { error: 'Les mots de passe ne correspondent pas', success: false };
      }

      if (data.password.length < 6) {
        return { error: 'Le mot de passe doit contenir au moins 6 caractères', success: false };
      }

      // Préparation des données pour l'API
      const signupData: SignupData = {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        sexe: data.sexe as 'M' | 'F',
        matricule: data.candidateStatus === "interne" && data.matricule ? parseInt(data.matricule) : undefined,
        adresse: data.adresse || undefined,
      };

      const response = await azureApiClient.signup(signupData);
      
      // Sauvegarder l'utilisateur
      setUser(response);
      localStorage.setItem('azure_user', JSON.stringify(response));
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return { 
        error: error.message || 'Une erreur est survenue lors de l\'inscription', 
        success: false 
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null; success: boolean; user?: UserResponse }> => {
    setIsUpdating(true);
    try {
      const loginData: LoginData = { email, password };
      const response = await azureApiClient.login(loginData);
      
      // Sauvegarder l'utilisateur
      setUser(response);
      localStorage.setItem('azure_user', JSON.stringify(response));
      
      return { error: null, success: true, user: response };
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      return { 
        error: error.message || 'Email ou mot de passe incorrect', 
        success: false 
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const signOut = async (): Promise<{ error: string | null }> => {
    try {
      setUser(null);
      localStorage.removeItem('azure_user');
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Erreur lors de la déconnexion' };
    }
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    setIsUpdating(true);
    try {
      // Pour l'instant, utiliser Supabase pour la réinitialisation du mot de passe
      // car cette fonctionnalité n'est pas encore disponible dans l'API Azure
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Erreur lors de la réinitialisation du mot de passe' };
    } finally {
      setIsUpdating(false);
    }
  };

  const verifyMatricule = async (matricule: string): Promise<boolean> => {
    if (!matricule || isNaN(parseInt(matricule))) {
      return false;
    }
    
    try {
      return await azureApiClient.verifyMatricule(parseInt(matricule));
    } catch (error) {
      console.error('Erreur lors de la vérification du matricule:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isUpdating,
    signUp,
    signIn,
    signOut,
    resetPassword,
    verifyMatricule,
  };

  return (
    <AzureAuthContext.Provider value={value}>
      {children}
    </AzureAuthContext.Provider>
  );
}

export function useAzureAuth() {
  const context = useContext(AzureAuthContext);
  if (context === undefined) {
    throw new Error('useAzureAuth must be used within an AzureAuthProvider');
  }
  return context;
}
