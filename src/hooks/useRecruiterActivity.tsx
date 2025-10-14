/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Activity {
  id: string;
  type: "new_application" | "interview_scheduled" | "offer_published" | "status_change";
  description: string;
  created_at: string;
  job_title: string;
}

const fetchRecruiterActivity = async (userId: string): Promise<Activity[]> => {
  if (!userId) return [];

  // Use the RPC function with required pagination params (see migrations 20250827*)
  const { data: activities, error } = await supabase.rpc('get_recruiter_activities', {
    p_limit: 5,
    p_offset: 0,
  });

  if (error) {
    console.error("Error fetching activities:", error);
    throw new Error("Could not fetch activities");
  }

  // Transform the RPC result into the Activity format
  return (activities || []).map((activity: any) => ({
    id: activity.id,
    type: (activity.activity_type === 'application' ? 'new_application' : 'status_change') as Activity['type'],
    description: activity.description,
    created_at: activity.created_at,
    job_title: activity.job_title,
  }));
};

export function useRecruiterActivity() {
  const { user } = useAuth();

  return useQuery<Activity[], Error>({
    queryKey: ["recruiterActivity", user?.id],
    queryFn: () => fetchRecruiterActivity(user!.id),
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // Les données restent fraîches pendant 3 minutes
    refetchInterval: 3 * 60 * 1000, // Auto-refresh toutes les 3 minutes au lieu de 1 minute
    refetchIntervalInBackground: false, // Ne pas rafraîchir en arrière-plan pour économiser des ressources
    refetchOnWindowFocus: true, // Rafraîchir quand l'utilisateur revient sur la page
  });
}
