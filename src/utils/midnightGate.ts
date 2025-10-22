// Utilitaire pour gérer la désactivation des fonctionnalités externes après minuit
// Désactive les inscriptions externes et les candidatures externes après minuit

/**
 * Vérifie si on est après la date de fermeture des candidatures externes
 * @param now Date actuelle (par défaut: new Date())
 * @returns true si on est après la date de fermeture, false sinon
 */
export function isAfterMidnight(now: Date = new Date()): boolean {
  // Date de fermeture des candidatures externes : 22/10/2025 à 00h00
  const closingDate = new Date("2025-10-22T00:00:00+01:00");
  
  // Si on est après la date de fermeture, les candidatures sont fermées
  return now >= closingDate;
}

/**
 * Vérifie si les inscriptions externes doivent être désactivées
 * @param now Date actuelle (par défaut: new Date())
 * @returns true si les inscriptions externes doivent être désactivées
 */
export function isExternalRegistrationDisabled(now: Date = new Date()): boolean {
  return isAfterMidnight(now);
}

/**
 * Vérifie si les candidatures externes doivent être désactivées
 * @param now Date actuelle (par défaut: new Date())
 * @returns true si les candidatures externes doivent être désactivées
 */
export function isExternalApplicationDisabled(now: Date = new Date()): boolean {
  return isAfterMidnight(now);
}

/**
 * Retourne un message d'information pour les fonctionnalités désactivées
 * @returns Message à afficher
 */
export function getDisabledMessage(): string {
  return "Les candidatures externes sont fermées après minuit.";
}
