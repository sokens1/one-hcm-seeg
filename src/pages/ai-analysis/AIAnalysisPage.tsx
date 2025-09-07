import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Search, Filter, TrendingUp, Users, Award, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RecruiterLayout } from '@/components/layout/RecruiterLayout';

// Types pour les données d'évaluation
interface ConformiteData {
  score_conformité: number;
  commentaire: string;
}

interface MTPData {
  scores: {
    Métier: number;
    Talent: number;
    Paradigme: number;
    Moyen: number;
  };
  niveau: string;
  verdict: string;
  points_forts: string[];
  points_a_travailler: string[];
  rang: number;
}

interface SimilariteData {
  score: number;
  commentaire_score: string;
  forces: string[];
  faiblesses: string[];
  verdict: string;
  rang: number;
}

interface ResumeGlobalData {
  score_global: number;
  commentaire_global: string;
  forces: string | string[];
  points_a_ameliorer: string | string[];
  verdict: string;
  rang_global: number;
}

interface CandidateData {
  conformite?: {
    "score de conformité": ConformiteData;
  };
  mtp?: {
    "score MTP": MTPData;
  };
  similarite_offre?: {
    "score de complétude": SimilariteData;
  };
  resume_global: ResumeGlobalData;
}

interface JobOffer {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
}

// Mapping des postes vers les fichiers JSON (gestion de la casse)
const JOB_TO_FILE_MAPPING: Record<string, string> = {
  // Ajouter d'autres mappings selon les fichiers disponibles
};

// Fonction pour normaliser les noms de postes (gestion de la casse et accents)
const normalizeJobTitle = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s]/g, '') // Supprimer la ponctuation
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
};

// Fonction pour trouver le fichier correspondant à un poste
const findJobFile = (jobTitle: string): string | null => {
  const normalizedTitle = normalizeJobTitle(jobTitle);
  
  for (const [key, file] of Object.entries(JOB_TO_FILE_MAPPING)) {
    if (normalizeJobTitle(key) === normalizedTitle) {
      return file;
    }
  }
  
  return null;
};

// Données des offres d'emploi (simulées depuis le CSV)
const JOB_OFFERS: JobOffer[] = [
  { id: "737260aa-b155-443f-b21d-58bcbf8d151a", title: "Directeur Technique Eau", department: "Eau", location: "Libreville", status: "active" },
  { id: "391ccc64-2ee5-464f-942d-26df1719eeb6", title: "Chef de Département Eau", department: "Eau", location: "Libreville", status: "active" },
  { id: "02108894-2219-4f32-8efa-942288a67495", title: "Directeur Exploitation Electricité", department: "Électricité", location: "Libreville", status: "active" },
  { id: "f4b7df17-95ac-4252-b057-e3503d072364", title: "Chef de Département Electricité", department: "Électricité", location: "Libreville", status: "active" },
  { id: "b74da020-0a51-41b3-94e6-b9721d0ecf5d", title: "Directeur Technique Electricité", department: "Électricité", location: "Libreville", status: "active" },
  { id: "f426f59a-97b5-4bd1-b260-165dec5362bf", title: "Directeur Moyens Généraux", department: "Support", location: "Libreville", status: "active" },
  { id: "c34e8321-c9ab-4884-902d-ce19d977bd90", title: "Directeur Commercial et Recouvrement", department: "Support", location: "Libreville", status: "active" },
  { id: "707a8b92-4043-44c9-8a52-6c5b09cbb74c", title: "Coordonnateur des Régions", department: "Support", location: "Libreville", status: "active" },
  { id: "2f62f69e-8f00-4d5d-9f5b-f37462a55dee", title: "Directeur Audit & Contrôle interne", department: "Support", location: "Libreville", status: "active" },
  { id: "436331ac-ce6e-428c-bbb6-dad1841f8e85", title: "Directeur Qualité, Hygiène, Sécurité & Environnement", department: "Support", location: "Libreville", status: "active" },
  { id: "41112afb-d778-4c2b-bb86-f9ee3b6ca5a4", title: "Directeur des Systèmes d'Information", department: "Support", location: "Libreville", status: "active" },
  { id: "3dc73269-03b2-42cb-a608-2943ed45731b", title: "Chef de Département Support", department: "Support", location: "Libreville", status: "active" },
  { id: "c5a649a7-8230-4f89-ac5d-55f2464421e1", title: "Directeur du Capital Humain", department: "Support", location: "Libreville", status: "active" },
  { id: "42d50462-fa96-4e5d-888e-5bf82c9a3482", title: "Directeur Juridique, Communication & RSE", department: "Support", location: "Libreville", status: "active" },
  { id: "90d01e79-ec95-40a6-9f78-9919f9a37073", title: "Directeur Finances et Comptabilité", department: "Support", location: "Libreville", status: "active" },
  { id: "ee373d45-efcb-43e0-89ef-0983ac50d8da", title: "Directeur Exploitation Eau", department: "Eau", location: "Libreville", status: "active" },
];

