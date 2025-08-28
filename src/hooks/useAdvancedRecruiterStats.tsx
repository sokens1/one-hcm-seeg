import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedStats {
  totalApplications: number;
  coverageRate: number;
  openPositions: number;
  applicationsByPosition: Array<{
    position: string;
    count: number;
    target: number;
  }>;
  statusEvolution: Array<{
    month: string;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  }>;
  applicationsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

export function useAdvancedRecruiterStats(activeJobsCount: number) {
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalise les statuts hétérogènes provenant de la BDD/RPC
  const normalizeStatus = (s?: string): 'applied' | 'interview' | 'offer' | 'rejected' => {
    const v = (s || '').toLowerCase();
    if (['applied', 'pending', 'new', 'nouveau'].includes(v)) return 'applied';
    if (['interview', 'incubation', 'entretien', 'scheduled'].includes(v)) return 'interview';
    if (['offer', 'offre', 'offered', 'hired', 'embauche'].includes(v)) return 'offer';
    if (['rejected', 'refused', 'refuse', 'rejeté', 'rejetee'].includes(v)) return 'rejected';
    return 'applied';
  };

  const loadStats = useCallback(async () => {
    if (activeJobsCount === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer toutes les candidatures (structure: { application_details, job_offer_details, candidate_details })
      const { data: applicationsData, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');
      
      if (rpcError) {
        throw rpcError;
      }
      
      if (applicationsData) {
        // Unifier les données nécessaires en combinant application + offre
        const applications = applicationsData.map((row: {
          application_details: { status?: string; created_at: string };
          job_offer_details: { title?: string };
        }) => ({
          created_at: row.application_details.created_at,
          // Normaliser le statut vers les clés de nos graphes
          status: normalizeStatus(row.application_details.status),
          position: row.job_offer_details?.title || 'Poste inconnu',
        }));
        
        // Calculer le taux de couverture par poste
        const positionStats = new Map<string, { count: number; target: number }>();
        const statusCounts = new Map<string, number>();
        const monthlyStats = new Map<string, { applied: number; interview: number; offer: number; rejected: number }>();
        
        applications.forEach((app) => {
          const position = app.position;
          const status = app.status;
          // Bucket par mois (Mon AAAA) pour stabilité et tri potentiel
          const date = new Date(app.created_at);
          const month = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
          
          // Compter par position
          if (!positionStats.has(position)) {
            positionStats.set(position, { count: 0, target: 1 });
          }
          positionStats.get(position)!.count++;
          
          // Compter par statut
          statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
          
          // Compter par mois et statut
          if (!monthlyStats.has(month)) {
            monthlyStats.set(month, { applied: 0, interview: 0, offer: 0, rejected: 0 });
          }
          const monthData = monthlyStats.get(month)!;
          switch (status) {
            case 'applied':
              monthData.applied++;
              break;
            case 'interview':
              monthData.interview++;
              break;
            case 'offer':
              monthData.offer++;
              break;
            case 'rejected':
              monthData.rejected++;
              break;
            default:
              monthData.applied++;
          }
        });
        
        // Calculer les métriques finales
        const totalApplications = applications.length;
        const openPositions = activeJobsCount;
        const coverageRate = openPositions > 0 ? Math.round((totalApplications / openPositions) * 100) : 0;
        
        // Convertir les données pour l'affichage
        const applicationsByPosition = Array.from(positionStats.entries()).map(([position, data]) => ({
          position,
          count: data.count,
          target: data.target
        })).sort((a, b) => b.count - a.count);
        
        const statusEvolution = Array.from(monthlyStats.entries()).map(([month, data]) => ({
          month,
          ...data,
        }));
        
        const applicationsByStatus = [
          { status: 'Candidatures', count: statusCounts.get('applied') || 0, percentage: 0, color: '#3B82F6' },
          { status: 'Entretiens', count: statusCounts.get('interview') || 0, percentage: 0, color: '#10B981' },
          { status: 'Offres', count: statusCounts.get('offer') || 0, percentage: 0, color: '#F59E0B' },
          { status: 'Rejetées', count: statusCounts.get('rejected') || 0, percentage: 0, color: '#EF4444' },
        ];
        
        // Calculer les pourcentages
        applicationsByStatus.forEach(status => {
          status.percentage = totalApplications > 0 ? Math.round((status.count / totalApplications) * 100) : 0;
        });
        
        setStats({
          totalApplications,
          coverageRate,
          openPositions,
          applicationsByPosition,
          statusEvolution,
          applicationsByStatus
        });
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques avancées:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [activeJobsCount]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refetch = () => {
    loadStats();
  };

  return {
    stats,
    isLoading,
    error,
    refetch
  };
}
