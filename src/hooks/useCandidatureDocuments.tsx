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
  // Normalize APIs that sometimes return `{ data: T }` and sometimes raw `T`
  const unwrap = <T,>(payload: T | { data: T } | null): T | null => {
    if (payload && typeof payload === "object" && "data" in (payload as object)) {
      return (payload as { data: T }).data;
    }
    return payload as T | null;
  };

  const uploadDocument = async (
    candidatureId: string,
    file: File,
    type?: string
  ): Promise<CandidatureDocument> => {
    const form = new FormData();
    form.append("fichier", file);
    if (type) form.append("type", type);
    const { data } = await api.post<CandidatureDocument | { data: CandidatureDocument } | null>(
      `/candidatures/${candidatureId}/documents`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return unwrap<CandidatureDocument>(data)!;
  };

  const listDocuments = async (candidatureId: string): Promise<CandidatureDocument[]> => {
    const { data } = await api.get<
      CandidatureDocument[] | { data: CandidatureDocument[] } | null
    >(`/candidatures/${candidatureId}/documents`);
    return unwrap<CandidatureDocument[]>(data) ?? [];
  };

  const downloadDocument = async (documentId: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/documents/${documentId}/download`, {
      responseType: "blob",
    });
    return data;
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  };

  return { uploadDocument, listDocuments, downloadDocument, deleteDocument };
}
