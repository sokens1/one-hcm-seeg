// Utilitaire pour gérer la désactivation des fonctionnalités externes après minuit
// Désactive les inscriptions externes et les candidatures externes après minuit
// Désactive les inscriptions internes et les candidatures internes après minuit

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
 * Vérifie si on est après la date de fermeture des candidatures internes
 * @param now Date actuelle (par défaut: new Date())
 * @returns true si on est après la date de fermeture, false sinon
 */
export function isAfterMidnightInternal(now: Date = new Date()): boolean {
  // Date de fermeture des candidatures internes : 26/10/2025 à 23h59
  const closingDate = new Date("2025-10-26T23:59:59+01:00");
  
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
 * Vérifie si les inscriptions internes doivent être désactivées
 * @param now Date actuelle (par défaut: new Date())
 * @returns true si les inscriptions internes doivent être désactivées
 */
export function isInternalRegistrationDisabled(now: Date = new Date()): boolean {
  return isAfterMidnightInternal(now);
}

/**
 * Vérifie si les candidatures internes doivent être désactivées
 * @param now Date actuelle (par défaut: new Date())
 * @returns true si les candidatures internes doivent être désactivées
 */
export function isInternalApplicationDisabled(now: Date = new Date()): boolean {
  return isAfterMidnightInternal(now);
}

/**
 * Retourne un message d'information pour les fonctionnalités externes désactivées
 * @returns Message à afficher
 */
export function getDisabledMessage(): string {
  return "Les candidatures externes sont fermées après minuit.";
}

/**
 * Retourne un message d'information pour les fonctionnalités internes désactivées
 * @returns Message à afficher
 */
export function getInternalDisabledMessage(): string {
  return "Les candidatures internes sont fermées après 23h59 le 26/10/2025.";
}
