import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TARGETED_JOB_TITLES = [
  'Directeur Audit & Contrôle interne',
  'Directeur des Systèmes d\'Information',
  'Directeur Juridique, Communication & RSE',
];

export interface CampaignDetailedStats {
  // Statistiques générales
  total_jobs: number;
  total_candidates: number;
  total_applications: number;
  
  // Données par poste
  applications_per_job: Array<{
    job_id: string;
    job_title: string;
    candidate_count: number;
    application_count: number;
  }>;
  
  // Répartition par type de métier
  distribution_by_type: Array<{
    type: string;
    positions: number;
    applications: number;
    percentage: number;
  }>;
  
  // Évolution des statuts par jour
  status_evolution: Array<{
    date: string;
    candidature: number;
    incubation: number;
    embauche: number;
    refuse: number;
  }>;
  
  // Répartition par genre
  gender_distribution: Array<{
    gender: string;
    count: number;
    percentage: number;
  }>;
  
  // Candidats multi-postes
  multi_position_candidates: number;
  
  // Entretiens planifiés
  planned_interviews: number;
  
  // Attractivité des postes
  job_attractiveness: Array<{
    job_title: string;
    applications_count: number;
    attractiveness_level: 'Forte' | 'Bonne' | 'Modérée' | 'Faible';
  }>;
  
  // Dynamique des candidatures
  application_dynamics: Array<{
    job_title: string;
    total_applications: number;
    last_24h_applications: number;
  }>;
}

