import { Application } from '@/types/application';
import { generateApplicationPdf } from './generateApplicationPdf';

export const exportApplicationPdf = (application: Application, jobTitle: string) => {
  try {
    // Get user data from the application
    const user = application.users;
    const profile = user?.candidate_profiles;
    
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
      cv: application.cv || null,
      certificates: application.certificates || [],
      recommendations: application.recommendations || [],
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
      dateOfBirth: user?.date_of_birth ? new Date(user.date_of_birth) : null,
      currentPosition: profile?.current_position || '',
      coverLetter: application.cover_letter ? { 
        name: 'Lettre de motivation', 
        url: application.cover_letter 
      } : null,
      integrityLetter: application.integrity_letter || null,
      projectIdea: application.project_idea || null,
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
