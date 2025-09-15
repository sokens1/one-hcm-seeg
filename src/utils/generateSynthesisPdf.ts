import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#16a34a'; // Green
  if (score >= 60) return '#ea580c'; // Orange
  return '#dc2626'; // Red
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'embauche': return 'Recommandé pour l\'embauche';
    case 'incubation': return 'En cours d\'évaluation';
    case 'refuse': return 'Non recommandé';
    default: return 'En attente';
  }
};

const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number => {
  if (!text || text.trim() === '') return 0;
  
  const splitText = doc.splitTextToSize(text, maxWidth - 15);
  let currentY = y;
  
  for (let i = 0; i < splitText.length; i++) {
    if (currentY > doc.internal.pageSize.height - 30) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.text(splitText[i], x + 5, currentY);
    currentY += lineHeight;
  }
  
  return currentY - y + 2;
};

const addSectionHeader = (doc: jsPDF, title: string, yPos: number, margin: number): number => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text(title, margin, yPos);
  return yPos + 10;
};

const addScoreBox = (doc: jsPDF, label: string, score: number, x: number, y: number, width: number, height: number): void => {
  // Box background
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.rect(x, y, width, height, 'F');
  
  // Border
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.rect(x, y, width, height);
  
  // Score label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(label, x + 5, y + 8);
  
  // Score value
  doc.setFontSize(16);
  doc.setTextColor(getScoreColor(score));
  doc.text(`${score.toFixed(1)}%`, x + 5, y + 18);
};

