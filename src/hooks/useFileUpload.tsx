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
    const { data } = supabase.storage
      .from('application-documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
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