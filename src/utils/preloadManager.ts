/**
 * Gestionnaire de préchargement intelligent
 * Précharge les données de manière optimisée selon les besoins de l'utilisateur
 */

import { seegAIService } from '@/integrations/seeg-ai-api';

interface PreloadTask {
  id: string;
  priority: 'high' | 'medium' | 'low';
  execute: () => Promise<void>;
  completed: boolean;
}

class PreloadManager {
  private tasks: PreloadTask[] = [];
  private isProcessing = false;
  private maxConcurrent = 2; // Nombre maximum de tâches simultanées

  /**
   * Ajouter une tâche de préchargement
   */
  addTask(id: string, priority: 'high' | 'medium' | 'low', execute: () => Promise<void>) {
    // Éviter les doublons
    if (this.tasks.some(task => task.id === id)) {
      return;
    }

    this.tasks.push({
      id,
      priority,
      execute,
      completed: false,
    });

    // Trier par priorité
    this.tasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Démarrer le traitement si ce n'est pas déjà en cours
    if (!this.isProcessing) {
      this.processTasks();
    }
  }

  /**
   * Traiter les tâches en file d'attente
   */
  private async processTasks() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.tasks.length > 0) {
      // Prendre les N premières tâches non complétées
      const tasksToProcess = this.tasks
        .filter(task => !task.completed)
        .slice(0, this.maxConcurrent);

      if (tasksToProcess.length === 0) break;

      // Exécuter les tâches en parallèle
      await Promise.allSettled(
        tasksToProcess.map(async task => {
          try {
            await task.execute();
            task.completed = true;
            console.log(`✅ [Preload] Tâche "${task.id}" complétée`);
          } catch (error) {
            console.error(`❌ [Preload] Erreur pour la tâche "${task.id}":`, error);
            task.completed = true; // Marquer comme complétée même en cas d'erreur
          }
        })
      );

      // Retirer les tâches complétées
      this.tasks = this.tasks.filter(task => !task.completed);

      // Attendre un peu avant la prochaine vague (éviter de surcharger)
      if (this.tasks.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Vider toutes les tâches
   */
  clear() {
    this.tasks = [];
    this.isProcessing = false;
  }

  /**
   * Obtenir le nombre de tâches en attente
   */
  getPendingCount(): number {
    return this.tasks.filter(task => !task.completed).length;
  }
}

// Instance globale
export const preloadManager = new PreloadManager();

/**
 * Précharger les données des candidats de manière intelligente
 */
export function preloadCandidatesData() {
  // Vérifier si l'API est disponible
  preloadManager.addTask(
    'health-check',
    'high',
    async () => {
      await seegAIService.checkHealth();
    }
  );

  // Précharger les données principales
  preloadManager.addTask(
    'candidates-main',
    'high',
    async () => {
      await seegAIService.getAllCandidates();
    }
  );
}

/**
 * Précharger les données pour un département spécifique
 */
export function preloadDepartmentData(departmentName: string) {
  preloadManager.addTask(
    `department-${departmentName}`,
    'medium',
    async () => {
      // Cette fonction dépendra de l'implémentation spécifique
      console.log(`Préchargement des données pour ${departmentName}`);
    }
  );
}

/**
 * Précharger de manière adaptative selon la connexion
 */
export async function adaptivePreload() {
  // Vérifier la vitesse de connexion
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  let shouldPreload = true;
  let maxConcurrent = 2;
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    const saveData = connection.saveData;
    
    // Ne pas précharger si "économie de données" est activée
    if (saveData) {
      console.log('📱 [Preload] Mode économie de données activé - Préchargement désactivé');
      return;
    }
    
    // Ajuster selon le type de connexion
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        shouldPreload = false;
        console.log('📱 [Preload] Connexion 2G - Préchargement désactivé');
        break;
      case '3g':
        maxConcurrent = 1;
        console.log('📱 [Preload] Connexion 3G - Préchargement limité');
        break;
      case '4g':
        maxConcurrent = 3;
        console.log('📱 [Preload] Connexion 4G - Préchargement optimisé');
        break;
      default:
        maxConcurrent = 2;
    }
  }
  
  if (shouldPreload) {
    preloadCandidatesData();
  }
}

/**
 * Hook React pour le préchargement
 */
export function usePreload() {
  return {
    preloadCandidatesData,
    preloadDepartmentData,
    adaptivePreload,
    getPendingCount: () => preloadManager.getPendingCount(),
    clear: () => preloadManager.clear(),
  };
}

