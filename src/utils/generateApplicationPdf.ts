import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getMetierQuestionsForTitle } from '@/data/metierQuestions';

interface ApplicationData {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date | null;
  currentPosition?: string;
  gender?: string;
  // Documents
  cv?: { name: string } | null;
  coverLetter?: { name: string } | null;
  integrityLetter?: { name: string } | null;
  projectIdea?: { name: string } | null;
  diplomas?: { name: string }[];
  certificates?: { name: string }[];
  recommendations?: { name: string }[];
  // MTP Questions - Métier
  metier1?: string;
  metier2?: string;
  metier3?: string;
  metier4?: string;
  metier5?: string;
  metier6?: string;
  metier7?: string;
  // MTP Questions - Talent
  talent1?: string;
  talent2?: string;
  talent3?: string;
  // MTP Questions - Paradigme
  paradigme1?: string;
  paradigme2?: string;
  paradigme3?: string;
  jobTitle?: string;
  applicationDate?: string;
}

const checkIfFilled = (value: unknown): string => {
  if (value === null || value === undefined) return 'Non renseigné';
  if (typeof value === 'string' && value.trim() === '') return 'Non renseigné';
  if (Array.isArray(value) && value.length === 0) return 'Non renseigné';
  if (typeof value === 'object' && Object.keys(value).length === 0) return 'Non renseigné';
  return 'Renseigné';
};

