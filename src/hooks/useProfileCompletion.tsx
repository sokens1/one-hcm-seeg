import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
  message: string;
}

export function useProfileCompletion() {
  const { user } = useAuth();
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    isComplete: true,
    missingFields: [],
    completionPercentage: 100,
    message: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkProfileCompletion = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Récupérer les données utilisateur et profil
      const [{ data: userData }, { data: profileData }] = await Promise.all([
        supabase
          .from('users')
          .select('phone')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('candidate_profiles')
          .select('gender, current_position, years_experience, address, birth_date')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      const missingFields: string[] = [];
      
      // Vérifier les champs obligatoires
      if (!userData?.phone) missingFields.push('téléphone');
      if (!profileData?.birth_date) missingFields.push('date de naissance');
      
      if (!profileData?.gender || profileData.gender === 'Non renseigné') {
        missingFields.push('sexe');
      }
      if (!profileData?.current_position || profileData.current_position === 'Non renseigné') {
        missingFields.push('poste actuel');
      }
      if (!profileData?.address) missingFields.push('adresse');

      const totalFields = 5; // phone, birth_date, gender, current_position, address
      const completedFields = totalFields - missingFields.length;
      const completionPercentage = Math.round((completedFields / totalFields) * 100);

      const isComplete = missingFields.length === 0;
      
      let message = '';
      if (!isComplete) {
        if (missingFields.length === 1) {
          message = `Il vous manque ${missingFields[0]} pour compléter votre profil.`;
        } else if (missingFields.length === 2) {
          message = `Il vous manque ${missingFields[0]} et ${missingFields[1]} pour compléter votre profil.`;
        } else {
          const lastField = missingFields.pop();
          message = `Il vous manque ${missingFields.join(', ')} et ${lastField} pour compléter votre profil.`;
        }
      }

      setStatus({
        isComplete,
        missingFields,
        completionPercentage,
        message
      });

    } catch (error) {
      console.error('Erreur lors de la vérification du profil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkProfileCompletion();
  }, [user?.id, checkProfileCompletion]);

  return { status, isLoading, refetch: () => checkProfileCompletion() };
}
