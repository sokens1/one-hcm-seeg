// Utilitaires pour la validation et la récupération d'email

/**
 * Regex pour valider le format d'un email
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valide le format d'un email
 * @param email - L'email à valider
 * @returns true si l'email est valide, false sinon
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Nettoie et valide un email
 * @param email - L'email à nettoyer et valider
 * @returns L'email nettoyé ou null si invalide
 */
export const cleanAndValidateEmail = (email: string): string | null => {
  if (!email || typeof email !== 'string') return null;
  
  const cleanedEmail = email.trim();
  return isValidEmail(cleanedEmail) ? cleanedEmail : null;
};

/**
 * Récupère l'email du candidat avec priorité
 * @param formEmail - Email saisi dans le formulaire
 * @param userEmail - Email de l'utilisateur authentifié
 * @param dbEmail - Email depuis la base de données
 * @returns L'email valide avec la priorité la plus élevée, ou null si aucun email valide
 */
export const getCandidateEmail = (
  formEmail?: string,
  userEmail?: string,
  dbEmail?: string
): string | null => {
  // Priorité 1: Email du formulaire
  if (formEmail) {
    const validEmail = cleanAndValidateEmail(formEmail);
    if (validEmail) return validEmail;
  }
  
  // Priorité 2: Email de l'utilisateur authentifié
  if (userEmail) {
    const validEmail = cleanAndValidateEmail(userEmail);
    if (validEmail) return validEmail;
  }
  
  // Priorité 3: Email depuis la base de données
  if (dbEmail) {
    const validEmail = cleanAndValidateEmail(dbEmail);
    if (validEmail) return validEmail;
  }
  
  return null;
};

/**
 * Génère un message d'erreur pour un email invalide
 * @param email - L'email à vérifier
 * @returns Le message d'erreur ou null si l'email est valide
 */
export const getEmailErrorMessage = (email: string): string | null => {
  if (!email.trim()) {
    return "L'email est requis pour recevoir la confirmation de candidature";
  }
  
  if (!isValidEmail(email)) {
    return "Veuillez saisir un email valide (ex: nom@entreprise.com)";
  }
  
  return null;
};

/**
 * Vérifie si un email peut être utilisé pour l'envoi
 * @param email - L'email à vérifier
 * @returns true si l'email peut être utilisé, false sinon
 */
export const canSendEmail = (email: string): boolean => {
  return isValidEmail(email);
};