export function useCampaignDetailedStats() {
  return useQuery({
    queryKey: ['campaignDetailedStats'],
    queryFn: async (): Promise<CampaignDetailedStats> => {
      // Récupérer les offres ciblées
      const { data: jobOffers, error: jobOffersError } = await supabase
        .from('job_offers')
        .select('id, title, department, created_at, status')
        .in('title', TARGETED_JOB_TITLES);

      if (jobOffersError) {
        console.error('Erreur lors de la récupération des offres ciblées:', jobOffersError);
        throw new Error('Failed to fetch targeted job offers');
      }

      console.log('Offres trouvées:', jobOffers);
      console.log('Titres recherchés:', TARGETED_JOB_TITLES);

      // Filtrer les offres actives
      const activeJobOffers = jobOffers?.filter(job => job.status === 'active') || [];
      const jobOfferIds = activeJobOffers.map(job => job.id);

      console.log('Offres actives:', activeJobOffers);
      console.log('IDs des offres:', jobOfferIds);

      // Si aucune offre active n'est trouvée, retourner les données par défaut avec les 3 offres ciblées
      if (jobOfferIds.length === 0) {
        console.log('Aucune offre active trouvée, retour des données par défaut');
        return {
          total_jobs: 3, // Les 3 offres ciblées
          total_candidates: 0,
          total_applications: 0,
          applications_per_job: [
            {
              job_id: 'default-audit',
              job_title: 'Directeur Audit & Contrôle interne',
              candidate_count: 0,
              application_count: 0
            },
            {
              job_id: 'default-si',
              job_title: 'Directeur des Systèmes d\'Information',
              candidate_count: 0,
              application_count: 0
            },
            {
              job_id: 'default-juridique',
              job_title: 'Directeur Juridique, Communication & RSE',
              candidate_count: 0,
              application_count: 0
            }
          ],
          distribution_by_type: [
            {
              type: 'Audit & Contrôle',
              positions: 1,
              applications: 0,
              percentage: 0
            },
            {
              type: 'Systèmes d\'Information',
              positions: 1,
              applications: 0,
              percentage: 0
            },
            {
              type: 'Juridique & RSE',
              positions: 1,
              applications: 0,
              percentage: 0
            }
          ],
          status_evolution: [],
          gender_distribution: [],
          multi_position_candidates: 0,
          planned_interviews: 0,
          job_attractiveness: [
            {
              job_title: 'Directeur Audit & Contrôle interne',
              applications_count: 0,
              attractiveness_level: 'Faible' as const
            },
            {
              job_title: 'Directeur des Systèmes d\'Information',
              applications_count: 0,
              attractiveness_level: 'Faible' as const
            },
            {
              job_title: 'Directeur Juridique, Communication & RSE',
              applications_count: 0,
              attractiveness_level: 'Faible' as const
            }
          ],
          application_dynamics: [
            {
              job_title: 'Directeur Audit & Contrôle interne',
              total_applications: 0,
              last_24h_applications: 0
            },
            {
              job_title: 'Directeur des Systèmes d\'Information',
              total_applications: 0,
              last_24h_applications: 0
            },
            {
              job_title: 'Directeur Juridique, Communication & RSE',
              total_applications: 0,
              last_24h_applications: 0
            }
          ]
        };
      }

      // Récupérer les candidatures pour ces offres (créées après le 27/09/2025)
      const campaignStartDate = '2025-09-27T00:00:00.000Z';
      
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          id,
          candidate_id,
          job_offer_id,
          status,
          created_at,
          users!inner(
            id,
            created_at,
            first_name,
            last_name,
            gender
          )
        `)
        .in('job_offer_id', jobOfferIds)
        .gte('created_at', campaignStartDate);

      if (applicationsError) {
        console.error('Erreur lors de la récupération des candidatures:', applicationsError);
        throw new Error('Failed to fetch applications');
      }

      // Calculer les statistiques
      const totalApplications = applications?.length || 0;
      const uniqueCandidateIds = new Set(applications?.map(app => app.candidate_id));
      const totalCandidates = uniqueCandidateIds.size;

      // Applications par poste
      const applicationsPerJobMap = new Map();
      jobOffers?.forEach(job => {
        applicationsPerJobMap.set(job.id, {
          job_id: job.id,
          job_title: job.title,
          candidate_count: 0,
          application_count: 0
        });
      });

      applications?.forEach(app => {
        const entry = applicationsPerJobMap.get(app.job_offer_id);
        if (entry) {
          entry.application_count++;
        }
      });

      // Compter les candidats uniques par poste
      const candidatesPerJob = new Map();
      applications?.forEach(app => {
        if (!candidatesPerJob.has(app.job_offer_id)) {
          candidatesPerJob.set(app.job_offer_id, new Set());
        }
        candidatesPerJob.get(app.job_offer_id).add(app.candidate_id);
      });

      candidatesPerJob.forEach((candidateSet, jobId) => {
        const entry = applicationsPerJobMap.get(jobId);
        if (entry) {
          entry.candidate_count = candidateSet.size;
        }
      });

      const applicationsPerJob = Array.from(applicationsPerJobMap.values());

      // Répartition par type de métier
      const distributionByType = [
        {
          type: 'Audit & Contrôle',
          positions: 1,
          applications: applicationsPerJob.find(job => job.job_title.includes('Audit'))?.application_count || 0,
          percentage: 0
        },
        {
          type: 'Systèmes d\'Information',
          positions: 1,
          applications: applicationsPerJob.find(job => job.job_title.includes('Systèmes'))?.application_count || 0,
          percentage: 0
        },
        {
          type: 'Juridique & RSE',
          positions: 1,
          applications: applicationsPerJob.find(job => job.job_title.includes('Juridique'))?.application_count || 0,
          percentage: 0
        }
      ];

      // Calculer les pourcentages
      const totalApps = distributionByType.reduce((sum, type) => sum + type.applications, 0);
      distributionByType.forEach(type => {
        type.percentage = totalApps > 0 ? Math.round((type.applications / totalApps) * 100) : 0;
      });

      // Évolution des statuts par jour (7 derniers jours)
      const statusEvolution = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayApplications = applications?.filter(app => 
          app.created_at.startsWith(dateStr)
        ) || [];

        const statusCounts = {
          candidature: 0,
          incubation: 0,
          embauche: 0,
          refuse: 0
        };

        dayApplications.forEach(app => {
          if (app.status in statusCounts) {
            statusCounts[app.status as keyof typeof statusCounts]++;
          }
        });

        statusEvolution.push({
          date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          ...statusCounts
        });
      }

      // Répartition par genre
      const genderCounts = new Map<string, number>();
      applications?.forEach(app => {
        const gender = app.users?.gender || 'Non spécifié';
        genderCounts.set(gender, (genderCounts.get(gender) || 0) + 1);
      });

      const genderDistribution = Array.from(genderCounts.entries()).map(([gender, count]) => ({
        gender: gender === 'M' ? 'Hommes' : gender === 'F' ? 'Femmes' : 'Non spécifié',
        count,
        percentage: totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0
      }));

      // Candidats multi-postes
      const candidateApplicationCounts = new Map<string, number>();
      applications?.forEach(app => {
        const count = candidateApplicationCounts.get(app.candidate_id) || 0;
        candidateApplicationCounts.set(app.candidate_id, count + 1);
      });
      const multiPositionCandidates = Array.from(candidateApplicationCounts.values()).filter(count => count > 1).length;

      // Attractivité des postes
      const jobAttractiveness = applicationsPerJob.map(job => {
        let level: 'Forte' | 'Bonne' | 'Modérée' | 'Faible';
        if (job.application_count >= 10) level = 'Forte';
        else if (job.application_count >= 7) level = 'Bonne';
        else if (job.application_count >= 4) level = 'Modérée';
        else level = 'Faible';

        return {
          job_title: job.job_title,
          applications_count: job.application_count,
          attractiveness_level: level
        };
      });

      // Dynamique des candidatures (total et dernières 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const applicationDynamics = applicationsPerJob.map(job => {
        const jobApplications = applications?.filter(app => app.job_offer_id === job.job_id) || [];
        const last24hApplications = jobApplications.filter(app => 
          app.created_at.startsWith(yesterdayStr)
        ).length;

        return {
          job_title: job.job_title,
          total_applications: job.application_count,
          last_24h_applications: last24hApplications
        };
      });

      return {
        total_jobs: jobOffers?.length || 0,
        total_candidates: totalCandidates,
        total_applications: totalApplications,
        applications_per_job: applicationsPerJob,
        distribution_by_type: distributionByType,
        status_evolution: statusEvolution,
        gender_distribution: genderDistribution,
        multi_position_candidates: multiPositionCandidates,
        planned_interviews: 0, // À implémenter si nécessaire
        job_attractiveness: jobAttractiveness,
        application_dynamics: applicationDynamics
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
