import { Application } from '@/types/application';
import { generateApplicationPdf } from './generateApplicationPdf';

export const exportApplicationPdf = (application: Application, jobTitle: string) => {
  try {
    // Get user data from the application
    const user = application.users;
    const profile = user?.candidate_profiles;
    
    // Get MTP answers
    const mtpAnswers = application.mtp_answers || {};
    const [metier1, metier2, metier3] = mtpAnswers.metier || [];
    const [talent1, talent2, talent3] = mtpAnswers.talent || [];
    const [paradigme1, paradigme2, paradigme3] = mtpAnswers.paradigme || [];
    
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
      metier1,
      metier2,
      metier3,
      talent1,
      talent2,
      talent3,
      paradigme1,
      paradigme2,
      paradigme3,
      
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
