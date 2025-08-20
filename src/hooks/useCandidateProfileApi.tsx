import { useState, useCallback, useEffect } from "react";
import { api } from "@/integrations/api/client";

export interface CandidateProfile {
  id: string;
  email: string;
  prenom?: string;
  nom?: string;
  telephone?: string | null;
  adresse?: string | null;
  cv_url?: string | null;
}

const PROFILE_ENDPOINT = "/candidat/profil";

// API can return either the profile directly or wrapped in { data: ... }
type ProfileResponse = CandidateProfile | { data: CandidateProfile | null } | null;

export function useCandidateProfileApi() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<ProfileResponse>(PROFILE_ENDPOINT);
      const extracted =
        data && typeof data === "object" && "data" in data
          ? (data as { data: CandidateProfile | null }).data
          : (data as CandidateProfile | null);
      setProfile(extracted ?? null);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (payload: Partial<{
    telephone: string;
    adresse: string;
    cv_url: string;
  }>) => {
    const { data } = await api.put<ProfileResponse>(PROFILE_ENDPOINT, payload);
    await fetchProfile();
    return data;
  };

  return { profile, isLoading, error, refetch: fetchProfile, updateProfile };
}
