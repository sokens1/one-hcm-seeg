import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useJobCount() {
  return useQuery({
    queryKey: ['jobCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('job_offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
