import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  doc.text('Récapitulatif de Candidature', pageWidth / 2, yPos, { align: 'center' });
  
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
      isFilled: !!data.gender
    },
    { 
      label: 'Poste Actuel', 
      value: data.currentPosition || 'Non renseigné',
      isFilled: !!data.currentPosition
    },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'normal');
  personalInfo.forEach(info => {
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
    doc.text(info.value || 'Non renseigné', margin + 60, yPos);
    
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
      label: 'Lettre d\'intégrité', 
      value: data.integrityLetter?.name || 'Non fournie',
      isFilled: !!data.integrityLetter?.name
    },
    { 
      label: 'Idée de Projet', 
      value: data.projectIdea?.name || 'Non fournie',
      isFilled: !!data.projectIdea?.name
    },
    { 
      label: 'Certificats', 
      value: data.certificates?.length > 0 
        ? `${data.certificates.length} fichier(s)` 
        : 'Aucun fichier',
      isFilled: data.certificates?.length > 0
    },
    { 
      label: 'Lettres de Recommandation', 
      value: data.recommendations?.length > 0 
        ? `${data.recommendations.length} fichier(s)` 
        : 'Aucun fichier',
      isFilled: data.recommendations?.length > 0
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

  // Métier
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text('Métier', margin, yPos);
  yPos += 7;

  const metierQuestions = [
    { 
      label: '1. Quelles sont les problématiques que vous identifiez aujourd\'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?',
      value: data.metier1 
    },
    { 
      label: '2. Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant de l\'exploitation électricité à la SEEG ?',
      value: data.metier2 
    },
    { 
      label: '3. Expliquez ce que vous savez des normes d\'exploitation requises pour gérer une concession électrique.',
      value: data.metier3 
    },
    { 
      label: '4. Racontez une expérience où vous avez dirigé un projet d\'investissement orienté réseaux électriques.',
      value: data.metier4 
    },
    { 
      label: '5. Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec l\'exploitation des réseaux électriques.',
      value: data.metier5 
    },
    { 
      label: '6. Donnez un exemple concret illustrant la meilleure façon d\'assurer l\'exploitation optimale et la continuité du service électrique à la SEEG.',
      value: data.metier6 
    },
    { 
      label: '7. Comment garantirez-vous que l\'exploitation électrique respecte les normes légales et réglementaires afin de réduire les risques de panne et d\'assurer un service continu aux usagers ?',
      value: data.metier7 
    }
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
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74); // Green-600
  doc.text('Talent', margin, yPos);
  yPos += 10;

  const talentQuestions = [
    { 
      label: '1. Comment assureriez-vous la continuité du service malgré des infrastructures fragiles ?',
      value: data.talent1 
    },
    { 
      label: '2. Quelle méthode appliqueriez-vous pour réduire les délestages électriques ?',
      value: data.talent2 
    },
    { 
      label: '3. Comment organiseriez-vous vos équipes pour optimiser la performance et la sécurité du réseau ?',
      value: data.talent3 
    }
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
  doc.setFontSize(14);
  doc.setTextColor(168, 85, 247); // Purple-500
  doc.text('Paradigme', margin, yPos);
  yPos += 10;

  const paradigmeQuestions = [
    { 
      label: '1. Quel est le devoir premier d\'un responsable exploitation : réduire les coûts ou garantir la continuité du service ?',
      value: data.paradigme1 
    },
    { 
      label: '2. Comment hiérarchisez-vous sécurité, rapidité d\'intervention et satisfaction client ?',
      value: data.paradigme2 
    },
    { 
      label: '3. Quelle est votre vision d\'une exploitation électrique responsable ?',
      value: data.paradigme3 
    }
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
