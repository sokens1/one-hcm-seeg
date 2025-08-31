// Configuration de maintenance manuelle
// Mettez à true pour activer la maintenance, false pour la désactiver
export const MAINTENANCE_MODE = false;

// Heures de maintenance (pour référence)
export const MAINTENANCE_HOURS = {
  start: { hour: 9, minute: 0 },   // 08:55
  end:   { hour: 0, minute: 40 }    // 00:40 (le lendemain ?)
};

// Message de maintenance personnalisé
export const MAINTENANCE_MESSAGE = "Nous effectuons actuellement une maintenance programmée. Le service sera de retour sous peu.";
