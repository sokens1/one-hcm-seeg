import { api } from "@/integrations/api/client";

export interface CandidatureDocument {
  id: string;
  candidature_id: string;
  type?: string | null; // cv | lettre | autre
  name?: string | null;
  path?: string | null;
  created_at: string;
}

export function useCandidatureDocuments() {
  const uploadDocument = async (
    candidatureId: string,
    file: File,
    type?: string
  ): Promise<CandidatureDocument> => {
    const form = new FormData();
    form.append("fichier", file);
    if (type) form.append("type", type);
    const { data } = await api.post(`/candidatures/${candidatureId}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return (data?.data || data) as CandidatureDocument;
  };

  const listDocuments = async (candidatureId: string): Promise<CandidatureDocument[]> => {
    const { data } = await api.get(`/candidatures/${candidatureId}/documents`);
    return (data?.data || data || []) as CandidatureDocument[];
  };

  const downloadDocument = async (documentId: string): Promise<Blob> => {
    const { data } = await api.get(`/documents/${documentId}/download`, { responseType: "blob" });
    return data as Blob;
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  };

  return { uploadDocument, listDocuments, downloadDocument, deleteDocument };
}