export const generateSynthesisPdf = (data: SynthesisData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175);
  doc.text('Rapport de Synthèse d\'Évaluation', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  
  // Candidate info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.text(`Candidat: ${data.candidate.firstName} ${data.candidate.lastName}`, margin, yPos);
  yPos += 7;
  doc.text(`Poste: ${data.candidate.jobTitle}`, margin, yPos);
  yPos += 7;
  doc.text(`Email: ${data.candidate.email}`, margin, yPos);
  yPos += 7;
  doc.text(`Date de génération: ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, margin, yPos);
  yPos += 15;

  // Global Score Section
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
  doc.setDrawColor(59, 130, 246); // Blue-500
  doc.rect(margin, yPos, pageWidth - 2 * margin, 30);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175);
  doc.text('Score Global', margin + 10, yPos + 12);
  
  doc.setFontSize(24);
  doc.setTextColor(getScoreColor(data.globalScore));
  doc.text(`${data.globalScore.toFixed(1)}%`, margin + 10, yPos + 25);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.text(`Statut: ${getStatusText(data.finalStatus)}`, pageWidth - margin - 60, yPos + 12);
  
  yPos += 40;

  // Protocol 1 Section
  if (data.protocol1) {
    yPos = addSectionHeader(doc, 'Protocole 1 - Évaluation Initiale', yPos, margin);
    
    // Protocol 1 scores
    const scoreBoxWidth = (pageWidth - 2 * margin - 20) / 3;
    const scoreBoxHeight = 25;
    
    addScoreBox(doc, 'Documents', data.protocol1.documentary_score || 0, margin, yPos, scoreBoxWidth, scoreBoxHeight);
    addScoreBox(doc, 'MTP', data.protocol1.mtp_score || 0, margin + scoreBoxWidth + 10, yPos, scoreBoxWidth, scoreBoxHeight);
    addScoreBox(doc, 'Entretien', data.protocol1.interview_score || 0, margin + 2 * (scoreBoxWidth + 10), yPos, scoreBoxWidth, scoreBoxHeight);
    
    yPos += 35;

    // Document evaluation details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Évaluation Documentaire', margin, yPos);
    yPos += 8;

    const docEvaluation = [
      { label: 'CV', score: data.protocol1.cv_score, comments: data.protocol1.cv_comments },
      { label: 'Lettre de Motivation', score: data.protocol1.lettre_motivation_score, comments: data.protocol1.lettre_motivation_comments },
      { label: 'Diplômes & Certificats', score: data.protocol1.diplomes_certificats_score, comments: data.protocol1.diplomes_certificats_comments }
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    docEvaluation.forEach(item => {
      if (yPos > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(31, 41, 55);
      doc.text(`${item.label}: ${item.score}/5`, margin, yPos);
      
      if (item.comments && item.comments.trim() !== '') {
        yPos += 5;
        doc.setTextColor(75, 85, 99);
        yPos += addWrappedText(doc, item.comments, margin, yPos, pageWidth - 2 * margin);
      }
      
      yPos += 8;
    });

    // MTP evaluation
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('Adhérence MTP', margin, yPos);
    yPos += 8;

    const mtpEvaluation = [
      { label: 'Métier', score: data.protocol1.metier_score, comments: data.protocol1.metier_comments },
      { label: 'Talent', score: data.protocol1.talent_score, comments: data.protocol1.talent_comments },
      { label: 'Paradigme', score: data.protocol1.paradigme_score, comments: data.protocol1.paradigme_comments }
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    mtpEvaluation.forEach(item => {
      if (yPos > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(31, 41, 55);
      doc.text(`${item.label}: ${item.score}/5`, margin, yPos);
      
      if (item.comments && item.comments.trim() !== '') {
        yPos += 5;
        doc.setTextColor(75, 85, 99);
        yPos += addWrappedText(doc, item.comments, margin, yPos, pageWidth - 2 * margin);
      }
      
      yPos += 8;
    });

    // Interview details
    if (data.protocol1.interview_date) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text('Détails de l\'Entretien', margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(`Date: ${format(new Date(data.protocol1.interview_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, margin, yPos);
      yPos += 8;

      const interviewEvaluation = [
        { label: 'Métier (Entretien)', score: data.protocol1.interview_metier_score, comments: data.protocol1.interview_metier_comments },
        { label: 'Talent (Entretien)', score: data.protocol1.interview_talent_score, comments: data.protocol1.interview_talent_comments },
        { label: 'Paradigme (Entretien)', score: data.protocol1.interview_paradigme_score, comments: data.protocol1.interview_paradigme_comments },
        { label: 'Gap de Compétence', score: data.protocol1.gap_competence_score, comments: data.protocol1.gap_competence_comments }
      ];

      interviewEvaluation.forEach(item => {
        if (yPos > doc.internal.pageSize.height - 30) {
          doc.addPage();
          yPos = 20;
        }

        doc.setTextColor(31, 41, 55);
        doc.text(`${item.label}: ${item.score}/5`, margin, yPos);
        
        if (item.comments && item.comments.trim() !== '') {
          yPos += 5;
          doc.setTextColor(75, 85, 99);
          yPos += addWrappedText(doc, item.comments, margin, yPos, pageWidth - 2 * margin);
        }
        
        yPos += 8;
      });

      if (data.protocol1.general_summary && data.protocol1.general_summary.trim() !== '') {
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Résumé Général de l\'Entretien:', margin, yPos);
        yPos += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        yPos += addWrappedText(doc, data.protocol1.general_summary, margin, yPos, pageWidth - 2 * margin);
      }
    }
  }

  // Protocol 2 Section
  if (data.protocol2) {
    yPos += 10;
    yPos = addSectionHeader(doc, 'Protocole 2 - Évaluation Approfondie', yPos, margin);

    // Protocol 2 status indicators
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);

    const protocol2Status = [
      { label: 'Visite Physique', completed: data.protocol2.physical_visit },
      { label: 'Entretien Complété', completed: data.protocol2.interview_completed },
      { label: 'QCM Rôle', completed: data.protocol2.qcm_role_completed },
      { label: 'QCM CODIR', completed: data.protocol2.qcm_codir_completed },
      { label: 'Fiche Poste Créée', completed: data.protocol2.job_sheet_created },
      { label: 'Gap Compétences Évalué', completed: data.protocol2.skills_gap_assessed }
    ];

    const statusWidth = (pageWidth - 2 * margin - 30) / 3;
    let col = 0;
    let row = 0;

    protocol2Status.forEach(status => {
      const x = margin + col * (statusWidth + 10);
      const y = yPos + row * 8;

      if (y > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
        row = 0;
        col = 0;
      }

      doc.setTextColor(status.completed ? '#16a34a' : '#dc2626');
      doc.text(`${status.completed ? '✓' : '✗'} ${status.label}`, x, y + row * 8);

      col++;
      if (col >= 3) {
        col = 0;
        row++;
      }
    });

    yPos += Math.ceil(protocol2Status.length / 3) * 12 + 10;

    // Protocol 2 scores
    if (data.protocol2.overall_score > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text('Scores Protocole 2', margin, yPos);
      yPos += 8;

      const protocol2Scores = [
        { label: 'Analyse Compétences', score: data.protocol2.analyse_competences_score, comments: data.protocol2.analyse_competences_comments },
        { label: 'Fiche KCIS', score: data.protocol2.fiche_kcis_score, comments: data.protocol2.fiche_kcis_comments },
        { label: 'Fiche KPIS', score: data.protocol2.fiche_kpis_score, comments: data.protocol2.fiche_kpis_comments },
        { label: 'Fiche KRIS', score: data.protocol2.fiche_kris_score, comments: data.protocol2.fiche_kris_comments },
        { label: 'Gap Compétences', score: data.protocol2.gap_competences_score, comments: data.protocol2.gap_competences_comments }
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      protocol2Scores.forEach(item => {
        if (yPos > doc.internal.pageSize.height - 30) {
          doc.addPage();
          yPos = 20;
        }

        doc.setTextColor(31, 41, 55);
        doc.text(`${item.label}: ${item.score}/5`, margin, yPos);
        
        if (item.comments && item.comments.trim() !== '') {
          yPos += 5;
          doc.setTextColor(75, 85, 99);
          yPos += addWrappedText(doc, item.comments, margin, yPos, pageWidth - 2 * margin);
        }
        
        yPos += 8;
      });
    }
  }

  // Recommendations Section
  yPos += 15;
  yPos = addSectionHeader(doc, 'Recommandations et Conclusion', yPos, margin);

  // Points forts
  if (data.pointsForts && data.pointsForts.trim() !== '') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74);
    doc.text('Points Forts:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    yPos += addWrappedText(doc, data.pointsForts, margin, yPos, pageWidth - 2 * margin);
    yPos += 10;
  }

  // Points d'amélioration
  if (data.pointsAmelioration && data.pointsAmelioration.trim() !== '') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(234, 88, 12);
    doc.text('Points d\'Amélioration:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    yPos += addWrappedText(doc, data.pointsAmelioration, margin, yPos, pageWidth - 2 * margin);
    yPos += 10;
  }

  // Conclusion
  if (data.conclusion && data.conclusion.trim() !== '') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text('Conclusion:', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    yPos += addWrappedText(doc, data.conclusion, margin, yPos, pageWidth - 2 * margin);
  }

  // Footer
  //@ts-expect-error fix it later
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Page ${i} sur ${totalPages} - ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })} - OneHCM`, 
      pageWidth / 2, 
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
};
