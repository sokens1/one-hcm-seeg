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
  // MTP Questions
  metier1?: string;
  metier2?: string;
  metier3?: string;
  talent1?: string;
  talent2?: string;
  talent3?: string;
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
    { label: 'Nom Complet', value: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Non renseigné' },
    { label: 'Email', value: data.email || 'Non renseigné' },
    { 
      label: 'Date de Naissance', 
      value: data.dateOfBirth ? format(new Date(data.dateOfBirth), 'dd MMMM yyyy', { locale: fr }) : 'Non renseignée' 
    },
    { label: 'Sexe', value: data.gender || 'Non renseigné' },
    { label: 'Poste Actuel', value: data.currentPosition || 'Non renseigné' },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  personalInfo.forEach(info => {
    doc.setTextColor(31, 41, 55); // Gray-800
    doc.text(`${info.label}:`, margin, yPos);
    const status = info.value === 'Non renseigné' ? 'Non renseigné' : 'Renseigné';
    const statusX = pageWidth - margin - doc.getTextWidth(status);
    doc.text(status, statusX, yPos);
    doc.setTextColor(75, 85, 99); // Gray-600
    doc.text(info.value, margin + 60, yPos);
    yPos += 7;
  });

  // Documents Section
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('2. Documents', margin, yPos);
  yPos += 10;

  const documents = [
    { label: 'CV', value: data.cv?.name || 'Non fourni' },
    { label: 'Lettre de Motivation', value: data.coverLetter?.name || 'Non fournie' },
    { label: 'Lettre d\'Intégrité', value: data.integrityLetter?.name || 'Non fournie' },
    { label: 'Idée de Projet', value: data.projectIdea?.name || 'Non fournie' },
    { 
      label: 'Certificats', 
      value: data.certificates.length > 0 
        ? `${data.certificates.length} fichier(s)` 
        : 'Aucun fichier' 
    },
    { 
      label: 'Lettres de Recommandation', 
      value: data.recommendations.length > 0 
        ? `${data.recommendations.length} fichier(s)` 
        : 'Aucun fichier' 
    },
  ];

  doc.setFont('helvetica', 'normal');
  documents.forEach(docItem => {
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(`${docItem.label}:`, margin, yPos);
    
    const status = docItem.value.includes('Non fourn') || docItem.value.includes('Aucun') 
      ? 'Non renseigné' 
      : 'Renseigné';
      
    const statusX = pageWidth - margin - doc.getTextWidth(status);
    doc.text(status, statusX, yPos);
    
    doc.setTextColor(75, 85, 99);
    doc.text(docItem.value, margin + 60, yPos);
    yPos += 7;
    
    // Add a new page if we're near the bottom
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

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
    { label: '1. Compétences techniques', value: data.metier1 },
    { label: '2. Expérience professionnelle', value: data.metier2 },
    { label: '3. Défis techniques', value: data.metier3 },
  ];

  doc.setFont('helvetica', 'normal');
  metierQuestions.forEach((q, index) => {
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(q.label, margin + 5, yPos);
    
    const status = checkIfFilled(q.value);
    const statusX = pageWidth - margin - doc.getTextWidth(status);
    doc.text(status, statusX, yPos);
    
    if (q.value) {
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      const splitText = doc.splitTextToSize(q.value, pageWidth - 2 * margin - 10);
      doc.text(splitText, margin + 10, yPos + 5);
      yPos += 5 + (splitText.length * 4);
    } else {
      yPos += 7;
    }
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Talent
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(22, 163, 74); // Green-600
  doc.text('Talent', margin, yPos);
  yPos += 7;

  const talentQuestions = [
    { label: '1. Talent distinctif', value: data.talent1 },
    { label: '2. Impact du talent', value: data.talent2 },
    { label: '3. Exemple concret', value: data.talent3 },
  ];

  doc.setFont('helvetica', 'normal');
  talentQuestions.forEach((q, index) => {
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(q.label, margin + 5, yPos);
    
    const status = checkIfFilled(q.value);
    const statusX = pageWidth - margin - doc.getTextWidth(status);
    doc.text(status, statusX, yPos);
    
    if (q.value) {
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      const splitText = doc.splitTextToSize(q.value, pageWidth - 2 * margin - 10);
      doc.text(splitText, margin + 10, yPos + 5);
      yPos += 5 + (splitText.length * 4);
    } else {
      yPos += 7;
    }
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Paradigme
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(124, 58, 237); // Purple-600
  doc.text('Paradigme', margin, yPos);
  yPos += 7;

  const paradigmeQuestions = [
    { label: '1. Valeurs professionnelles', value: data.paradigme1 },
    { label: '2. Alignement avec OneHCM', value: data.paradigme2 },
    { label: '3. Contribution culturelle', value: data.paradigme3 },
  ];

  doc.setFont('helvetica', 'normal');
  paradigmeQuestions.forEach((q, index) => {
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(q.label, margin + 5, yPos);
    
    const status = checkIfFilled(q.value);
    const statusX = pageWidth - margin - doc.getTextWidth(status);
    doc.text(status, statusX, yPos);
    
    if (q.value) {
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      const splitText = doc.splitTextToSize(q.value, pageWidth - 2 * margin - 10);
      doc.text(splitText, margin + 10, yPos + 5);
      yPos += 5 + (splitText.length * 4);
    } else {
      yPos += 7;
    }
    
    if (yPos > 270) {
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
