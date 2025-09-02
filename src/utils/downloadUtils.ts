import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: number;
  file_name: string;
  file_url: string;
  document_type: string;
  file_size?: number;
}

/**
 * Télécharge tous les documents d'un candidat en format ZIP
 * @param documents - Liste des documents du candidat
 * @param candidateName - Nom du candidat pour nommer le fichier ZIP
 * @returns Promise<void>
 */
export async function downloadCandidateDocumentsAsZip(
  documents: Document[],
  candidateName: string
): Promise<void> {
  if (!documents || documents.length === 0) {
    throw new Error('Aucun document à télécharger');
  }

  try {
    const zip = new JSZip();
    const downloadPromises: Promise<void>[] = [];

    // Fonction pour normaliser une URL de document
    const getFileUrl = (filePath: string): string => {
      if (!filePath) return '';
      if (filePath.startsWith('http')) return filePath;
      
      const { data } = supabase.storage
        .from('application-documents')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    };

    // Télécharger chaque document et l'ajouter au ZIP
    for (const doc of documents) {
      const promise = (async () => {
        try {
          const fileUrl = getFileUrl(doc.file_url);
          const response = await fetch(fileUrl);
          
          if (!response.ok) {
            console.warn(`Impossible de télécharger le document: ${doc.file_name}`);
            return;
          }

          const blob = await response.blob();
          
          // Créer un nom de fichier sécurisé
          const safeFileName = doc.file_name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const documentTypePrefix = doc.document_type ? `${doc.document_type}_` : '';
          const fileName = `${documentTypePrefix}${safeFileName}`;
          
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Erreur lors du téléchargement de ${doc.file_name}:`, error);
        }
      })();
      
      downloadPromises.push(promise);
    }

    // Attendre que tous les documents soient téléchargés
    await Promise.all(downloadPromises);

    // Générer le fichier ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Créer un nom de fichier sécurisé pour le ZIP
    const safeCandidateName = candidateName.replace(/[^a-zA-Z0-9.\-_\s]/g, '_');
    const zipFileName = `Dossier_de_candidature_${safeCandidateName}.zip`;

    // Télécharger le fichier ZIP
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = zipFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Nettoyer l'URL de l'objet
    URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error('Erreur lors de la création du fichier ZIP:', error);
    throw new Error('Impossible de créer le fichier ZIP des documents');
  }
}

/**
 * Formate la taille d'un fichier en format lisible
 * @param bytes - Taille en bytes
 * @returns string - Taille formatée
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Taille inconnue';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
