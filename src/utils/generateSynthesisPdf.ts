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
  jeu_codir_score: number;
  jeu_codir_comments: string | null;
  gap_competences_level: string | null;
  plan_formation_score: number;
  plan_formation_comments: string | null;
  mise_en_situation_score: number;
  validation_operationnelle_score: number;
  total_score: number;
  jeu_de_role_comments: string | null;
  jeu_de_role_score: number;
  status: string;
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
  if (score >= 86) return '#16a34a'; // Green
  if (score >= 46) return '#ea580c'; // Orange
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
  const margin = 20;
  let yPos = 20;

  // Header avec gradient bleu
  doc.setFillColor(30, 64, 175); // Blue-800
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo/Title OneHCM
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('OneHCM', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Rapport de Synthèse d\'Évaluation', pageWidth / 2, 35, { align: 'center' });
  
  yPos = 70;

  // Informations candidat dans un encadré moderne
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.rect(margin, yPos, pageWidth - 2 * margin, 40);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175);
  doc.text('Informations du Candidat', margin + 10, yPos + 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  
  // Colonne gauche - alignée correctement
  doc.text(`Nom: ${data.candidate.firstName} ${data.candidate.lastName}`, margin + 10, yPos + 25);
  doc.text(`Email: ${data.candidate.email}`, margin + 10, yPos + 32);
  
  // Colonne droite - alignée correctement avec la colonne gauche
  const rightColumnX = margin + (pageWidth - 2 * margin) / 2 + 10; // Milieu + marge
  doc.text(`Poste: ${data.candidate.jobTitle}`, rightColumnX, yPos + 25);
  doc.text(`Date de génération: ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, rightColumnX, yPos + 32);
  
  yPos += 50;

  // Score Global avec design moderne
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F');
  doc.setDrawColor(59, 130, 246); // Blue-500
  doc.rect(margin, yPos, pageWidth - 2 * margin, 35);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text('Score Global', pageWidth / 2, yPos + 15, { align: 'center' });
  
  doc.setFontSize(28);
  doc.setTextColor(getScoreColor(data.globalScore));
  doc.text(`${data.globalScore.toFixed(1)}%`, pageWidth / 2, yPos + 30, { align: 'center' });
  
  yPos += 50;

  // Section Protocole 1
  if (data.protocol1) {
    yPos = addSectionHeader(doc, 'Protocole 1 - Évaluation Initiale', yPos, margin);
    
    // Scores du Protocole 1 dans des cartes modernes
    const protocol1Scores = [
      { label: 'Documents', score: data.protocol1.documentary_score || 0, color: '#10b981' },
      { label: 'Adhérence MTP', score: data.protocol1.mtp_score || 0, color: '#3b82f6' },
      { label: 'Entretien', score: data.protocol1.interview_score || 0, color: '#8b5cf6' }
    ];

    const cardWidth = (pageWidth - 2 * margin - 20) / 3;
    
    protocol1Scores.forEach((item, index) => {
      const x = margin + index * (cardWidth + 10);
      
      // Carte avec ombre
      doc.setFillColor(255, 255, 255);
      doc.rect(x, yPos, cardWidth, 45, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(x, yPos, cardWidth, 45);
      
      // Titre de la carte
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text(item.label, x + 10, yPos + 12);
      
      // Score
      doc.setFontSize(20);
      doc.setTextColor(item.color);
      doc.text(`${item.score.toFixed(1)}%`, x + 10, yPos + 30);
      
      // Barre de progression
      doc.setFillColor(item.color);
      doc.rect(x + 10, yPos + 35, (item.score / 100) * (cardWidth - 20), 5, 'F');
    });
    
    yPos += 60;

    // Détails de l'évaluation documentaire
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text('Évaluation Documentaire', margin, yPos);
    yPos += 15;

    const docEvaluation = [
      { label: 'CV', score: data.protocol1.cv_score, comments: data.protocol1.cv_comments },
      { label: 'Lettre de Motivation', score: data.protocol1.lettre_motivation_score, comments: data.protocol1.lettre_motivation_comments },
      { label: 'Diplômes & Certificats', score: data.protocol1.diplomes_certificats_score, comments: data.protocol1.diplomes_certificats_comments }
    ];

    docEvaluation.forEach(item => {
      if (yPos > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = 20;
      }

      // Ligne d'évaluation
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25);
      
      // Label et score
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(`${item.label}:`, margin + 10, yPos + 10);
      
      doc.setFontSize(16);
      doc.setTextColor(getScoreColor(item.score * 20));
      doc.text(`${item.score}/5`, margin + 10, yPos + 20);
      
      // Commentaires
      if (item.comments && item.comments.trim() !== '') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        const commentLines = doc.splitTextToSize(item.comments, pageWidth - 2 * margin - 80);
        doc.text(commentLines[0] || '', margin + 80, yPos + 10);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("Aucun commentaire", margin + 80, yPos + 10);
      }
      
      yPos += 30;
    });

    // Adhérence MTP
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text('Adhérence MTP', margin, yPos);
    yPos += 15;

    const mtpEvaluation = [
      { label: 'Métier', score: data.protocol1.metier_score, comments: data.protocol1.metier_comments },
      { label: 'Talent', score: data.protocol1.talent_score, comments: data.protocol1.talent_comments },
      { label: 'Paradigme', score: data.protocol1.paradigme_score, comments: data.protocol1.paradigme_comments }
    ];

    mtpEvaluation.forEach(item => {
      if (yPos > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = 20;
      }

      // Ligne d'évaluation
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25);
      
      // Label et score
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(`${item.label}:`, margin + 10, yPos + 10);
      
      doc.setFontSize(16);
      doc.setTextColor(getScoreColor(item.score * 20));
      doc.text(`${item.score}/5`, margin + 10, yPos + 20);
      
      // Commentaires
      if (item.comments && item.comments.trim() !== '') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        const commentLines = doc.splitTextToSize(item.comments, pageWidth - 2 * margin - 80);
        doc.text(commentLines[0] || '', margin + 80, yPos + 10);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("Aucun commentaire", margin + 80, yPos + 10);
      }
      
      yPos += 30;
    });

    // Détails de l'entretien si disponible
    if (data.protocol1.interview_date) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Détails de l\'Entretien', margin, yPos);
      yPos += 15;

      // Date de l'entretien
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(`Date: ${format(new Date(data.protocol1.interview_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, margin, yPos);
      yPos += 10;

      // Évaluation de l'entretien
      const interviewEvaluation = [
        { label: 'Métier (Entretien)', score: data.protocol1.interview_metier_score, comments: data.protocol1.interview_metier_comments },
        { label: 'Talent (Entretien)', score: data.protocol1.interview_talent_score, comments: data.protocol1.interview_talent_comments },
        { label: 'Paradigme (Entretien)', score: data.protocol1.interview_paradigme_score, comments: data.protocol1.interview_paradigme_comments },
        { label: 'Gap de Compétence', score: data.protocol1.gap_competence_score, comments: data.protocol1.gap_competence_comments }
      ];

      interviewEvaluation.forEach(item => {
        if (yPos > doc.internal.pageSize.height - 40) {
          doc.addPage();
          yPos = 20;
        }

        // Ligne d'évaluation
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 25);
        
        // Label et score
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);
        doc.text(`${item.label}:`, margin + 10, yPos + 10);
        
        doc.setFontSize(16);
        doc.setTextColor(getScoreColor(item.score * 20));
        doc.text(`${item.score}/5`, margin + 10, yPos + 20);
        
        // Commentaires
        if (item.comments && item.comments.trim() !== '') {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(75, 85, 99);
          const commentLines = doc.splitTextToSize(item.comments, pageWidth - 2 * margin - 80);
          doc.text(commentLines[0] || '', margin + 80, yPos + 10);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text("Aucun commentaire", margin + 80, yPos + 10);
        }
        
        yPos += 30;
      });

      // Résumé général de l'entretien
      if (data.protocol1.general_summary && data.protocol1.general_summary.trim() !== '') {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text('Résumé Général:', margin, yPos);
        yPos += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        yPos += addWrappedText(doc, data.protocol1.general_summary, margin, yPos, pageWidth - 2 * margin);
      }
    }
  }

  // Section Protocole 2
  if (data.protocol2) {
    yPos += 20;
    yPos = addSectionHeader(doc, 'Protocole 2 - Évaluation Approfondie', yPos, margin);
    
    // Statuts des étapes du Protocole 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text('Étapes d\'Évaluation', margin, yPos);
    yPos += 15;

    const protocol2Steps = [
      { label: 'Visite Physique', completed: data.protocol2.physical_visit },
      { label: 'Entretien Complété', completed: data.protocol2.interview_completed },
      { label: 'QCM Rôle', completed: data.protocol2.qcm_role_completed },
      { label: 'QCM CODIR', completed: data.protocol2.qcm_codir_completed },
      { label: 'Fiche Poste Créée', completed: data.protocol2.job_sheet_created },
      { label: 'Gap Compétences Évalué', completed: data.protocol2.skills_gap_assessed }
    ];

    // Affichage des étapes en grille
    const stepWidth = (pageWidth - 2 * margin - 30) / 3;
    let col = 0;
    let row = 0;

    protocol2Steps.forEach(step => {
      const x = margin + col * (stepWidth + 10);
      const y = yPos + row * 15;

      if (y > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = 20;
        row = 0;
        col = 0;
      }

      // Icône de statut
      doc.setFontSize(12);
      doc.setTextColor(step.completed ? '#16a34a' : '#dc2626');
      doc.text(step.completed ? '✓' : '✗', x, y);
      
      // Label de l'étape
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(step.label, x + 15, y);

      col++;
      if (col >= 3) {
        col = 0;
        row++;
      }
    });

    yPos += Math.ceil(protocol2Steps.length / 3) * 15 + 20;

    // Scores du Protocole 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text('Scores d\'Évaluation', margin, yPos);
    yPos += 15;

    const protocol2Scores = [
      { label: 'Analyse Compétences', score: data.protocol2.analyse_competences_score || 0, comments: data.protocol2.analyse_competences_comments },
      { label: 'Fiche KCIS', score: data.protocol2.fiche_kcis_score || 0, comments: data.protocol2.fiche_kcis_comments },
      { label: 'Fiche KPIS', score: data.protocol2.fiche_kpis_score || 0, comments: data.protocol2.fiche_kpis_comments },
      { label: 'Fiche KRIS', score: data.protocol2.fiche_kris_score || 0, comments: data.protocol2.fiche_kris_comments },
      { label: 'Gap Compétences', score: data.protocol2.gap_competences_score || 0, comments: data.protocol2.gap_competences_comments },
      { label: 'Jeu CODIR', score: data.protocol2.jeu_codir_score || 0, comments: data.protocol2.jeu_codir_comments },
      { label: 'Plan Formation', score: data.protocol2.plan_formation_score || 0, comments: data.protocol2.plan_formation_comments },
      { label: 'Jeu de Rôle', score: data.protocol2.jeu_de_role_score || 0, comments: data.protocol2.jeu_de_role_comments }
    ];

    protocol2Scores.forEach(item => {
      if (yPos > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = 20;
      }

      // Ligne d'évaluation
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 25);
      
      // Label et score
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(`${item.label}:`, margin + 10, yPos + 10);
      
      doc.setFontSize(16);
      doc.setTextColor(getScoreColor(item.score * 20));
      doc.text(`${item.score}/5`, margin + 10, yPos + 20);
      
      // Commentaires
      if (item.comments && item.comments.trim() !== '') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        const commentLines = doc.splitTextToSize(item.comments, pageWidth - 2 * margin - 80);
        doc.text(commentLines[0] || '', margin + 80, yPos + 10);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("Aucun commentaire", margin + 80, yPos + 10);
      }
      
      yPos += 30;
    });

    // Notes générales du Protocole 2
    const hasGeneralNotes = data.protocol2.interview_notes || data.protocol2.visit_notes || data.protocol2.skills_gap_notes;
    if (hasGeneralNotes) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text('Notes Générales', margin, yPos);
      yPos += 15;

      if (data.protocol2.interview_notes && data.protocol2.interview_notes.trim() !== '') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text('Notes Entretien:', margin, yPos);
        yPos += 5;
        yPos += addWrappedText(doc, data.protocol2.interview_notes, margin, yPos, pageWidth - 2 * margin);
        yPos += 10;
      }

      if (data.protocol2.visit_notes && data.protocol2.visit_notes.trim() !== '') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text('Notes Visite:', margin, yPos);
        yPos += 5;
        yPos += addWrappedText(doc, data.protocol2.visit_notes, margin, yPos, pageWidth - 2 * margin);
        yPos += 10;
      }

      if (data.protocol2.skills_gap_notes && data.protocol2.skills_gap_notes.trim() !== '') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text('Notes Gap Compétences:', margin, yPos);
        yPos += 5;
        yPos += addWrappedText(doc, data.protocol2.skills_gap_notes, margin, yPos, pageWidth - 2 * margin);
      }
    }
  }

  // Section Recommandations
  yPos += 20;
  yPos = addSectionHeader(doc, 'Recommandations et Conclusion', yPos, margin);

  // Points forts
  if (data.pointsForts && data.pointsForts.trim() !== '') {
    doc.setFillColor(240, 253, 244); // Green-50
    doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
    doc.setDrawColor(34, 197, 94); // Green-500
    doc.rect(margin, yPos, pageWidth - 2 * margin, 30);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74);
    doc.text('✓ Points Forts', margin + 10, yPos + 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const pointsFortsLines = doc.splitTextToSize(data.pointsForts, pageWidth - 2 * margin - 20);
    doc.text(pointsFortsLines[0] || '', margin + 10, yPos + 22);
    
    yPos += 40;
  }

  // Points d'amélioration
  if (data.pointsAmelioration && data.pointsAmelioration.trim() !== '') {
    doc.setFillColor(255, 247, 237); // Orange-50
    doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
    doc.setDrawColor(249, 115, 22); // Orange-500
    doc.rect(margin, yPos, pageWidth - 2 * margin, 30);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(234, 88, 12);
    doc.text('⚠ Points d\'Amélioration', margin + 10, yPos + 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const pointsAmeliorationLines = doc.splitTextToSize(data.pointsAmelioration, pageWidth - 2 * margin - 20);
    doc.text(pointsAmeliorationLines[0] || '', margin + 10, yPos + 22);
    
    yPos += 40;
  }

  // Conclusion
  if (data.conclusion && data.conclusion.trim() !== '') {
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
    doc.setDrawColor(59, 130, 246); // Blue-500
    doc.rect(margin, yPos, pageWidth - 2 * margin, 30);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text('📋 Conclusion', margin + 10, yPos + 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const conclusionLines = doc.splitTextToSize(data.conclusion, pageWidth - 2 * margin - 20);
    doc.text(conclusionLines[0] || '', margin + 10, yPos + 22);
  }

  // Footer simple avec marge
  //@ts-expect-error fix it later
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Marge de 15px du bas de la page
    const footerY = doc.internal.pageSize.height - 15;
    
    // Ligne de séparation
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    // Date et website en bas à gauche
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })} - seeg-talentsource.com`, 
      margin, 
      footerY
    );
    
    // Numéro de page à droite
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Page ${i} sur ${totalPages}`, 
      pageWidth - margin, 
      footerY,
      { align: 'right' }
    );
  }

  return doc;
};
