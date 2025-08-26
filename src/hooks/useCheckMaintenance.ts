import { MAINTENANCE_MODE, MAINTENANCE_HOURS } from '@/config/maintenance';

// Hook personnalisé pour vérifier si nous sommes en maintenance
export const useCheckMaintenance = (): boolean => {
  // Si le mode maintenance est activé manuellement, on retourne true
  if (MAINTENANCE_MODE) return true;

  // Sinon, on vérifie les heures de maintenance automatique
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return (
    (currentHour === MAINTENANCE_HOURS.start.hour && 
     currentMinute >= MAINTENANCE_HOURS.start.minute) ||
    (currentHour > MAINTENANCE_HOURS.start.hour && 
     currentHour < MAINTENANCE_HOURS.end.hour) ||
    (currentHour === MAINTENANCE_HOURS.end.hour && 
     currentMinute < MAINTENANCE_HOURS.end.minute)
  );
};