export const generateApplicationPdf = (data: ApplicationData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175); // Blue-800
  doc.text('Récapitulatif de Candidature ', pageWidth / 2, yPos, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99); // Gray-600
  yPos += 10;
  doc.text(`Poste: ${data.jobTitle || 'Non spécifié'}`, margin, yPos);
  yPos += 7;
  doc.text(`Date de candidature: ${data.applicationDate || 'Non spécifiée'}`, margin, yPos);
  yPos += 15;

  // Personal Information Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('1. Informations Personnelles', margin, yPos);
  yPos += 10;

  console.log('=== PDF Generator Debug ===');
  console.log('data.dateOfBirth in generator:', data.dateOfBirth);
  console.log('data.dateOfBirth type in generator:', typeof data.dateOfBirth);
  console.log('data.dateOfBirth truthy check:', !!data.dateOfBirth);
  console.log('==============================');

  const personalInfo = [
    { 
      label: 'Nom Complet', 
      value: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      isFilled: !!(data.firstName || data.lastName)
    },
    { 
      label: 'Email', 
      value: data.email,
      isFilled: !!data.email
    },
    { 
      label: 'Date de Naissance', 
      value: data.dateOfBirth ? format(new Date(data.dateOfBirth), 'dd MMMM yyyy', { locale: fr }) : 'Non renseignée',
      isFilled: !!data.dateOfBirth
    },
    { 
      label: 'Sexe', 
      value: data.gender || 'Non renseigné',
      isFilled: !!data.gender && data.gender.trim() !== ''
    },
    { 
      label: 'Poste Actuel', 
      value: data.currentPosition || 'Non renseigné',
      isFilled: !!data.currentPosition
    },
  ];

  console.log('=== PersonalInfo Debug ===');
  const dateOfBirthInfo = personalInfo.find(info => info.label === 'Date de Naissance');
  console.log('DateOfBirth info object:', dateOfBirthInfo);
  console.log('==========================');

  doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'normal');
  personalInfo.forEach(info => {
    // Debug pour l'élément Date de Naissance
    if (info.label === 'Date de Naissance') {
      console.log('=== Processing Date de Naissance in PDF ===');
      console.log('info:', info);
      console.log('info.value:', info.value);
      console.log('info.value || "Non renseigné":', info.value || 'Non renseigné');
      console.log('==============================');
    }
    
    // Vérifier l'espace disponible
    if (yPos > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    
    // Afficher le label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(`${info.label}:`, margin, yPos);
    
    // Afficher la valeur
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    const textToWrite = info.value || 'Non renseigné';
    if (info.label === 'Date de Naissance') {
      console.log('=== Writing Date de Naissance to PDF ===');
      console.log('Text being written to PDF:', textToWrite);
      console.log('Position:', margin + 60, yPos);
      console.log('======================');
    }
    doc.text(textToWrite, margin + 60, yPos);
    
    // Afficher le statut avec la couleur appropriée
    const status = info.isFilled ? 'Renseigné' : 'Non renseigné';
    doc.setFont('helvetica', 'bold');
    if (info.isFilled) {
      doc.setTextColor(22, 163, 74); // Vert
    } else {
      doc.setTextColor(239, 68, 68); // Rouge
    }
    
    const statusX = pageWidth - margin - doc.getTextWidth(status);
    doc.text(status, statusX, yPos);
    
    yPos += 10; // Espacement entre les lignes
  });

  // Documents Section
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('2. Documents', margin, yPos);
  yPos += 10;

  // Vérifier et formater les documents
  const documents = [
    { 
      label: 'CV', 
      value: data.cv?.name || 'Non fourni',
      isFilled: !!data.cv?.name
    },
    { 
      label: 'Lettre de Motivation', 
      value: data.coverLetter?.name || 'Non fournie',
      isFilled: !!data.coverLetter?.name
    },
    { 
      label: 'Diplômes', 
      value: data.diplomas?.length > 0 
        ? `${data.diplomas.length} fichier(s)` 
        : 'Aucun fichier',
      isFilled: data.diplomas?.length > 0
    },
    { 
      label: 'Certificats', 
      value: data.certificates?.length > 0 
        ? `${data.certificates.length} fichier(s)` 
        : 'Aucun fichier',
      isFilled: data.certificates?.length > 0
    },

  ];

  // Afficher les documents
  doc.setFont('helvetica', 'normal');
  documents.forEach(docItem => {
    // Vérifier l'espace avant d'ajouter un nouveau document
    if (yPos > doc.internal.pageSize.height - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    // Afficher le label du document
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(`${docItem.label}:`, margin, yPos);
    
    // Afficher la valeur du document
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(docItem.value, margin + 60, yPos);
    
    // Afficher le statut avec la couleur appropriée
    const status = docItem.isFilled ? 'Renseigné' : 'Non renseigné';
    doc.setFont('helvetica', 'bold');
    if (docItem.isFilled) {
      doc.setTextColor(22, 163, 74); // Vert pour "Renseigné"
    } else {
      doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
    }
    
    const statusX = pageWidth - margin - doc.getTextWidth(status);
    doc.text(status, statusX, yPos);
    
    yPos += 10; // Plus d'espace entre les documents
  });
  
  // Ajouter un espace supplémentaire après la section des documents
  yPos += 5;

  // MTP Section
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('3. Adhérence MTP', margin, yPos);
  yPos += 10;

  // Récupérer les questions spécifiques au poste
  const mtpQuestions = getMetierQuestionsForTitle(data.jobTitle || '');

  // Métier
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text('Métier', margin, yPos);
  yPos += 7;

  // Créer le tableau des questions métier avec les réponses
  const metierQuestions = [
    { label: mtpQuestions.metier[0] || '1. Question métier 1', value: data.metier1 },
    { label: mtpQuestions.metier[1] || '2. Question métier 2', value: data.metier2 },
    { label: mtpQuestions.metier[2] || '3. Question métier 3', value: data.metier3 },
    { label: mtpQuestions.metier[3] || '4. Question métier 4', value: data.metier4 },
    { label: mtpQuestions.metier[4] || '5. Question métier 5', value: data.metier5 },
    { label: mtpQuestions.metier[5] || '6. Question métier 6', value: data.metier6 },
    { label: mtpQuestions.metier[6] || '7. Question métier 7', value: data.metier7 }
  ];

  // Fonction pour ajouter un texte avec gestion de la pagination
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight = 5) => {
    if (!text) return 0; // Ne rien faire si le texte est vide
    
    const splitText = doc.splitTextToSize(text, maxWidth - 15); // Marge réduite pour le texte
    let currentY = y;
    
    // Ajouter chaque ligne de texte
    for (let i = 0; i < splitText.length; i++) {
      // Vérifier si on doit ajouter une nouvelle page
      if (currentY > doc.internal.pageSize.height - 30) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.text(splitText[i], x + 5, currentY);
      currentY += lineHeight;
    }
    
    return currentY - y + 2; // Retourne la hauteur totale utilisée
  };

  doc.setFont('helvetica', 'normal');
  metierQuestions.forEach((q) => {
    // Vérifier l'espace disponible avant d'ajouter une nouvelle question
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    // Vérifier l'espace disponible avant d'ajouter une nouvelle question
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    // Afficher la question
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    
    // Gestion du texte long pour la question
    const questionLines = doc.splitTextToSize(q.label, pageWidth - 2 * margin - 10);
    doc.text(questionLines, margin + 5, yPos);
    
    yPos += questionLines.length * 5; // Ajuster l'espacement en fonction du nombre de lignes
    
    // Afficher la réponse si elle existe
    if (q.value) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      // Utiliser la fonction d'ajout de texte avec gestion de la pagination
      const textHeight = addWrappedText(
        q.value, 
        margin, 
        yPos, 
        pageWidth - 2 * margin
      );
      
      yPos += textHeight + 2; // Espacement réduit après la réponse
      
      // Afficher le statut "Renseigné" en vert juste après la réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(22, 163, 74); // Vert pour "Renseigné"
      doc.text('✓ Renseigné', margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement après le statut réduit
    } else {
      // Afficher "Non renseigné" en rouge si pas de réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
      doc.text('✗ Non renseigné', margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement réduit
    }
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Talent
  yPos += 10; // Plus d'espace avant la section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('Talent', margin, yPos);
  yPos += 7;

  // Créer le tableau des questions talent avec les réponses
  const talentQuestions = [
    { label: mtpQuestions.talent[0] || '1. Question talent 1', value: data.talent1 },
    { label: mtpQuestions.talent[1] || '2. Question talent 2', value: data.talent2 },
    { label: mtpQuestions.talent[2] || '3. Question talent 3', value: data.talent3 }
  ];

  talentQuestions.forEach((q) => {
    // Vérifier l'espace disponible avant d'ajouter une nouvelle question
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    // Vérifier l'espace disponible avant d'ajouter une nouvelle question
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    // Afficher la question
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    
    // Gestion du texte long pour la question
    const questionLines = doc.splitTextToSize(q.label, pageWidth - 2 * margin - 10);
    doc.text(questionLines, margin + 5, yPos);
    
    yPos += questionLines.length * 5; // Ajuster l'espacement en fonction du nombre de lignes
    
    // Afficher la réponse si elle existe
    if (q.value) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      // Utiliser la fonction d'ajout de texte avec gestion de la pagination
      const textHeight = addWrappedText(
        q.value, 
        margin, 
        yPos, 
        pageWidth - 2 * margin
      );
      
      yPos += textHeight + 2; // Espacement réduit après la réponse
      
      // Afficher le statut "Renseigné" en vert juste après la réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(22, 163, 74); // Vert pour "Renseigné"
      doc.text('✓ Renseigné', margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement après le statut réduit
    } else {
      // Afficher "Non renseigné" en rouge si pas de réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
      doc.text('✗ Non renseigné', margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement réduit
    }
    
    if (yPos > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Paradigme
  yPos += 10; // Plus d'espace avant la section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('Paradigme', margin, yPos);
  yPos += 7;

  // Créer le tableau des questions paradigme avec les réponses
  const paradigmeQuestions = [
    { label: mtpQuestions.paradigme[0] || '1. Question paradigme 1', value: data.paradigme1 },
    { label: mtpQuestions.paradigme[1] || '2. Question paradigme 2', value: data.paradigme2 },
    { label: mtpQuestions.paradigme[2] || '3. Question paradigme 3', value: data.paradigme3 }
  ];

  paradigmeQuestions.forEach((q) => {
    // Vérifier l'espace disponible avant d'ajouter une nouvelle question
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    // Vérifier l'espace disponible avant d'ajouter une nouvelle question
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    // Afficher la question
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    
    // Gestion du texte long pour la question
    const questionLines = doc.splitTextToSize(q.label, pageWidth - 2 * margin - 10);
    doc.text(questionLines, margin + 5, yPos);
    
    yPos += questionLines.length * 5; // Ajuster l'espacement en fonction du nombre de lignes
    
    // Afficher la réponse si elle existe
    if (q.value) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      // Utiliser la fonction d'ajout de texte avec gestion de la pagination
      const textHeight = addWrappedText(
        q.value, 
        margin, 
        yPos, 
        pageWidth - 2 * margin
      );
      
      yPos += textHeight + 2; // Espacement réduit après la réponse
      
      // Afficher le statut "Renseigné" en vert juste après la réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(22, 163, 74); // Vert pour "Renseigné"
      doc.text('✓ Renseigné', margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement après le statut réduit
    } else {
      // Afficher "Non renseigné" en rouge si pas de réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
      doc.text('✗ Non renseigné', margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement réduit
    }
    
    if (yPos > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Footer
  //@ts-expect-error fix it later
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(
      `Page ${i} sur ${totalPages} - ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })} - OneHCM`, 
      pageWidth / 2, 
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
};
