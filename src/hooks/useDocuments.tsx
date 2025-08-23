import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Document {
  id: number;
  application_id: string;
  document_type: 'cv' | 'cover_letter' | 'diploma' | 'recommendation' | 'integrity_letter' | 'project_idea';
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
}

export function useApplicationDocuments(applicationId: string | undefined) {
  return useQuery<Document[], Error>({
    queryKey: ['documents', applicationId],
    queryFn: async () => {
      if (!applicationId) return [];

      console.log('[DOCUMENTS DEBUG] Fetching for applicationId:', applicationId);
      
      // Vérifier le token JWT actuel et les claims
      const { data: { user } } = await supabase.auth.getUser();
      const session = await supabase.auth.getSession();
      console.log('[DOCUMENTS DEBUG] Current user:', user?.id);
      const jwtClaims = session.data.session?.access_token ? JSON.parse(atob(session.data.session.access_token.split('.')[1])) : 'No token';
      console.log('[DOCUMENTS DEBUG] JWT claims user_role:', jwtClaims?.user_role || 'MISSING');
      console.log('[DOCUMENTS DEBUG] Full JWT claims:', jwtClaims);

      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId);

      console.log('[DOCUMENTS DEBUG] Query result data:', data);
      console.log('[DOCUMENTS DEBUG] Query result error:', error);
      console.log('[DOCUMENTS DEBUG] Documents count:', data?.length || 0);
      
      if (error) {
        console.log('[DOCUMENTS DEBUG] Error details:', error.code, error.message, error.details);
      }

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!applicationId,
  });
}

// Tous les documents d'un candidat (via ses candidatures)
export function useCandidateDocuments() {
  const { user } = useAuth();
  return useQuery<Document[], Error>({
    queryKey: ['candidate-documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Récupérer les IDs des candidatures du candidat
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select('id')
        .eq('candidate_id', user.id);
      if (appsError) throw new Error(appsError.message);
      const appIds = (apps || []).map(a => a.id);
      if (appIds.length === 0) return [];

      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .in('application_id', appIds)
        .order('uploaded_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });
}

export function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'cv': return 'CV';
    case 'cover_letter': return 'Lettre de motivation';
    case 'diploma': return 'Certificat';
    case 'recommendation': return 'Lettre de recommandation';
    case 'integrity_letter': return 'Lettre d\'intégrité professionnelle';
    case 'project_idea': return 'Idée de projet';
    default: return type;
  }
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Taille inconnue';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