export default function AIAnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidatesData, setCandidatesData] = useState<Record<string, CandidateData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Log des fichiers disponibles au chargement
  useEffect(() => {
    console.log('📁 Fichiers JSON disponibles:', Object.values(JOB_TO_FILE_MAPPING));
    console.log('📋 Postes disponibles:', JOB_OFFERS.map(j => j.title));
  }, []);

  // Charger les données d'évaluation
  const loadEvaluationData = useCallback(async (jobTitle: string) => {
    setIsLoading(true);
    try {
      const fileName = findJobFile(jobTitle);
      if (!fileName) {
        toast({
          title: "Erreur",
          description: `Aucune donnée d'évaluation disponible pour le poste "${jobTitle}"`,
          variant: "destructive",
        });
        return;
      }

      console.log(`📁 Chargement des données pour: ${jobTitle} -> ${fileName}`);
      
      // Charger les vraies données depuis le fichier JSON
      const response = await fetch(`/${fileName}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Données chargées:`, data);
        setCandidatesData(data);
      } else {
        console.error(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);
        toast({
          title: "Erreur",
          description: `Impossible de charger le fichier ${fileName}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'évaluation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Récupérer le poste depuis les paramètres URL (depuis EvaluationDashboard)
  useEffect(() => {
    const jobFromParams = searchParams.get('job');
    if (jobFromParams) {
      console.log(`🔍 Recherche du poste: "${jobFromParams}"`);
      
      // Trouver l'ID du job correspondant au titre (gestion de la casse)
      const job = JOB_OFFERS.find(j => normalizeJobTitle(j.title) === normalizeJobTitle(jobFromParams));
      if (job) {
        console.log(`✅ Poste trouvé: ${job.title} (ID: ${job.id})`);
        setSelectedJob(job.id);
        loadEvaluationData(job.title);
      } else {
        console.log(`❌ Aucun poste trouvé pour: "${jobFromParams}"`);
        // Essayer de charger directement avec le titre fourni
        loadEvaluationData(jobFromParams);
      }
    }
  }, [searchParams, loadEvaluationData]);

  // Calculer le score global pondéré
  const calculateGlobalScore = (candidate: CandidateData): number => {
    const conformiteScore = candidate.conformite?.["score de conformité"]?.score_conformité || 0;
    const mtpScore = candidate.mtp?.["score MTP"]?.scores?.Moyen || 0;
    const similariteScore = candidate.similarite_offre?.["score de complétude"]?.score || 0;
    const completedScore = candidate.resume_global?.score_global || 0;

    // Pondération : Conformité 5%, MTP 25%, Feedback 50%, Completed 20%
    const globalScore = (
      (conformiteScore * 0.05) +
      (mtpScore * 100 * 0.25) +
      (similariteScore * 10 * 0.50) +
      (completedScore * 100 * 0.20)
    );

    return Math.round(globalScore);
  };

  // Filtrer les candidats
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return Object.entries(candidatesData);
    
    return Object.entries(candidatesData).filter(([name, data]) => {
      const fullName = name.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [candidatesData, searchTerm]);

  // Trier les candidats par score global
  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort(([, a], [, b]) => {
      const scoreA = calculateGlobalScore(a);
      const scoreB = calculateGlobalScore(b);
      return scoreB - scoreA;
    });
  }, [filteredCandidates]);

  const handleJobChange = (jobId: string) => {
    console.log(`🔄 Changement de poste sélectionné: ${jobId}`);
    setSelectedJob(jobId);
    const job = JOB_OFFERS.find(j => j.id === jobId);
    if (job) {
      console.log(`📋 Poste trouvé: ${job.title}`);
      loadEvaluationData(job.title);
    } else {
      console.error(`❌ Aucun poste trouvé avec l'ID: ${jobId}`);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'retenu':
      case 'favorable':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'mitigé':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'non retenu':
      case 'rejeté':
      case 'défavorable':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'retenu':
      case 'favorable':
        return 'bg-green-100 text-green-800';
      case 'mitigé':
        return 'bg-yellow-100 text-yellow-800';
      case 'non retenu':
      case 'rejeté':
      case 'défavorable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analyse IA des Candidats</h1>
            <p className="text-gray-600 mt-1">Évaluation automatisée et analyse des profils candidats</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Powered by AI</span>
          </div>
        </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un poste
              </label>
              <Select value={selectedJob} onValueChange={handleJobChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un poste à analyser" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_OFFERS.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un candidat
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nom du candidat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      {selectedJob && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Candidats</p>
                  <p className="text-2xl font-bold text-gray-900">{sortedCandidates.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Moyenne Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedCandidates.length > 0 
                      ? Math.round(sortedCandidates.reduce((acc, [, data]) => acc + calculateGlobalScore(data), 0) / sortedCandidates.length)
                      : 0
                    }%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Retenus</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedCandidates.filter(([, data]) => 
                      data.resume_global?.verdict?.toLowerCase().includes('retenu') || 
                      data.resume_global?.verdict?.toLowerCase().includes('favorable')
                    ).length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sortedCandidates.filter(([, data]) => 
                      data.resume_global?.verdict?.toLowerCase().includes('mitigé')
                    ).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des candidats */}
      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Résultats d'Analyse
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedCandidates.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun candidat trouvé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCandidates.map(([name, data], index) => {
                  const globalScore = calculateGlobalScore(data);
                  const conformiteScore = data.conformite?.["score de conformité"]?.score_conformité || 0;
                  const mtpScore = data.mtp?.["score MTP"]?.scores?.Moyen || 0;
                  const similariteScore = data.similarite_offre?.["score de complétude"]?.score || 0;
                  const completedScore = data.resume_global?.score_global || 0;

                  return (
                    <Card key={name} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Informations principales */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getVerdictColor(data.resume_global?.verdict || '')}>
                                    {getVerdictIcon(data.resume_global?.verdict || '')}
                                    {data.resume_global?.verdict || 'Non évalué'}
                                  </Badge>
                                  <Badge variant="outline">Rang #{data.resume_global?.rang_global || index + 1}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-blue-600">{globalScore}%</div>
                                <div className="text-sm text-gray-600">Score Global</div>
                              </div>
                            </div>

                            {/* Scores détaillés */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div>
                                <div className="text-sm text-gray-600 mb-1">Conformité (5%)</div>
                                <Progress value={conformiteScore} className="h-2" />
                                <div className="text-xs text-gray-500 mt-1">{conformiteScore}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 mb-1">MTP (25%)</div>
                                <Progress value={mtpScore * 100} className="h-2" />
                                <div className="text-xs text-gray-500 mt-1">{Math.round(mtpScore * 100)}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 mb-1">Feedback (50%)</div>
                                <Progress value={similariteScore * 10} className="h-2" />
                                <div className="text-xs text-gray-500 mt-1">{Math.round(similariteScore * 10)}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 mb-1">Completed (20%)</div>
                                <Progress value={completedScore * 100} className="h-2" />
                                <div className="text-xs text-gray-500 mt-1">{Math.round(completedScore * 100)}%</div>
                              </div>
                            </div>

                            {/* Commentaire global */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">
                                {data.resume_global?.commentaire_global || 'Aucun commentaire disponible'}
                              </p>
                            </div>
                          </div>

                          {/* Détails dans les onglets */}
                          <div className="w-full lg:w-96">
                            <Tabs defaultValue="forces" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="forces">Points Forts</TabsTrigger>
                                <TabsTrigger value="ameliorer">À Améliorer</TabsTrigger>
                                <TabsTrigger value="details">Détails</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="forces" className="mt-4">
                                <div className="space-y-2">
                                  {data.mtp?.["score MTP"]?.points_forts?.map((point, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-gray-700">{point}</span>
                                    </div>
                                  )) || (
                                    <p className="text-sm text-gray-500">Aucun point fort identifié</p>
                                  )}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="ameliorer" className="mt-4">
                                <div className="space-y-2">
                                  {data.mtp?.["score MTP"]?.points_a_travailler?.map((point, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-gray-700">{point}</span>
                                    </div>
                                  )) || (
                                    <p className="text-sm text-gray-500">Aucun point d'amélioration identifié</p>
                                  )}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="details" className="mt-4">
                                <div className="space-y-3 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Score MTP:</span>
                                    <div className="ml-4 mt-1 space-y-1">
                                      <div>Métier: {Math.round((data.mtp?.["score MTP"]?.scores?.Métier || 0) * 100)}%</div>
                                      <div>Talent: {Math.round((data.mtp?.["score MTP"]?.scores?.Talent || 0) * 100)}%</div>
                                      <div>Paradigme: {Math.round((data.mtp?.["score MTP"]?.scores?.Paradigme || 0) * 100)}%</div>
                                      <div>Moyen: {Math.round((data.mtp?.["score MTP"]?.scores?.Moyen || 0) * 100)}%</div>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Similarité Offre:</span>
                                    <div className="ml-4 mt-1">
                                      {Math.round((data.similarite_offre?.["score de complétude"]?.score || 0) * 10)}%
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </RecruiterLayout>
  );
}
