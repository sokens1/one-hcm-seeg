/**
 * Utilitaires pour la gestion des dates et fuseaux horaires
 * Résout les problèmes de décalage de jour lors de la conversion UTC/local
 */

/**
 * Convertit une date locale en ISO string sans décalage de fuseau horaire
 * @param date - Date locale (format YYYY-MM-DD)
 * @param time - Heure locale (format HH:MM:SS)
 * @returns ISO string de la date/heure locale
 */
export function localDateTimeToISO(date: string, time: string): string {
  // Créer la date locale directement sans conversion UTC
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes, seconds] = time.split(':').map(Number);
  
  // Créer une date locale (sans conversion UTC)
  const localDateTime = new Date(year, month - 1, day, hours, minutes, seconds || 0);
  
  // Retourner au format ISO mais en gardant l'heure locale
  return localDateTime.toISOString();
}

/**
 * Convertit une date ISO en date locale pour l'affichage
 * @param isoString - Date au format ISO
 * @returns Date locale corrigée
 */
export function isoToLocalDate(isoString: string): Date {
  const date = new Date(isoString);
  // Compenser le décalage de fuseau horaire pour l'affichage
  const correctedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  return correctedDate;
}

/**
 * Formate une date ISO en date locale française
 * @param isoString - Date au format ISO
 * @returns Date formatée en français (DD/MM/YYYY)
 */
export function formatLocalDate(isoString: string): string {
  if (!isoString) return '';
  
  // Si la date est déjà au format YYYY-MM-DD, la retourner directement
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    const date = new Date(isoString + 'T00:00:00');
    return date.toLocaleDateString('fr-FR');
  }
  
  // Pour les dates ISO complètes, appliquer la correction de fuseau horaire
  const date = new Date(isoString);
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    console.warn('Date invalide:', isoString);
    return '';
  }
  
  // Appliquer la correction de fuseau horaire
  const correctedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  return correctedDate.toLocaleDateString('fr-FR');
}

/**
 * Formate une date ISO en date et heure locale française
 * @param isoString - Date au format ISO
 * @returns Date et heure formatées en français
 */
export function formatLocalDateTime(isoString: string): string {
  const correctedDate = isoToLocalDate(isoString);
  return correctedDate.toLocaleString('fr-FR');
}
