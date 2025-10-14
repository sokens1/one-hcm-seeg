import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook centralisé pour gérer les subscriptions en temps réel des access_requests
 * Cela évite de créer plusieurs canaux en temps réel pour la même table
 */
export function useAccessRequestsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Créer un seul canal pour toute l'application
    const channel = supabase
      .channel('access_requests_global')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'access_requests',
      }, () => {
        // Invalider toutes les requêtes liées aux access_requests
        queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
        queryClient.invalidateQueries({ queryKey: ['pendingAccessRequests'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

