/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';
import { generateSynthesisPdf } from './generateSynthesisPdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Protocol1Data {
  id: string;
  application_id: string;
  evaluator_id: string;
  documents_verified: boolean;
  adherence_metier: boolean;
  adherence_talent: boolean;
  adherence_paradigme: boolean;
  metier_notes: string | null;
  talent_notes: string | null;
  paradigme_notes: string | null;
  overall_score: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  cv_score: number;
  cv_comments: string | null;
  lettre_motivation_score: number;
  lettre_motivation_comments: string | null;
  diplomes_certificats_score: number;
  diplomes_certificats_comments: string | null;
  metier_score: number;
  metier_comments: string | null;
  talent_score: number;
  talent_comments: string | null;
  paradigme_score: number;
  paradigme_comments: string | null;
  interview_date: string | null;
  interview_metier_score: number;
  interview_metier_comments: string | null;
  interview_talent_score: number;
  interview_talent_comments: string | null;
  interview_paradigme_score: number;
  interview_paradigme_comments: string | null;
  gap_competence_score: number;
  gap_competence_comments: string | null;
  general_summary: string | null;
  documentary_score: number;
  mtp_score: number;
  interview_score: number;
  total_score: number;
  status: string;
}

interface Protocol2Data {
  id: string;
  application_id: string;
  evaluator_id: string;
  physical_visit: boolean;
  interview_completed: boolean;
  qcm_role_completed: boolean;
  qcm_codir_completed: boolean;
  job_sheet_created: boolean;
  skills_gap_assessed: boolean;
  interview_notes: string | null;
  visit_notes: string | null;
  qcm_role_score: number;
  qcm_codir_score: number;
  skills_gap_notes: string | null;
  overall_score: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  simulation_date: string | null;
  simulation_time: string | null;
  simulation_scheduled_at: string | null;
  analyse_competences_score: number;
  analyse_competences_comments: string | null;
  fiche_kcis_comments: string | null;
  fiche_kcis_score: number;
  fiche_kpis_score: number;
  fiche_kpis_comments: string | null;
  fiche_kris_score: number;
  fiche_kris_comments: string | null;
  gap_competences_score: number;
  gap_competences_comments: string | null;
}

interface CandidateData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
}

interface SynthesisData {
  protocol1: Protocol1Data | null;
  protocol2: Protocol2Data | null;
  candidate: CandidateData;
  globalScore: number;
  finalStatus: string;
  pointsForts: string;
  pointsAmelioration: string;
  conclusion?: string;
}

export const exportSynthesisPdf = async (
  applicationId: string,
  candidateName: string,
  jobTitle: string,
  globalScore: number,
  finalStatus: string,
  pointsForts: string,
  pointsAmelioration: string,
  conclusion?: string
) => {
  try {
    console.log('=== PDF Synthesis Export Debug ===');
    console.log('Application ID:', applicationId);
    console.log('Candidate Name:', candidateName);
    console.log('Job Title:', jobTitle);
    console.log('Global Score:', globalScore);
    console.log('Final Status:', finalStatus);
    console.log('===================================');

    // Récupérer les données du candidat
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        job_offers!applications_job_offer_id_fkey(title),
        users!applications_candidate_id_fkey(
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', applicationId)
      .single();

    if (applicationError) {
      console.error('Error fetching application:', applicationError);
      throw new Error('Impossible de récupérer les données de candidature');
    }

    // Récupérer les données du protocole 1
    const { data: protocol1Data, error: protocol1Error } = await supabase
      .from('protocol1_evaluations')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (protocol1Error && protocol1Error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching protocol1 data:', protocol1Error);
      // Ne pas bloquer si le protocole 1 n'existe pas
    }

    // Récupérer les données du protocole 2
    const { data: protocol2Data, error: protocol2Error } = await supabase
      .from('protocol2_evaluations')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (protocol2Error && protocol2Error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching protocol2 data:', protocol2Error);
      // Ne pas bloquer si le protocole 2 n'existe pas
    }

    // Construire les données du candidat
    const candidate: CandidateData = {
      firstName: application.users?.first_name || candidateName.split(' ')[0] || '',
      lastName: application.users?.last_name || candidateName.split(' ').slice(1).join(' ') || '',
      email: application.users?.email || '',
      jobTitle: application.job_offers?.title || jobTitle
    };

    // Construire les données de synthèse
    const synthesisData: SynthesisData = {
      protocol1: protocol1Data || null,
      protocol2: protocol2Data || null,
      candidate,
      globalScore,
      finalStatus,
      pointsForts,
      pointsAmelioration,
      conclusion
    };

    console.log('=== Synthesis Data Debug ===');
    console.log('Protocol1 exists:', !!protocol1Data);
    console.log('Protocol2 exists:', !!protocol2Data);
    console.log('Candidate data:', candidate);
    console.log('============================');

    // Générer le PDF
    const doc = generateSynthesisPdf(synthesisData);
    
    // Sauvegarder le PDF
    const fileName = `Synthese_Evaluation_${candidate.firstName}_${candidate.lastName}_${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating synthesis PDF:', error);
    return false;
  }
};
