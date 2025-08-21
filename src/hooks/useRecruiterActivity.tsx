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

const fetchRecruiterActivity = async (recruiterId: string): Promise<Activity[]> => {
  if (!recruiterId) return [];

  const { data: activities, error } = await supabase.rpc(
    'get_recruiter_activity',
    { p_recruiter_id: recruiterId }
  );

  if (error) {
    console.error("Error fetching recruiter activity:", error);
    throw new Error("Could not fetch recruiter activity");
  }

  return (activities as any[]).map(a => ({
    id: a.id,
    type: a.type,
    description: a.description,
    created_at: a.created_at,
    job_title: a.job_title,
  }));
};

export function useRecruiterActivity() {
  const { user } = useAuth();

  return useQuery<Activity[], Error>({
    queryKey: ["recruiterActivity", user?.id],
    queryFn: () => fetchRecruiterActivity(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
