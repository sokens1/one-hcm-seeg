import { Application } from '@/types/application';
import { generateApplicationPdf } from './generateApplicationPdf';
import { supabase } from '@/integrations/supabase/client';

export const exportApplicationPdf = async (application: Application, jobTitle: string) => {
  try {
    // Get user data from the application
    const user = application.users;
    const profile = user?.candidate_profiles;
    
    // Debug: Log all relevant data
    console.log('User data:', user);
    console.log('Profile data:', profile);
    console.log('Date of birth from user:', user?.date_of_birth);
    console.log('Date of birth from profile:', profile?.date_of_birth);
    console.log('Profile birth_date field:', profile?.birth_date);
    
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
        
    // Extract answers with fallback to empty string
    const [metier1, metier2, metier3, metier4, metier5, metier6, metier7] = [
      ...metierArray,
      ...Array(Math.max(0, 7 - metierArray.length)).fill('')
    ];
    
    const [talent1, talent2, talent3] = [
      ...talentArray,
      ...Array(Math.max(0, 3 - talentArray.length)).fill('')
    ];
    
    const [paradigme1, paradigme2, paradigme3] = [
      ...paradigmeArray,
      ...Array(Math.max(0, 3 - paradigmeArray.length)).fill('')
    ];
    
    // Convert Application to ApplicationData
    const applicationData = {
      // From Application
      id: application.id,
      created_at: application.created_at,
      status: application.status,
      gender: profile?.gender || '',
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
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      dateOfBirth: user?.date_of_birth ? new Date(user.date_of_birth) : (profile?.date_of_birth ? new Date(profile.date_of_birth) : (profile?.birth_date ? new Date(profile.birth_date) : null)),
      currentPosition: profile?.current_position || '',
      gender: profile?.gender || (user as any)?.sexe || (user as any)?.gender || '',
      
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
      jobTitle,
      applicationDate: new Date(application.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
    
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
