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
  // Références de recommandation
  referenceFullName?: string;
  referenceEmail?: string;
  referenceContact?: string;
  referenceCompany?: string;
  // Expérience professionnelle (pour les offres internes)
  hasBeenManager?: boolean | null;
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
  // Statut de l'offre pour déterminer si les références sont requises
  offerStatus?: string; // 'interne' | 'externe'
}

// Fonction ULTRA-AGRESSIVE pour nettoyer le texte corrompu et forcer la compatibilité PDF
const cleanCorruptedText = (text: string | null | undefined): string => {
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

const checkIfFilled = (value: unknown, isRequired: boolean = true): string => {
  if (value === null || value === undefined) {
    // Si le champ n'est pas requis (ex: références pour offres internes), ne pas afficher "Non renseigné"
    return isRequired ? 'Non renseigné' : 'Non applicable';
  }
  
  // Si c'est une chaîne, la nettoyer avant de vérifier
  if (typeof value === 'string') {
    const cleaned = cleanCorruptedText(value);
    
    // Debug log pour voir ce qui se passe
    console.log('🔍 [PDF DEBUG] checkIfFilled:', {
      original: value,
      cleaned: cleaned,
      length: cleaned.trim().length,
      isRequired: isRequired,
      result: cleaned === '' ? (isRequired ? 'Non renseigné' : 'Non applicable') : 'Renseigné'
    });
    
    if (cleaned === '') return isRequired ? 'Non renseigné' : 'Non applicable';
    return 'Renseigné';
  }
  
  if (Array.isArray(value) && value.length === 0) return isRequired ? 'Non renseigné' : 'Non applicable';
  if (typeof value === 'object' && Object.keys(value).length === 0) return isRequired ? 'Non renseigné' : 'Non applicable';
  return 'Renseigné';
};

export const generateApplicationPdf = (data: ApplicationData) => {
  const doc = new jsPDF();
  
  // FORCER l'encodage et la police pour éviter les problèmes de caractères spéciaux
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  
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

  // console.log('=== PDF Generator Debug ===');
  // console.log('data.dateOfBirth in generator:', data.dateOfBirth);
  // console.log('data.dateOfBirth type in generator:', typeof data.dateOfBirth);
  // console.log('data.dateOfBirth truthy check:', !!data.dateOfBirth);
  // console.log('==============================');

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

  // console.log('=== PersonalInfo Debug ===');
  const dateOfBirthInfo = personalInfo.find(info => info.label === 'Date de Naissance');
  // console.log('DateOfBirth info object:', dateOfBirthInfo);
  // console.log('==========================');

  doc.setFont('helvetica', 'normal');
  doc.setFont('helvetica', 'normal');
  personalInfo.forEach(info => {
    // Debug pour l'élément Date de Naissance
    if (info.label === 'Date de Naissance') {
      // console.log('=== Processing Date de Naissance in PDF ===');
      // console.log('info:', info);
      // console.log('info.value:', info.value);
      // console.log('info.value || "Non renseigné":', info.value || 'Non renseigné');
      // console.log('==============================');
    }
    
    // Vérifier l'espace disponible
    if (yPos > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    
    // Nettoyer le texte corrompu avant de l'afficher - NETTOYER AUSSI LE LABEL
    const cleanedLabel = cleanCorruptedText(info.label);
    const textToWrite = info.value ? cleanCorruptedText(info.value) : 'Non renseigné';
    
    // Afficher le label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(`${cleanedLabel}:`, margin, yPos);
    
    // Afficher la valeur
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    if (info.label === 'Date de Naissance') {
      // console.log('=== Writing Date de Naissance to PDF ===');
      // console.log('Text being written to PDF:', textToWrite);
      // console.log('Position:', margin + 60, yPos);
      // console.log('======================');
    }
    doc.text(textToWrite, margin + 60, yPos);
    
    // Afficher le statut avec la couleur appropriée - NETTOYER LE STATUT AUSSI
    const status = cleanCorruptedText(info.isFilled ? 'Renseigné' : (info.isRequired ? 'Non renseigné' : 'Non applicable'));
    doc.setFont('helvetica', 'bold');
    if (info.isFilled) {
      doc.setTextColor(22, 163, 74); // Vert
    } else if (info.isRequired) {
      doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
    } else {
      doc.setTextColor(107, 114, 128); // Gris pour "Non applicable"
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
    
    // Afficher le statut avec la couleur appropriée - NETTOYER LE STATUT AUSSI
    const status = cleanCorruptedText(docItem.isFilled ? 'Renseigné' : 'Non renseigné');
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

  // Références de Recommandation Section
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  // Déterminer le type d'offre
  const isExternalOffer = data.offerStatus === 'externe';
  const isInternalOffer = data.offerStatus === 'interne';
  
  // Titre de section selon le type d'offre
  if (isExternalOffer) {
  doc.text('3. Références de Recommandation', margin, yPos);
  } else if (isInternalOffer) {
    doc.text('3. Expérience Professionnelle', margin, yPos);
  } else {
    doc.text('3. Informations Complémentaires', margin, yPos);
  }
  yPos += 10;

  // Vérifier l'espace disponible avant d'ajouter la section
  if (yPos > doc.internal.pageSize.height - 50) {
    doc.addPage();
    yPos = 20;
  }

  // Debug: Log data received
  console.log('🔍 [generateApplicationPdf] Données reçues:', {
    referenceFullName: data.referenceFullName,
    referenceEmail: data.referenceEmail,
    referenceContact: data.referenceContact,
    referenceCompany: data.referenceCompany,
    hasBeenManager: data.hasBeenManager,
    offerStatus: data.offerStatus,
    isExternalOffer,
    isInternalOffer
  });
  
  let sectionInfo = [];
  
  if (isExternalOffer) {
    // Section Références pour les offres externes
    sectionInfo = [
    { 
      label: 'Nom et Prénom', 
        value: data.referenceFullName ? cleanCorruptedText(data.referenceFullName) : 'Non renseigné',
        isFilled: data.referenceFullName ? cleanCorruptedText(data.referenceFullName).trim().length > 0 : false,
        isRequired: true
      },
      { 
        label: 'Administration / Entreprise / Organisation', 
        value: data.referenceCompany ? cleanCorruptedText(data.referenceCompany) : 'Non renseignée',
        isFilled: data.referenceCompany ? cleanCorruptedText(data.referenceCompany).trim().length > 0 : false,
        isRequired: true,
        isLongLabel: true  // Flag pour indiquer un label long
    },
    { 
      label: 'Email', 
        value: data.referenceEmail ? cleanCorruptedText(data.referenceEmail) : 'Non renseigné',
        isFilled: data.referenceEmail ? cleanCorruptedText(data.referenceEmail).trim().length > 0 : false,
        isRequired: true
    },
    { 
      label: 'Contact', 
        value: data.referenceContact ? cleanCorruptedText(data.referenceContact) : 'Non renseigné',
        isFilled: data.referenceContact ? cleanCorruptedText(data.referenceContact).trim().length > 0 : false,
        isRequired: true
      }
    ];
  } else if (isInternalOffer) {
    // Section Expérience Professionnelle pour les offres internes
    const experienceAnswer = data.hasBeenManager === true ? 'Oui' : data.hasBeenManager === false ? 'Non' : 'Non renseigné';
    const isFilled = data.hasBeenManager !== null;
    
    sectionInfo = [
      {
        label: 'Avez vous déjà eu, pour ce métier, l\'une des expériences suivantes :',
        value: '',
        isFilled: false,
        isRequired: false,
        isQuestion: true
      },
      {
        label: '• Chef de service ;',
        value: '',
        isFilled: false,
        isRequired: false,
        isSubItem: true
      },
      {
        label: '• Chef de département ;',
        value: '',
        isFilled: false,
        isRequired: false,
        isSubItem: true
      },
      {
        label: '• Directeur ;',
        value: '',
        isFilled: false,
        isRequired: false,
        isSubItem: true
      },
      {
        label: '• Senior/Expert avec au moins 5 ans d\'expérience ?',
        value: '',
        isFilled: false,
        isRequired: false,
        isSubItem: true
      },
      {
        label: 'Réponse',
        value: experienceAnswer,
        isFilled: isFilled,
        isRequired: true
      }
    ];
  }

  // Afficher les informations de la section
  doc.setFont('helvetica', 'normal');
  sectionInfo.forEach(info => {
    // Vérifier l'espace disponible
    if (yPos > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    
    // Nettoyer le label et la valeur
    const cleanedLabel = cleanCorruptedText(info.label);
    const cleanedValue = cleanCorruptedText(info.value);
    
    // Style différent selon le type d'élément
    if (info.isQuestion) {
      // Question principale
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
      doc.text(cleanedLabel, margin, yPos);
    } else if (info.isSubItem) {
      // Sous-éléments (puces)
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(cleanedLabel, margin + 10, yPos);
    } else {
      // Éléments normaux avec valeur
      const hasLongLabel = (info as any).isLongLabel;
      
      if (hasLongLabel) {
        // Pour les labels longs : afficher le label sur une ligne séparée
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(`${cleanedLabel}:`, margin, yPos);
        yPos += 7; // Espacement réduit pour la ligne suivante
        
        // Afficher la valeur sur la ligne suivante, alignée avec les autres valeurs (margin + 60)
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(cleanedValue, margin + 60, yPos);
        
        // Afficher le statut avec la couleur appropriée
        const status = cleanCorruptedText(info.isFilled ? 'Renseigné' : (info.isRequired ? 'Non renseigné' : 'Non applicable'));
        doc.setFont('helvetica', 'bold');
        if (info.isFilled) {
          doc.setTextColor(22, 163, 74); // Vert
        } else if (info.isRequired) {
          doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
        } else {
          doc.setTextColor(107, 114, 128); // Gris pour "Non applicable"
        }
        
        const statusX = pageWidth - margin - doc.getTextWidth(status);
        doc.text(status, statusX, yPos);
      } else {
        // Pour les labels normaux : afficher sur une seule ligne
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
        doc.text(`${cleanedLabel}:`, margin, yPos);
    
    // Afficher la valeur
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
        doc.text(cleanedValue, margin + 60, yPos);
    
    // Afficher le statut avec la couleur appropriée
        const status = cleanCorruptedText(info.isFilled ? 'Renseigné' : (info.isRequired ? 'Non renseigné' : 'Non applicable'));
    doc.setFont('helvetica', 'bold');
    if (info.isFilled) {
      doc.setTextColor(22, 163, 74); // Vert
        } else if (info.isRequired) {
          doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
    } else {
          doc.setTextColor(107, 114, 128); // Gris pour "Non applicable"
    }
    
    const statusX = pageWidth - margin - doc.getTextWidth(status);
    doc.text(status, statusX, yPos);
      }
    }
    
    yPos += 10; // Espacement entre les lignes
  });

  // Ajouter un espace supplémentaire après la section des références
  yPos += 5;

  // MTP Section
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('4. Adhérence MTP', margin, yPos);
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
    
    // Gestion du texte long pour la question - NETTOYER la question aussi
    const cleanedQuestion = cleanCorruptedText(q.label);
    const questionLines = doc.splitTextToSize(cleanedQuestion, pageWidth - 2 * margin - 10);
    doc.text(questionLines, margin + 5, yPos);
    
    yPos += questionLines.length * 5; // Ajuster l'espacement en fonction du nombre de lignes
    
    // Afficher la réponse si elle existe
    if (q.value) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      // Utiliser la fonction d'ajout de texte avec gestion de la pagination
      // Nettoyer le texte corrompu avant de l'afficher
      const cleanedValue = cleanCorruptedText(q.value);
      const textHeight = addWrappedText(
        cleanedValue, 
        margin, 
        yPos, 
        pageWidth - 2 * margin
      );
      
      yPos += textHeight + 2; // Espacement réduit après la réponse
      
      // Afficher le statut "Renseigné" en vert juste après la réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(22, 163, 74); // Vert pour "Renseigné"
      doc.text(cleanCorruptedText('✓ Renseigné'), margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement après le statut réduit
    } else {
      // Afficher "Non renseigné" en rouge si pas de réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
      doc.text(cleanCorruptedText('✗ Non renseigné'), margin + 5, yPos + 1); // Décalage vertical réduit
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
    
    // Gestion du texte long pour la question - NETTOYER la question aussi
    const cleanedQuestion = cleanCorruptedText(q.label);
    const questionLines = doc.splitTextToSize(cleanedQuestion, pageWidth - 2 * margin - 10);
    doc.text(questionLines, margin + 5, yPos);
    
    yPos += questionLines.length * 5; // Ajuster l'espacement en fonction du nombre de lignes
    
    // Afficher la réponse si elle existe
    if (q.value) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      // Utiliser la fonction d'ajout de texte avec gestion de la pagination
      // Nettoyer le texte corrompu avant de l'afficher
      const cleanedValue = cleanCorruptedText(q.value);
      const textHeight = addWrappedText(
        cleanedValue, 
        margin, 
        yPos, 
        pageWidth - 2 * margin
      );
      
      yPos += textHeight + 2; // Espacement réduit après la réponse
      
      // Afficher le statut "Renseigné" en vert juste après la réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(22, 163, 74); // Vert pour "Renseigné"
      doc.text(cleanCorruptedText('✓ Renseigné'), margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement après le statut réduit
    } else {
      // Afficher "Non renseigné" en rouge si pas de réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
      doc.text(cleanCorruptedText('✗ Non renseigné'), margin + 5, yPos + 1); // Décalage vertical réduit
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
    
    // Gestion du texte long pour la question - NETTOYER la question aussi
    const cleanedQuestion = cleanCorruptedText(q.label);
    const questionLines = doc.splitTextToSize(cleanedQuestion, pageWidth - 2 * margin - 10);
    doc.text(questionLines, margin + 5, yPos);
    
    yPos += questionLines.length * 5; // Ajuster l'espacement en fonction du nombre de lignes
    
    // Afficher la réponse si elle existe
    if (q.value) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      
      // Utiliser la fonction d'ajout de texte avec gestion de la pagination
      // Nettoyer le texte corrompu avant de l'afficher
      const cleanedValue = cleanCorruptedText(q.value);
      const textHeight = addWrappedText(
        cleanedValue, 
        margin, 
        yPos, 
        pageWidth - 2 * margin
      );
      
      yPos += textHeight + 2; // Espacement réduit après la réponse
      
      // Afficher le statut "Renseigné" en vert juste après la réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(22, 163, 74); // Vert pour "Renseigné"
      doc.text(cleanCorruptedText('✓ Renseigné'), margin + 5, yPos + 1); // Décalage vertical réduit
      yPos += 6; // Espacement après le statut réduit
    } else {
      // Afficher "Non renseigné" en rouge si pas de réponse
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Taille de police légèrement plus grande
      doc.setTextColor(239, 68, 68); // Rouge pour "Non renseigné"
      doc.text(cleanCorruptedText('✗ Non renseigné'), margin + 5, yPos + 1); // Décalage vertical réduit
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
