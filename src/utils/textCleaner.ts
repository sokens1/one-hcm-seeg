// Utilitaire de nettoyage de texte pour corriger la corruption
// Cette fonction doit être appliquée à TOUS les textes venant de la base de données

export const cleanCorruptedText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  let cleaned = text;

  // 1. Nettoyer les entités HTML standard D'ABORD
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // 2. Supprimer toutes les autres entités HTML
  cleaned = cleaned.replace(/&[a-zA-Z0-9#]+;/g, '');

  // 3. Nettoyer TOUS les caractères '&' restants (correction agressive)
  // Ceci gère les cas comme '&& &R&e&n&s&e&i&g&n&é
  cleaned = cleaned.replace(/&/g, '');

  // 4. Supprimer les guillemets simples en début/fin si ils font partie de la corruption
  cleaned = cleaned.replace(/^'|'$/g, '');

  return cleaned.trim();
};

// Fonction pour nettoyer un objet entier
export const cleanObjectText = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return cleanCorruptedText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanObjectText);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanObjectText(value);
    }
    return cleaned;
  }
  
  return obj;
};

// Fonction spécifique pour nettoyer les réponses MTP
export const cleanMtpAnswers = (mtpAnswers: any): any => {
  if (!mtpAnswers) return mtpAnswers;
  
  return {
    metier: Array.isArray(mtpAnswers.metier) 
      ? mtpAnswers.metier.map(cleanCorruptedText)
      : mtpAnswers.metier,
    talent: Array.isArray(mtpAnswers.talent) 
      ? mtpAnswers.talent.map(cleanCorruptedText)
      : mtpAnswers.talent,
    paradigme: Array.isArray(mtpAnswers.paradigme) 
      ? mtpAnswers.paradigme.map(cleanCorruptedText)
      : mtpAnswers.paradigme,
  };
};
