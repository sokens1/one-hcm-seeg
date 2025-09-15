/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ApplicationDraftData {
  form_data: Record<string, any>;
  ui_state: {
    currentStep?: number;
    activeTab?: string;
    completedSections?: string[];
    lastActiveField?: string;
  };
}

export interface UseApplicationDraftReturn {
  // État du brouillon
  draftData: ApplicationDraftData | null;
  isDraftLoaded: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Actions
  saveDraft: (formData: Record<string, any>, uiState?: Record<string, any>) => Promise<void>;
  loadDraft: () => Promise<ApplicationDraftData | null>;
  clearDraft: () => Promise<void>;
  
  // Auto-save
  enableAutoSave: (formData: Record<string, any>, uiState?: Record<string, any>) => void;
  disableAutoSave: () => void;
}

const AUTO_SAVE_INTERVAL = 15000; // 15 secondes

// IMPORTANT: Les brouillons n'ont AUCUNE limite de temps
// Ils restent sauvegardés indéfiniment jusqu'à suppression manuelle
// ou soumission complète de la candidature

export function useApplicationDraft(jobOfferId: string): UseApplicationDraftReturn {
  const { user } = useAuth();
  const [draftData, setDraftData] = useState<ApplicationDraftData | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFormDataRef = useRef<string>('');
  const lastUiStateRef = useRef<string>('');

  // Charger le brouillon au montage du composant
  useEffect(() => {
    if (user && jobOfferId) {
      loadDraft();
    }
  }, [user, jobOfferId]);

  // Nettoyer l'auto-save au démontage
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  const loadDraft = useCallback(async (): Promise<ApplicationDraftData | null> => {
    if (!user || !jobOfferId) return null;

    try {
      const { data, error } = await supabase
        .from('application_drafts')
        .select('form_data, ui_state, updated_at')
        .eq('user_id', user.id)
        .eq('job_offer_id', jobOfferId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Pas d'erreur si aucun brouillon trouvé
          console.error('Error loading draft:', error);
        }
        setDraftData(null);
        setIsDraftLoaded(true);
        return null;
      }

      const draftData: ApplicationDraftData = {
        form_data: data.form_data || {},
        ui_state: data.ui_state || {}
      };

      setDraftData(draftData);
      setLastSaved(new Date(data.updated_at));
      setIsDraftLoaded(true);
      
      // console.log('📄 Brouillon chargé:', draftData);
      return draftData;
    } catch (error) {
      console.error('Error loading draft:', error);
      setDraftData(null);
      setIsDraftLoaded(true);
      return null;
    }
  }, [user, jobOfferId]);

  const saveDraft = useCallback(async (formData: Record<string, any>, uiState: Record<string, any> = {}): Promise<void> => {
    if (!user || !jobOfferId) return;

    // Éviter les sauvegardes inutiles
    const formDataStr = JSON.stringify(formData);
    const uiStateStr = JSON.stringify(uiState);
    
    if (formDataStr === lastFormDataRef.current && uiStateStr === lastUiStateRef.current) {
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('application_drafts')
        .upsert({
          user_id: user.id,
          job_offer_id: jobOfferId,
          form_data: formData,
          ui_state: uiState,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving draft:', error);
        toast.error('Erreur lors de la sauvegarde du brouillon');
        return;
      }

      const newDraftData: ApplicationDraftData = {
        form_data: formData,
        ui_state: uiState
      };

      setDraftData(newDraftData);
      setLastSaved(new Date());
      lastFormDataRef.current = formDataStr;
      lastUiStateRef.current = uiStateStr;

      // console.log('💾 Brouillon sauvegardé:', newDraftData);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Erreur lors de la sauvegarde du brouillon');
    } finally {
      setIsSaving(false);
    }
  }, [user, jobOfferId]);

  const clearDraft = useCallback(async (): Promise<void> => {
    if (!user || !jobOfferId) return;

    try {
      const { error } = await supabase
        .from('application_drafts')
        .delete()
        .eq('user_id', user.id)
        .eq('job_offer_id', jobOfferId);

      if (error) {
        console.error('Error clearing draft:', error);
        return;
      }

      setDraftData(null);
      setLastSaved(null);
      lastFormDataRef.current = '';
      lastUiStateRef.current = '';

      // console.log('🗑️ Brouillon supprimé');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [user, jobOfferId]);

  const enableAutoSave = useCallback((formData: Record<string, any>, uiState: Record<string, any> = {}) => {
    // Nettoyer l'ancien intervalle s'il existe
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // Créer un nouvel intervalle
    autoSaveIntervalRef.current = setInterval(() => {
      saveDraft(formData, uiState);
    }, AUTO_SAVE_INTERVAL);

    // console.log('⏰ Auto-save activé (toutes les 15 secondes)');
  }, [saveDraft]);

  const disableAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
      // console.log('⏰ Auto-save désactivé');
    }
  }, []);

  return {
    // État
    draftData,
    isDraftLoaded,
    isSaving,
    lastSaved,
    
    // Actions
    saveDraft,
    loadDraft,
    clearDraft,
    
    // Auto-save
    enableAutoSave,
    disableAutoSave
  };
}
