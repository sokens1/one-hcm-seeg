import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Document {
  id: number;
  application_id: string;
  document_type: 'cv' | 'cover_letter' | 'diploma' | 'additional_certificate' | 'recommendation' | 'integrity_letter' | 'project_idea';
  file_name: string;
  file_url: string; // Corrigé: utilise file_url au lieu de file_path
  file_size: number | null;
  uploaded_at: string;
}

export function useApplicationDocuments(applicationId: string | undefined) {
  return useQuery<Document[], Error>({
    queryKey: ['documents', applicationId],
    queryFn: async () => {
      if (!applicationId) return [];

      // 1) Récupérer les enregistrements de documents
      const { data: documents, error } = await supabase
        .from('application_documents')
        .select('id, application_id, document_type, file_name, file_url, file_size, uploaded_at')
        .eq('application_id', applicationId);

      if (error) {
        console.error('Error fetching document records:', error);
        throw error;
      }

      if (!documents || documents.length === 0) return [];

      // Utiliser directement les URLs publiques stockées en DB
      // Plus besoin d'appel RPC car les URLs sont déjà correctes
      return documents;
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
    case 'diploma': return 'Diplôme';
    case 'additional_certificate': return 'Certificat supplémentaire';
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
