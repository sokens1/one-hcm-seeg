/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Activity {
  id: string;
  type: "new_application" | "interview_scheduled" | "offer_published";
  description: string;
  created_at: string;
  job_title: string;
}

const fetchRecruiterActivity = async (userId: string): Promise<Activity[]> => {
  if (!userId) return [];

  // Use the RPC function to get all recent activities, bypassing RLS.
  const { data: activities, error } = await supabase.rpc('get_recruiter_activities');

  if (error) {
    console.error("Error fetching activities:", error);
    throw new Error("Could not fetch activities");
  }

  // Transform the RPC result into the Activity format
  return (activities || []).slice(0, 5).map((activity: any) => ({
    id: activity.id,
    type: "new_application" as const, // Assuming all activities are new applications for now
    description: `Nouvelle candidature de ${activity.candidate_name}`,
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
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    refetchIntervalInBackground: true, // Continue refreshing in background
  });
}
