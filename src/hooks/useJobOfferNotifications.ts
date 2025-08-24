/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

type JobOfferRow = {
  id: string;
  title: string;
  location: string;
  contract_type: string;
  status: string;
};

type RealtimePayload = {
  new: JobOfferRow;
  old: JobOfferRow;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

/**
 * Subscribes to realtime inserts/updates on job_offers and notifies candidates
 * when a new offer is published (status becomes 'active'). Also invalidates
 * the React Query cache for ['jobOffers'] so lists refresh automatically.
 */
export function useJobOfferNotifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Debounce invalidations to prevent excessive refetching
    let invalidationTimeout: NodeJS.Timeout | null = null;
    
    const debouncedInvalidate = () => {
      if (invalidationTimeout) {
        clearTimeout(invalidationTimeout);
      }
      invalidationTimeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['jobOffers'] });
      }, 1000); // Wait 1 second before invalidating
    };

    // Subscribe to INSERT and UPDATE events on job_offers
    const channel = supabase
      .channel('job_offers_notifications')
      .on(
        'postgres_changes' as any,
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'job_offers' 
        },
        (payload: RealtimePayload) => {
          const row = payload.new;
          if (row?.status === 'active') {
            debouncedInvalidate();
            toast({
              title: "Nouvelle offre publiée",
              description: `${row.title} • ${row.location} (${row.contract_type})`,
            });
          }
        }
      )
      .on(
        'postgres_changes' as any,
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'job_offers' 
        },
        (payload: RealtimePayload) => {
          const prev = payload.old;
          const next = payload.new;
          // Notify only when a draft becomes active
          if (prev?.status !== 'active' && next?.status === 'active') {
            debouncedInvalidate();
            toast({
              title: "Offre publiée",
              description: `${next.title} • ${next.location} (${next.contract_type})`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (invalidationTimeout) {
        clearTimeout(invalidationTimeout);
      }
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
}
