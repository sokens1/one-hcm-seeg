/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@/types/application';
import { generateApplicationPdf } from './generateApplicationPdf';
import { supabase } from '@/integrations/supabase/client';

// Fonction ULTRA-AGRESSIVE pour nettoyer le texte corrompu et forcer la compatibilité PDF
const cleanText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  let cleaned = text;

  // 1. NETTOYAGE ULTRA-AGRESSIF des caractères corrompus spécifiques
  // Supprimer complètement les patterns comme '&& &R&e&n&s&e&i&g&n&é
  cleaned = cleaned.replace(/['`´][&]+/g, ''); // Supprimer '&, `&, ´&
  cleaned = cleaned.replace(/[&]+/g, '');      // Supprimer TOUS les &
  
  // 2. Nettoyer les entités HTML
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');
  
  // 3. Supprimer toutes les autres entités HTML
  cleaned = cleaned.replace(/&[a-zA-Z0-9#]+;/g, '');

  // 4. Remplacer les apostrophes typographiques par des apostrophes simples
  cleaned = cleaned
    .replace(/['']/g, "'")  // Apostrophes typographiques → apostrophe simple
    .replace(/[""]/g, '"')  // Guillemets typographiques → guillemets droits
    .replace(/…/g, '...')   // Points de suspension typographiques
    .replace(/–/g, '-')     // Tiret demi-cadratin
    .replace(/—/g, '-')     // Tiret cadratin
    .replace(/«/g, '"')     // Guillemets français
    .replace(/»/g, '"');    // Guillemets français

  // 5. NETTOYAGE FINAL - Supprimer tous les caractères problématiques restants
  cleaned = cleaned.replace(/[&]+/g, ''); // Supprimer tous les & restants
  
  // 6. Supprimer les guillemets simples en début/fin corrompus
  cleaned = cleaned.replace(/^['`´\s]+|['`´\s]+$/g, '');

  // 7. Normaliser les espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ');

  // 8. FORCER la conversion des caractères non-ASCII problématiques
  cleaned = cleaned.replace(/[^\x00-\x7F]/g, (char) => {
    // Table de conversion pour les caractères spéciaux courants
    const conversions: Record<string, string> = {
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a',
      'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
      'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
      'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
      'ç': 'c', 'ñ': 'n'
    };
    return conversions[char] || '';
  });

  return cleaned.trim();
};

// Fonction améliorée pour vérifier si un champ est rempli (gère les textes corrompus)
const isFieldFilled = (value: string | null | undefined): boolean => {
  if (!value) return false;
  
  // Nettoyer le texte avant de vérifier
  const cleaned = cleanText(value);
  
  // Debug log pour voir ce qui se passe
  console.log('🔍 [PDF DEBUG] isFieldFilled:', {
    original: value,
    cleaned: cleaned,
    length: cleaned.trim().length,
    isFilled: cleaned.trim().length > 0
  });
  
  // Vérifier si le texte nettoyé contient du contenu significatif
  return cleaned.trim().length > 0;
};

export const exportApplicationPdf = async (application: Application, jobTitle: string, offerStatus?: string) => {
  try {
    // Get user data from the application
    const user = application.users;
    const profile = user?.candidate_profiles;
    
    // Debug: Log all relevant data to identify gender issue
    // console.log('=== PDF Export Debug ===');
    // console.log('User data:', user);
    // console.log('Profile data:', profile);
    // console.log('Profile gender:', (profile as any)?.gender);
    // console.log('User date_of_birth:', user?.date_of_birth);
    // console.log('Profile birth_date:', (profile as any)?.birth_date);
    // console.log('User date_of_birth type:', typeof user?.date_of_birth);
    // console.log('Profile birth_date type:', typeof (profile as any)?.birth_date);
    // console.log('========================');
    
    // Fetch application documents
    const { data: documents, error: documentsError } = await supabase
      .from('application_documents')
      .select('document_type, file_name, file_url')
      .eq('application_id', application.id);

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
    }

    // Group documents by type
    const documentsByType = (documents || []).reduce((acc, doc) => {
      acc[doc.document_type] = acc[doc.document_type] || [];
      acc[doc.document_type].push(doc);
      return acc;
    }, {} as Record<string, Array<{ document_type: string; file_name: string; file_url: string }>>);
    
    // Get MTP answers - handle both array and object formats
    const mtpAnswers = application.mtp_answers || {};
    
    // Handle metier as array or object with numeric keys
    const metierArray = Array.isArray(mtpAnswers.metier) 
      ? mtpAnswers.metier 
      : mtpAnswers.metier 
        ? Object.values(mtpAnswers.metier).filter(Boolean) 
        : [];
        
    // Handle talent as array or object with numeric keys
    const talentArray = Array.isArray(mtpAnswers.talent)
      ? mtpAnswers.talent
      : mtpAnswers.talent
        ? Object.values(mtpAnswers.talent).filter(Boolean)
        : [];
        
    // Handle paradigme as array or object with numeric keys
    const paradigmeArray = Array.isArray(mtpAnswers.paradigme)
      ? mtpAnswers.paradigme
      : mtpAnswers.paradigme
        ? Object.values(mtpAnswers.paradigme).filter(Boolean)
        : [];
        
    // Extract answers with fallback to empty string and clean the text
    // IMPORTANT: Nettoyer AVANT de vérifier si c'est rempli
    const [metier1, metier2, metier3, metier4, metier5, metier6, metier7] = [
      ...metierArray.map(cleanText),
      ...Array(Math.max(0, 7 - metierArray.length)).fill('')
    ];
    
    const [talent1, talent2, talent3] = [
      ...talentArray.map(cleanText),
      ...Array(Math.max(0, 3 - talentArray.length)).fill('')
    ];
    
    const [paradigme1, paradigme2, paradigme3] = [
      ...paradigmeArray.map(cleanText),
      ...Array(Math.max(0, 3 - paradigmeArray.length)).fill('')
    ];
    
    // Convert Application to ApplicationData
    const applicationData = {
      // From Application
      id: application.id,
      created_at: application.created_at,
      status: application.status,
      metier1: metier1 || '',
      metier2: metier2 || '',
      metier3: metier3 || '',
      metier4: metier4 || '',
      metier5: metier5 || '',
      metier6: metier6 || '',
      metier7: metier7 || '',
      talent1: talent1 || '',
      talent2: talent2 || '',
      talent3: talent3 || '',
      paradigme1: paradigme1 || '',
      paradigme2: paradigme2 || '',
      paradigme3: paradigme3 || '',
      
      // Additional/transformed fields
      firstName: cleanText(user?.first_name) || '',
      lastName: cleanText(user?.last_name) || '',
      email: cleanText(user?.email) || '',
      dateOfBirth: user?.date_of_birth ? new Date(user.date_of_birth) : ((profile as any)?.birth_date ? new Date((profile as any).birth_date) : null),
      currentPosition: cleanText(profile?.current_position) || '',
      gender: cleanText((profile as any)?.gender || (user as { sexe?: string; gender?: string })?.sexe || (user as { sexe?: string; gender?: string })?.gender) || '',
      
      // Map documents from database
      cv: documentsByType.cv?.[0] ? { 
        name: documentsByType.cv[0].file_name,
        url: documentsByType.cv[0].file_url 
      } : null,
      coverLetter: documentsByType.cover_letter?.[0] ? { 
        name: documentsByType.cover_letter[0].file_name,
        url: documentsByType.cover_letter[0].file_url 
      } : null,
      integrityLetter: documentsByType.integrity_letter?.[0] ? { 
        name: documentsByType.integrity_letter[0].file_name,
        url: documentsByType.integrity_letter[0].file_url 
      } : null,
      projectIdea: documentsByType.project_idea?.[0] ? { 
        name: documentsByType.project_idea[0].file_name,
        url: documentsByType.project_idea[0].file_url 
      } : null,
      diplomas: (documentsByType.diploma || []).map(doc => ({ name: doc.file_name })),
      certificates: (documentsByType.certificate || []).map(doc => ({ name: doc.file_name })),
      recommendations: (documentsByType.recommendation || []).map(doc => ({ name: doc.file_name })),
      // Références de recommandation
      referenceFullName: cleanText(application.reference_full_name) || '',
      referenceEmail: cleanText(application.reference_email) || '',
      referenceContact: cleanText(application.reference_contact) || '',
      referenceCompany: cleanText(application.reference_company) || '',
      hasBeenManager: application.has_been_manager,
      
      // Debug: Log reference data
      ...(console.log('🔍 [PDF Export] Références:', {
        raw_full_name: application.reference_full_name,
        raw_email: application.reference_email,
        raw_contact: application.reference_contact,
        raw_company: application.reference_company,
        cleaned_full_name: cleanText(application.reference_full_name),
        cleaned_email: cleanText(application.reference_email),
        cleaned_contact: cleanText(application.reference_contact),
        cleaned_company: cleanText(application.reference_company)
      }), {}),
      jobTitle,
      applicationDate: new Date(application.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      offerStatus: offerStatus || null,
    };
    
    // console.log('Gender value passed to PDF generator:', applicationData.gender);
    // console.log('DateOfBirth value passed to PDF generator:', applicationData.dateOfBirth);
    
    const doc = generateApplicationPdf(applicationData);
    
    // Save the PDF
    doc.save(
      `Candidature_${jobTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    );
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
      metier6: metier6 || '',

      metier7: metier7 || '',

      talent1: talent1 || '',

      talent2: talent2 || '',

      talent3: talent3 || '',

      paradigme1: paradigme1 || '',

      paradigme2: paradigme2 || '',

      paradigme3: paradigme3 || '',

      

      // Additional/transformed fields

      firstName: cleanText(user?.first_name) || '',
      lastName: cleanText(user?.last_name) || '',
      email: cleanText(user?.email) || '',
      dateOfBirth: user?.date_of_birth ? new Date(user.date_of_birth) : ((profile as any)?.birth_date ? new Date((profile as any).birth_date) : null),

      currentPosition: cleanText(profile?.current_position) || '',
      gender: cleanText((profile as any)?.gender || (user as { sexe?: string; gender?: string })?.sexe || (user as { sexe?: string; gender?: string })?.gender) || '',
      

      // Map documents from database

      cv: documentsByType.cv?.[0] ? { 

        name: documentsByType.cv[0].file_name,

        url: documentsByType.cv[0].file_url 

      } : null,

      coverLetter: documentsByType.cover_letter?.[0] ? { 

        name: documentsByType.cover_letter[0].file_name,

        url: documentsByType.cover_letter[0].file_url 

      } : null,

      integrityLetter: documentsByType.integrity_letter?.[0] ? { 

        name: documentsByType.integrity_letter[0].file_name,

        url: documentsByType.integrity_letter[0].file_url 

      } : null,

      projectIdea: documentsByType.project_idea?.[0] ? { 

        name: documentsByType.project_idea[0].file_name,

        url: documentsByType.project_idea[0].file_url 

      } : null,

      diplomas: (documentsByType.diploma || []).map(doc => ({ name: doc.file_name })),

      certificates: (documentsByType.certificate || []).map(doc => ({ name: doc.file_name })),

      recommendations: (documentsByType.recommendation || []).map(doc => ({ name: doc.file_name })),

      // Références de recommandation

      referenceFullName: cleanText(application.reference_full_name) || '',
      referenceEmail: cleanText(application.reference_email) || '',
      referenceContact: cleanText(application.reference_contact) || '',
      referenceCompany: cleanText(application.reference_company) || '',
      
      // Debug: Log reference data
      ...(console.log('🔍 [PDF Export] Références:', {
        raw_full_name: application.reference_full_name,
        raw_email: application.reference_email,
        raw_contact: application.reference_contact,
        raw_company: application.reference_company,
        cleaned_full_name: cleanText(application.reference_full_name),
        cleaned_email: cleanText(application.reference_email),
        cleaned_contact: cleanText(application.reference_contact),
        cleaned_company: cleanText(application.reference_company)
      }), {}),
      jobTitle,

      applicationDate: new Date(application.created_at).toLocaleDateString('fr-FR', {

        year: 'numeric',

        month: 'long',

        day: 'numeric',

      }),

      offerStatus: offerStatus || null,
    };

    

    // console.log('Gender value passed to PDF generator:', applicationData.gender);

    // console.log('DateOfBirth value passed to PDF generator:', applicationData.dateOfBirth);

    

    const doc = generateApplicationPdf(applicationData);

    

    // Save the PDF

    doc.save(

      `Candidature_${jobTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

    );

    

    return true;

  } catch (error) {

    console.error('Error generating PDF:', error);

    return false;

  }

};
