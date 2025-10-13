import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UploadedFile {
  path: string;
  name: string;
  size: number;
  type: string;
}

export function useFileUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File, folder: string = "documents"): Promise<UploadedFile> => {
    if (!user) throw new Error("User not authenticated");

    // Validation stricte PDF - double vérification
    const isValidPDF = file.type === 'application/pdf' || 
                      file.name.toLowerCase().endsWith('.pdf');
    
    if (!isValidPDF) {
      throw new Error("Seuls les fichiers PDF sont acceptés pour les candidatures. Veuillez convertir votre fichier au format PDF.");
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('application-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      return {
        path: data.path,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: File[], folder: string = "documents"): Promise<UploadedFile[]> => {
    // Validation PDF pour tous les fichiers
    const invalidFiles = files.filter(file => 
      !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
    );
    
    if (invalidFiles.length > 0) {
      throw new Error(`Seuls les fichiers PDF sont acceptés. ${invalidFiles.length} fichier(s) invalide(s) détecté(s).`);
    }

    const uploadPromises = files.map(file => uploadFile(file, folder));
    return Promise.all(uploadPromises);
  };

  const deleteFile = async (filePath: string): Promise<void> => {
    const { error } = await supabase.storage
      .from('application-documents')
      .remove([filePath]);

    if (error) throw error;
  };

  const getFileUrl = (filePath: string): string => {
    // Les URLs sont déjà complètes, les retourner directement
    return filePath;
  };

  const downloadFile = async (filePath: string): Promise<Blob> => {
    const { data, error } = await supabase.storage
      .from('application-documents')
      .download(filePath);

    if (error) throw error;
    return data;
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFileUrl,
    downloadFile,
    isUploading,
    uploadProgress
  };
}