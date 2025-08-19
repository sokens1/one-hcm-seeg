import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: number;
  application_id: string;
  document_type: 'cv' | 'cover_letter' | 'diploma' | 'recommendation';
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
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!applicationId,
  });
}

export function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'cv': return 'Curriculum Vitae';
    case 'cover_letter': return 'Lettre de motivation';
    case 'diploma': return 'Diplôme';
    case 'recommendation': return 'Recommandation';
    default: return type;
  }
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Taille inconnue';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
