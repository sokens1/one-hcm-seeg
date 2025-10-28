/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { azureContainerAppsService, CandidateData, EvaluationRequest } from "@/integrations/azure-container-apps-api";
import { 
  Search, 
  Eye, 
  Filter,
  Brain,
  Users,
  Briefcase,
  Calendar,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  BarChart3,
  ArrowLeft,
  Loader2,
  MessageCircle
} from "lucide-react";
import { useSEEGAIData } from "@/hooks/useSEEGAIData";
import { AICandidateData } from "@/hooks/useAIData";
import { CAMPAIGN_MODE, CAMPAIGN_JOBS, CAMPAIGN_JOB_PATTERNS } from "@/config/campaign";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DataTable } from "@/components/ui/data-table";
import { createColumns, CandidateAIData } from "@/components/ai/columns";

interface CandidateApplication {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string; // Nom complet pour la recherche optimisée
  poste: string;
  department: string;
  aiData: AICandidateData;
  // Propriétés étendues du candidat mappé
  nom?: string;
  prenom?: string;
  first_name?: string;
  last_name?: string;
  rawData?: any;
  documents?: {
    cv?: string | { url?: string; name?: string };
    cover_letter?: string | { url?: string; name?: string };
  };
  cv?: string | { url?: string; name?: string };
  cover_letter?: string | { url?: string; name?: string };
  reponses_mtp?: {
    metier?: string[];
    talent?: string[];
    paradigme?: string[];
  };
  offre?: {
    intitule?: string;
  };
}

const getVerdictIcon = (verdict: string | undefined) => {
  if (!verdict) return <Clock className="h-4 w-4 text-gray-500" />;
  
  switch (verdict.toLowerCase()) {
    case 'retenu':
    case 'favorable':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'mitigé':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'défavorable':
    case 'non retenu':
    case 'rejeté':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getVerdictLabel = (verdict: string | undefined) => {
  if (!verdict) return 'En attente';
  
  const verdictLower = verdict.toLowerCase();
  
  // Vérifier d'abord les verdicts courts exacts
  if (verdictLower === 'retenu' || verdictLower === 'favorable') {
    return 'Favorable';
  }
  if (verdictLower === 'mitigé') {
    return 'Mitigé';
  }
  if (verdictLower === 'défavorable' || verdictLower === 'non retenu' || verdictLower === 'rejeté') {
    return 'Non retenu';
  }
  
  // Pour les verdicts longs, extraire le verdict principal
  // Patterns pour "Non retenu"
  if (verdictLower.includes('non retenu') || 
      verdictLower.includes('ne remplit aucune') || 
      verdictLower.includes('recommandé de ne pas retenir') ||
      verdictLower.includes('n\'est pas retenu') ||
      verdictLower.includes('il n\'est pas retenu') ||
      verdictLower.includes('non retenu pour le poste') ||
      verdictLower.includes('ne répond à aucun') ||
      verdictLower.includes('n\'est actuellement pas adapté') ||
      verdictLower.includes('alignement quasi inexistant')) {
    return 'Non retenu';
  }
  
  // Patterns pour "Rejeté"
  if (verdictLower.includes('rejeté') || 
      verdictLower.includes('rejet') ||
      verdictLower.includes('dossier ne contient aucune information') ||
      verdictLower.includes('impossible de rendre un verdict définitif')) {
    return 'Non retenu';
  }
  
  // Patterns pour "Mitigé"
  if (verdictLower.includes('mitigé') || 
      verdictLower.includes('inadéquation partielle') || 
      verdictLower.includes('nécessite des améliorations') ||
      verdictLower.includes('dossier de candidature a besoin d\'améliorations') ||
      verdictLower.includes('améliorations ciblées') ||
      verdictLower.includes('candidat crédible') ||
      verdictLower.includes('expérience substantielle') ||
      verdictLower.includes('expérience significative')) {
    return 'Mitigé';
  }
  
  // Patterns pour "Favorable"
  if (verdictLower.includes('favorable') || 
      verdictLower.includes('candidat optimal') || 
      verdictLower.includes('qualifié pour le poste') ||
      verdictLower.includes('candidat qualifié')) {
    return 'Favorable';
  }
  
  // Si aucun pattern ne correspond, retourner le verdict original
  return verdict;
};

const getVerdictVariant = (verdict: string | undefined) => {
  if (!verdict) return 'default';
  
  const verdictLower = verdict.toLowerCase();
  
  // Vérifier d'abord les verdicts courts exacts
  if (verdictLower === 'retenu' || verdictLower === 'favorable') {
    return 'success';
  }
  if (verdictLower === 'mitigé') {
    return 'secondary';
  }
  if (verdictLower === 'défavorable' || verdictLower === 'non retenu' || verdictLower === 'rejeté') {
    return 'destructive';
  }
  
  // Pour les verdicts longs, déterminer la couleur basée sur le contenu
  // Patterns pour "Non retenu" (rouge)
  if (verdictLower.includes('non retenu') || 
      verdictLower.includes('ne remplit aucune') || 
      verdictLower.includes('recommandé de ne pas retenir') ||
      verdictLower.includes('n\'est pas retenu') ||
      verdictLower.includes('il n\'est pas retenu') ||
      verdictLower.includes('non retenu pour le poste') ||
      verdictLower.includes('ne répond à aucun') ||
      verdictLower.includes('n\'est actuellement pas adapté') ||
      verdictLower.includes('alignement quasi inexistant')) {
    return 'destructive';
  }
  
  // Patterns pour "Rejeté" (rouge)
  if (verdictLower.includes('rejeté') || 
      verdictLower.includes('rejet') ||
      verdictLower.includes('dossier ne contient aucune information') ||
      verdictLower.includes('impossible de rendre un verdict définitif')) {
    return 'destructive';
  }
  
  // Patterns pour "Mitigé" (jaune)
  if (verdictLower.includes('mitigé') || 
      verdictLower.includes('inadéquation partielle') || 
      verdictLower.includes('nécessite des améliorations') ||
      verdictLower.includes('dossier de candidature a besoin d\'améliorations') ||
      verdictLower.includes('améliorations ciblées') ||
      verdictLower.includes('candidat crédible') ||
      verdictLower.includes('expérience substantielle') ||
      verdictLower.includes('expérience significative')) {
    return 'secondary';
  }
  
  // Patterns pour "Favorable" (vert)
  if (verdictLower.includes('favorable') || 
      verdictLower.includes('candidat optimal') || 
      verdictLower.includes('qualifié pour le poste') ||
      verdictLower.includes('candidat qualifié')) {
    return 'success';
  }
  
  // Par défaut
  return 'default';
};

/**
 * Détecte si un texte est purement technique (à masquer complètement)
 * Retourne true si le texte contient uniquement des références techniques
 */
const isPurelyTechnicalText = (text: string): boolean => {
  if (!text) return false;
  
  // Patterns qui indiquent un texte purement technique
  const technicalIndicators = [
    /Vector search/i,
    /Azure AI Search/i,
    /cosinus normalisé/i,
    /fusion pondérée/i,
    /retrieval persistant/i,
    /Verdict basé sur seuils/i,
    /passages.*?;/i,
    /→/,
  ];
  
  // Si le texte contient plusieurs indicateurs techniques, c'est un texte technique
  const matchCount = technicalIndicators.filter(pattern => pattern.test(text)).length;
  
  // Si 2 indicateurs ou plus, c'est du texte purement technique
  return matchCount >= 2;
};

/**
 * Nettoie le texte technique de l'API pour le rendre plus user-friendly
 * Si le texte est purement technique, retourne une chaîne vide
 */
const cleanTechnicalText = (text: string): string => {
  if (!text) return '';
  
  // Si le texte est purement technique, ne rien afficher
  if (isPurelyTechnicalText(text)) {
    return '';
  }
  
  // Sinon, nettoyer le texte des éléments techniques résiduels
  const technicalPhrases = [
    /Vector search \(Azure\).*?passages.*?;/gi,
    /cosinus normalisé.*?%.*?;/gi,
    /fusion pondérée\.?/gi,
    /retrieval persistant via Azure AI Search\.?/gi,
    /Verdict basé sur seuils.*?;/gi,
    /Azure AI Search/gi,
    /Vector search/gi,
  ];
  
  let cleanedText = text;
  
  // Supprimer les phrases techniques
  technicalPhrases.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  // Supprimer les patterns génériques qui restent
  cleanedText = cleanedText
    .replace(/→/g, '') // Flèches
    .replace(/;\s*;/g, ';') // Double point-virgules
    .replace(/\s*;\s*$/g, '') // Point-virgules en fin
    .replace(/^\s*;\s*/g, '') // Point-virgules au début
    .replace(/\s+/g, ' ') // Espaces multiples
    .trim();
  
  // Si le texte est vide, trop court, ou contient seulement de la ponctuation
  if (!cleanedText || cleanedText.length < 10 || /^[.,;:\s-]+$/.test(cleanedText)) {
    return '';
  }
  
  return cleanedText;
};

/**
 * Nettoie un tableau de textes techniques
 */
const cleanTechnicalArray = (items: string[]): string[] => {
  if (!items || !Array.isArray(items)) return items;
  return items.map(item => cleanTechnicalText(item)).filter(item => item.length > 0);
};

export default function Traitements_IA() {
  const { 
    data: aiData, 
    isLoading, 
    error, 
    isConnected,
    searchCandidates,
    loadAIData 
  } = useSEEGAIData();
  
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedVerdict, setSelectedVerdict] = useState<string>("all");
  const [selectedScoreRange, setSelectedScoreRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rang");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<CandidateApplication[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sendMessage, setSendMessage] = useState('');
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [candidateEvaluations, setCandidateEvaluations] = useState<Record<string, any>>({});
  
  // Défère les mises à jour du Select pour éviter les conflits DOM (Chrome)
  const handleDepartmentChange = (value: string) => {
    requestAnimationFrame(() => setSelectedDepartment(value));
  };

  // Récupérer l'URL de retour
  const returnUrl = searchParams.get('returnUrl');

  // Appliquer les filtres depuis les paramètres URL
  useEffect(() => {
    const departmentParam = searchParams.get('department');
    const candidateParam = searchParams.get('candidate');
    
    if (departmentParam) {
      setSelectedDepartment(decodeURIComponent(departmentParam));
    }
    
    if (candidateParam) {
      setSearchTerm(decodeURIComponent(candidateParam));
    }
  }, [searchParams]);

  // Recherche en temps réel
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        try {
          const results = await searchCandidates(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error('Erreur lors de la recherche:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(performSearch, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchCandidates]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | CandidateAIData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Transformer les données IA pour l'affichage
  const candidatesData = useMemo(() => {
    // Si on a des résultats de recherche, les utiliser
    if (searchResults.length > 0) {
      return searchResults;
    }

    // Sinon, utiliser les données statiques
    if (!aiData) {
      console.log('Traitements_IA: aiData is not available');
      return [];
    }

    console.log('Traitements_IA: Processing aiData', Object.keys(aiData));
    const allCandidates: CandidateApplication[] = [];

    // Parcourir dynamiquement tous les départements
    Object.entries(aiData).forEach(([departmentKey, candidates]) => {
      candidates.forEach((candidate, index) => {
        // Créer le nom complet pour une recherche optimisée
        const firstName = candidate.prenom || '';
        const lastName = candidate.nom || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        allCandidates.push({
          id: `${departmentKey}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          firstName: firstName,
          lastName: lastName,
          fullName: fullName, // Nom complet pour la recherche
          poste: candidate.poste,
          department: departmentKey, // Utiliser le nom exact du département
          aiData: {
            nom: candidate.nom,
            prenom: candidate.prenom,
            poste: candidate.poste,
            resume_global: candidate.resume_global,
            mtp: candidate.mtp,
            conformite: candidate.conformite,
            similarite_offre: candidate.similarite_offre,
            feedback: candidate.feedback
          },
          // Inclure toutes les propriétés du candidat mappé pour l'accès aux documents
          ...candidate
        });
      });
    });

    // Filtrer pour ne garder que les traitements IA de la nouvelle campagne
    if (CAMPAIGN_MODE) {
      // Filtrer par postes de la campagne uniquement
      return allCandidates.filter(c => {
        const title = c.poste || "";
        const exact = CAMPAIGN_JOBS.includes(title);
        const pattern = CAMPAIGN_JOB_PATTERNS.some(rx => rx.test(title));
        return exact || pattern;
      });
    }

    return allCandidates;
  }, [aiData, searchResults]);

  // Effet pour gérer la recherche locale et optimiser les performances
  useEffect(() => {
    // Réinitialiser les résultats de recherche quand le terme change
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
    } else {
      // Démarrer la recherche locale si on a un terme
      setIsSearching(true);
      // La recherche locale se fait via useMemo, pas besoin d'action supplémentaire ici
    }
  }, [searchTerm]);

  // Le DataTable gère automatiquement la réinitialisation de la pagination

  // Départements autorisés (uniquement ceux contenant des postes de la nouvelle campagne)
  const allowedDepartments = useMemo(() => {
    if (!aiData) return [] as string[];
    const keys = Object.keys(aiData);
    if (!CAMPAIGN_MODE) return keys;
    const isCampaignPost = (title: string) => {
      const exact = CAMPAIGN_JOBS.includes(title || "");
      const pattern = CAMPAIGN_JOB_PATTERNS.some(rx => rx.test(title || ""));
      return exact || pattern;
    };
    return keys.filter((dept) => {
      const candidates = (aiData as any)[dept] as any[];
      return Array.isArray(candidates) && candidates.some(c => isCampaignPost(c.poste));
    });
  }, [aiData]);

  // Filtrer et trier les candidats
  const filteredCandidates = useMemo(() => {
    console.log('Traitements_IA: Filtering candidates', {
      searchTerm,
      candidatesDataLength: candidatesData.length,
      searchResultsLength: searchResults.length
    });

    // Si on a des résultats de recherche, les utiliser directement
    if (searchResults.length > 0 && searchTerm) {
      console.log('Traitements_IA: Using search results', searchResults.length);
      return searchResults;
    }

    let filtered = candidatesData;

    // Si pas de données, retourner un tableau vide
    if (!filtered || filtered.length === 0) {
      console.log('Traitements_IA: No candidates data available');
      return [];
    }

    // Filtrer par terme de recherche (recherche avancée)
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      console.log('Traitements_IA: Filtering by search term', searchLower, 'from', filtered.length, 'candidates');
      
      filtered = filtered.filter(candidate => {
        if (!candidate) return false;
        
        // Debug: Afficher les données du candidat pour le premier candidat
        if (filtered.indexOf(candidate) === 0) {
          console.log('Traitements_IA: Sample candidate data:', {
            fullName: candidate.fullName,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            prenom: candidate.prenom,
            nom: candidate.nom,
            department: candidate.department,
            poste: candidate.poste,
            aiData: candidate.aiData ? 'Present' : 'Missing',
            rawCandidate: candidate
          });
        }
        
        // Recherche dans les informations de base (optimisée avec fullName)
        const basicMatch = 
          (candidate.fullName || '').toLowerCase().includes(searchLower) ||
          (candidate.firstName || '').toLowerCase().includes(searchLower) ||
          (candidate.lastName || '').toLowerCase().includes(searchLower) ||
          (candidate.prenom || '').toLowerCase().includes(searchLower) ||
          (candidate.nom || '').toLowerCase().includes(searchLower) ||
          (candidate.department || '').toLowerCase().includes(searchLower) ||
          (candidate.poste || '').toLowerCase().includes(searchLower);
        
        // Recherche dans les données IA
        const aiMatch = 
          (candidate.aiData?.resume_global?.commentaire_global && candidate.aiData.resume_global.commentaire_global.toLowerCase().includes(searchLower)) ||
          (candidate.aiData?.mtp?.niveau && candidate.aiData.mtp.niveau.toLowerCase().includes(searchLower)) ||
          (candidate.aiData?.similarite_offre?.commentaire_score && candidate.aiData.similarite_offre.commentaire_score.toLowerCase().includes(searchLower)) ||
          (candidate.aiData?.conformite?.commentaire && candidate.aiData.conformite.commentaire.toLowerCase().includes(searchLower));
        
        const match = basicMatch || aiMatch;
        
        // Debug: Afficher les résultats de recherche pour le premier candidat
        if (filtered.indexOf(candidate) === 0) {
          console.log('Traitements_IA: Search match for sample candidate:', {
            searchTerm: searchLower,
            basicMatch,
            aiMatch,
            finalMatch: match,
            fullName: candidate.fullName,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            prenom: candidate.prenom,
            nom: candidate.nom
          });
        }
        
        return match;
      });
      
      console.log('Traitements_IA: After filtering', filtered.length, 'candidates remain');
    }

    // Filtrer par département
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(candidate => candidate.department === selectedDepartment);
    }

    // Filtrer par verdict
    if (selectedVerdict !== "all") {
      filtered = filtered.filter(candidate => {
        const verdictLabel = getVerdictLabel(candidate.aiData?.resume_global?.verdict || '');
        return verdictLabel === selectedVerdict;
      });
    }

    // Filtrer par plage de score
    if (selectedScoreRange !== "all") {
      filtered = filtered.filter(candidate => {
        const score = (candidate.aiData?.resume_global?.score_global || 0) * 100;
        switch (selectedScoreRange) {
          case "0-20": return score >= 0 && score <= 20;
          case "21-40": return score >= 21 && score <= 40;
          case "41-60": return score >= 41 && score <= 60;
          case "61-80": return score >= 61 && score <= 80;
          case "81-100": return score >= 81 && score <= 100;
          default: return true;
        }
      });
    }

    // Trier les candidats
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case "nom":
          aValue = a.fullName || `${a.firstName || a.prenom || 'N/A'} ${a.lastName || a.nom || 'N/A'}`.trim();
          bValue = b.fullName || `${b.firstName || b.prenom || 'N/A'} ${b.lastName || b.nom || 'N/A'}`.trim();
          break;
        case "score":
          aValue = a.aiData?.resume_global?.score_global || 0;
          bValue = b.aiData?.resume_global?.score_global || 0;
          break;
        case "rang":
          aValue = a.aiData?.resume_global?.rang_global || 999;
          bValue = b.aiData?.resume_global?.rang_global || 999;
          break;
        case "verdict":
          aValue = getVerdictLabel(a.aiData?.resume_global?.verdict || '');
          bValue = getVerdictLabel(b.aiData?.resume_global?.verdict || '');
          break;
        case "departement":
          aValue = a.department;
          bValue = b.department;
          break;
        default:
          aValue = a.aiData?.resume_global?.rang_global || 999;
          bValue = b.aiData?.resume_global?.rang_global || 999;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
      }
    });

    return filtered;
  }, [candidatesData, searchTerm, selectedDepartment, selectedVerdict, selectedScoreRange, sortBy, sortOrder, searchResults]);

  // Effet pour évaluer automatiquement tous les candidats au chargement
  useEffect(() => {
    const evaluateAllCandidates = async () => {
      if (filteredCandidates.length === 0) return;
      
      console.log('🔄 [AUTO-EVAL] Début de l\'évaluation automatique de tous les candidats');
      
      // Évaluer chaque candidat qui n'a pas encore été évalué
      const candidatesToEvaluate = filteredCandidates.filter(c => !candidateEvaluations[c.id]);
      console.log(`📊 [AUTO-EVAL] ${candidatesToEvaluate.length} candidats à évaluer sur ${filteredCandidates.length} total`);
      
      let evaluatedCount = 0;
      let errorCount = 0;
      
      for (const candidate of candidatesToEvaluate) {
        evaluatedCount++;
        console.log(`🔍 [AUTO-EVAL] Évaluation ${evaluatedCount}/${candidatesToEvaluate.length}: ${candidate.fullName}`);
        try {
          await evaluateCandidateAutomatically(candidate, true);
          console.log(`✅ [AUTO-EVAL] Succès pour ${candidate.fullName}`);
          // Pause plus longue entre les évaluations pour donner le temps à l'API de traiter (3 secondes)
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          errorCount++;
          console.error(`❌ [AUTO-EVAL] Erreur ${errorCount} pour ${candidate.fullName}:`, error);
          // Pause encore plus longue après une erreur (5 secondes) pour laisser l'API récupérer
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      console.log(`✅ [AUTO-EVAL] Évaluation automatique terminée: ${evaluatedCount - errorCount} succès, ${errorCount} erreurs`);
    };

    // Délai pour laisser le temps aux données de se charger
    const timeoutId = setTimeout(evaluateAllCandidates, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [filteredCandidates.length]); // Se déclenche quand le nombre de candidats change

  // DataTable gère automatiquement la pagination et les filtres

  const handleViewResults = async (candidate: CandidateApplication | CandidateAIData) => {
    // Cast pour éviter les problèmes de types entre CandidateApplication et CandidateAIData
    const cand = candidate as any;
    
    console.log('🔍 [DEBUG] handleViewResults appelé avec:', candidate);
    
    // Préparer les données au format Azure Container Apps API
    const rawCandidate = cand.rawData || cand;
    
    // Récupérer le CV et la lettre de motivation depuis l'API
    let cvContent = 'CV non disponible';
    let coverLetterContent = 'Lettre de motivation non disponible';
    
    // Essayer de récupérer le CV - priorité aux données brutes de l'API
    if (rawCandidate.documents?.cv) {
      if (typeof rawCandidate.documents.cv === 'string') {
        cvContent = rawCandidate.documents.cv;
      } else if (rawCandidate.documents.cv.url) {
        cvContent = `CV disponible: ${rawCandidate.documents.cv.name} (${rawCandidate.documents.cv.url})`;
      }
    } else if (cand.documents?.cv) {
      if (typeof cand.documents.cv === 'string') {
        cvContent = cand.documents.cv;
      } else if (cand.documents.cv.url) {
        cvContent = `CV disponible: ${cand.documents.cv.name} (${cand.documents.cv.url})`;
      }
    } else if (cand.cv) {
      if (typeof cand.cv === 'string') {
        cvContent = cand.cv;
      } else if (cand.cv.url) {
        cvContent = `CV disponible: ${cand.cv.name} (${cand.cv.url})`;
      }
    } else if (rawCandidate.cv) {
      if (typeof rawCandidate.cv === 'string') {
        cvContent = rawCandidate.cv;
      } else if (rawCandidate.cv.url) {
        cvContent = `CV disponible: ${rawCandidate.cv.name} (${rawCandidate.cv.url})`;
      }
    }
    
    // Essayer de récupérer la lettre de motivation - priorité aux données brutes de l'API
    if (rawCandidate.documents?.cover_letter) {
      if (typeof rawCandidate.documents.cover_letter === 'string') {
        coverLetterContent = rawCandidate.documents.cover_letter;
      } else if (rawCandidate.documents.cover_letter.url) {
        coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.documents.cover_letter.name} (${rawCandidate.documents.cover_letter.url})`;
      }
    } else if (cand.documents?.cover_letter) {
      if (typeof cand.documents.cover_letter === 'string') {
        coverLetterContent = cand.documents.cover_letter;
      } else if (cand.documents.cover_letter.url) {
        coverLetterContent = `Lettre de motivation disponible: ${cand.documents.cover_letter.name} (${cand.documents.cover_letter.url})`;
      }
    } else if (cand.cover_letter) {
      if (typeof cand.cover_letter === 'string') {
        coverLetterContent = cand.cover_letter;
      } else if (cand.cover_letter.url) {
        coverLetterContent = `Lettre de motivation disponible: ${cand.cover_letter.name} (${cand.cover_letter.url})`;
      }
    } else if (rawCandidate.cover_letter) {
      if (typeof rawCandidate.cover_letter === 'string') {
        coverLetterContent = rawCandidate.cover_letter;
      } else if (rawCandidate.cover_letter.url) {
        coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.cover_letter.name} (${rawCandidate.cover_letter.url})`;
      }
    }
    
    const azureData = {
      id: cand.id,
      Nom: cand.nom || cand.lastName || rawCandidate.nom || 'N/A',
      Prénom: cand.prenom || cand.firstName || rawCandidate.prenom || 'N/A',
      cv: cvContent,
      lettre_motivation: coverLetterContent,
      MTP: {
        M: cand.reponses_mtp?.metier ? cand.reponses_mtp.metier.join(' | ') :
           rawCandidate.reponses_mtp?.metier ? rawCandidate.reponses_mtp.metier.join(' | ') : 'Réponses métier non disponibles',
        T: cand.reponses_mtp?.talent ? cand.reponses_mtp.talent.join(' | ') :
           rawCandidate.reponses_mtp?.talent ? rawCandidate.reponses_mtp.talent.join(' | ') : 'Réponses talent non disponibles',
        P: cand.reponses_mtp?.paradigme ? cand.reponses_mtp.paradigme.join(' | ') :
           rawCandidate.reponses_mtp?.paradigme ? rawCandidate.reponses_mtp.paradigme.join(' | ') : 'Réponses paradigme non disponibles'
      },
      post: cand.offre?.reference || rawCandidate.offre?.reference || cand.poste || 'Poste non spécifié'
    };
    
    console.log('📤 DONNÉES QUI SERAIENT ENVOYÉES À L\'API AZURE CONTAINER APPS:');
    console.log('=====================================');
    console.log('📊 Taille des données:');
    console.log('- CV:', azureData.cv.length, 'caractères');
    console.log('- Lettre de motivation:', azureData.lettre_motivation.length, 'caractères');
    console.log('- Total JSON:', JSON.stringify(azureData).length, 'caractères');
    console.log('=====================================');
    console.log('📄 CV complet (début):', azureData.cv.substring(0, 200) + '...');
    console.log('📄 CV complet (fin):', '...' + azureData.cv.substring(azureData.cv.length - 200));
    console.log('📄 Lettre complète:', azureData.lettre_motivation);
    console.log('=====================================');
    console.log(JSON.stringify(azureData, null, 2));
    console.log('=====================================');
    
    console.log('🔍 [DEBUG] Ouverture du modal pour:', candidate.firstName, candidate.lastName);
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
    console.log('🔍 [DEBUG] États mis à jour - isModalOpen:', true, 'selectedCandidate:', candidate);
    
    // Évaluation automatique du candidat
    await evaluateCandidateAutomatically(candidate);
  };

  const evaluateCandidateAutomatically = async (candidate: CandidateApplication | CandidateAIData, isBackground = false) => {
    try {
      // Ne pas afficher le loader si c'est une évaluation en arrière-plan
      if (!isBackground) {
        setIsEvaluating(true);
        setEvaluationData(null);
      }

      // Vérifier la configuration de la clé API
      if (!azureContainerAppsService.hasApiKey()) {
        console.warn('⚠️ [Azure Container Apps] Clé API non configurée - Évaluation ignorée');
        return;
      }

      // Cast pour éviter les problèmes de types entre CandidateApplication et CandidateAIData
      const cand = candidate as any;
      
      // Préparer les données au format Azure Container Apps API
      const rawCandidate = cand.rawData || cand;
      
      // Récupérer le CV et la lettre de motivation depuis l'API
      let cvContent = 'CV non disponible';
      let coverLetterContent = 'Lettre de motivation non disponible';
      
      // Essayer de récupérer le CV - priorité aux données brutes de l'API
      if (rawCandidate.documents?.cv) {
        if (typeof rawCandidate.documents.cv === 'string') {
          cvContent = rawCandidate.documents.cv;
        } else if (rawCandidate.documents.cv.url) {
          cvContent = `CV disponible: ${rawCandidate.documents.cv.name} (${rawCandidate.documents.cv.url})`;
        }
      } else if (cand.documents?.cv) {
        if (typeof cand.documents.cv === 'string') {
          cvContent = cand.documents.cv;
        } else if (cand.documents.cv.url) {
          cvContent = `CV disponible: ${cand.documents.cv.name} (${cand.documents.cv.url})`;
        }
      } else if (cand.cv) {
        if (typeof cand.cv === 'string') {
          cvContent = cand.cv;
        } else if (cand.cv.url) {
          cvContent = `CV disponible: ${cand.cv.name} (${cand.cv.url})`;
        }
      } else if (rawCandidate.cv) {
        if (typeof rawCandidate.cv === 'string') {
          cvContent = rawCandidate.cv;
        } else if (rawCandidate.cv.url) {
          cvContent = `CV disponible: ${rawCandidate.cv.name} (${rawCandidate.cv.url})`;
        }
      }
      
      // Essayer de récupérer la lettre de motivation - priorité aux données brutes de l'API
      if (rawCandidate.documents?.cover_letter) {
        if (typeof rawCandidate.documents.cover_letter === 'string') {
          coverLetterContent = rawCandidate.documents.cover_letter;
        } else if (rawCandidate.documents.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.documents.cover_letter.name} (${rawCandidate.documents.cover_letter.url})`;
        }
      } else if (cand.documents?.cover_letter) {
        if (typeof cand.documents.cover_letter === 'string') {
          coverLetterContent = cand.documents.cover_letter;
        } else if (cand.documents.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${cand.documents.cover_letter.name} (${cand.documents.cover_letter.url})`;
        }
      } else if (cand.cover_letter) {
        if (typeof cand.cover_letter === 'string') {
          coverLetterContent = cand.cover_letter;
        } else if (cand.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${cand.cover_letter.name} (${cand.cover_letter.url})`;
        }
      } else if (rawCandidate.cover_letter) {
        if (typeof rawCandidate.cover_letter === 'string') {
          coverLetterContent = rawCandidate.cover_letter;
        } else if (rawCandidate.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.cover_letter.name} (${rawCandidate.cover_letter.url})`;
        }
      }
      
      // PRIORITÉ ABSOLUE à post (champ direct) ou offre?.reference qui est le champ utilisé par l'API SEEG
      const jobId = rawCandidate.post ||
                    cand.post ||
                    rawCandidate.offre?.reference || 
                    cand.offre?.reference || 
                    rawCandidate.offre?.job_id || 
                    cand.offre?.job_id || 
                    cand.offre_id || 
                    rawCandidate.offre_id || 
                    rawCandidate.application?.offer_id || 
                    '';
      
      // Récupérer les données MTP au bon format (déjà des chaînes de texte)
      console.log('🔍 [DEBUG] Recherche des données MTP...');
      console.log('🔍 [DEBUG] rawCandidate.mtp:', rawCandidate.mtp);
      console.log('🔍 [DEBUG] cand.mtp:', cand.mtp);
      console.log('🔍 [DEBUG] rawCandidate.reponses_mtp:', rawCandidate.reponses_mtp);
      console.log('🔍 [DEBUG] cand.reponses_mtp:', cand.reponses_mtp);
      
      // Les données MTP peuvent être dans mtp directement ou dans reponses_mtp
      let mtpData = rawCandidate.mtp || cand.mtp || rawCandidate.analysis?.mtp || cand.aiData?.mtp || {};
      
      // Si mtpData contient reponses_mtp, extraire ces données
      if (mtpData.reponses_mtp) {
        mtpData = mtpData.reponses_mtp;
      }
      
      // Ou vérifier directement dans reponses_mtp
      if (!mtpData.M && !mtpData.T && !mtpData.P) {
        const directMtp = rawCandidate.reponses_mtp || cand.reponses_mtp;
        if (directMtp) {
          mtpData = directMtp;
        }
      }
      
      console.log('🔍 [DEBUG] mtpData final récupéré:', mtpData);
      console.log('🔍 [DEBUG] mtpData.M:', mtpData.M);
      console.log('🔍 [DEBUG] mtpData.T:', mtpData.T);
      console.log('🔍 [DEBUG] mtpData.P:', mtpData.P);
      console.log('🔍 [DEBUG] mtpData.metier:', mtpData.metier);
      console.log('🔍 [DEBUG] mtpData.talent:', mtpData.talent);
      console.log('🔍 [DEBUG] mtpData.paradigme:', mtpData.paradigme);
      
      // Convertir les données MTP au format attendu par l'API (M, T, P)
      // Gérer deux cas : {M, T, P} ou {metier, talent, paradigme}
      let M_value = mtpData.M;
      let T_value = mtpData.T;
      let P_value = mtpData.P;
      
      // Si les données sont au format {metier, talent, paradigme} (tableaux), les convertir
      if (!M_value && mtpData.metier) {
        M_value = Array.isArray(mtpData.metier) ? mtpData.metier.join(' | ') : mtpData.metier;
      }
      if (!T_value && mtpData.talent) {
        T_value = Array.isArray(mtpData.talent) ? mtpData.talent.join(' | ') : mtpData.talent;
      }
      if (!P_value && mtpData.paradigme) {
        P_value = Array.isArray(mtpData.paradigme) ? mtpData.paradigme.join(' | ') : mtpData.paradigme;
      }
      
      console.log('🔍 [DEBUG] Valeurs MTP après conversion:', { M_value, T_value, P_value });
      
      // S'assurer que les données MTP sont des chaînes de texte
      const mtpResponses = {
        M: typeof M_value === 'string' ? M_value : (M_value ? JSON.stringify(M_value) : 'Réponses métier non disponibles'),
        T: typeof T_value === 'string' ? T_value : (T_value ? JSON.stringify(T_value) : 'Réponses talent non disponibles'),
        P: typeof P_value === 'string' ? P_value : (P_value ? JSON.stringify(P_value) : 'Réponses paradigme non disponibles')
      };
      
      const evaluationData: EvaluationRequest = {
        candidate_id: cand.id,
        candidate_name: cand.nom || cand.lastName || rawCandidate.nom || 'N/A',
        candidate_firstname: cand.prenom || cand.firstName || rawCandidate.prenom || 'N/A',
        job_title: cand.offre?.intitule || rawCandidate.offre?.intitule || cand.poste || 'Poste non spécifié',
        job_id: jobId,
        cv_content: cvContent,
        cover_letter_content: coverLetterContent,
        mtp_responses: mtpResponses,
        threshold_pct: 50,
        hold_threshold_pct: 50
      };

      console.log('📤 [EVAL] job_id récupéré:', jobId);
      console.log('📤 [EVAL] Sources vérifiées:', {
        'rawCandidate.post': rawCandidate.post,
        'cand.post': cand.post,
        'rawCandidate.offre?.reference': rawCandidate.offre?.reference,
        'cand.offre?.reference': cand.offre?.reference
      });
      console.log('📤 [EVAL] CV content (premiers 100 chars):', cvContent.substring(0, 100));
      console.log('📤 [EVAL] Cover letter (premiers 100 chars):', coverLetterContent.substring(0, 100));
      console.log('🔍 ÉVALUATION AUTOMATIQUE DU CANDIDAT:', evaluationData);

      // Validation avant envoi
      if (!jobId || jobId === '') {
        const errorMsg = `❌ [EVAL] Le job_id est vide pour le candidat ${cand.fullName || cand.nom}. L'évaluation ne peut pas être effectuée.`;
        console.error(errorMsg);
        console.error('🔍 [DEBUG] Candidat complet pour diagnostic:', JSON.stringify(cand, null, 2));
        throw new Error('Le job_id (post) est requis mais n\'a pas été trouvé dans les données du candidat');
      }

      const result = await azureContainerAppsService.evaluateCandidate(evaluationData);

      if (result.success) {
        if (!isBackground) {
          setEvaluationData(result.data);
        }
        // Stocker l'évaluation pour ce candidat
        setCandidateEvaluations(prev => ({
          ...prev,
          [cand.id]: result.data
        }));
        console.log('✅ Évaluation automatique réussie:', result.data);
        console.log('📊 [MODAL] Données d\'évaluation pour le modal:', JSON.stringify(result.data, null, 2));
      } else {
        console.error('❌ Erreur d\'évaluation automatique:', result.error);
        // Ne pas utiliser de données simulées - laisser evaluationData à null
        console.log('⚠️ [MODAL] Évaluation échouée - aucune donnée à afficher');
      }

    } catch (error) {
      console.error('❌ Erreur inattendue lors de l\'évaluation automatique:', error);
    } finally {
      if (!isBackground) {
        setIsEvaluating(false);
      }
    }
  };

  const handleSendToAPI = async (candidate: CandidateApplication | CandidateAIData) => {
    try {
      setIsSending(true);
      setSendStatus('idle');
      setSendMessage('');

      // Vérifier la configuration de la clé API
      if (!azureContainerAppsService.hasApiKey()) {
        setSendStatus('error');
        setSendMessage('Clé API non configurée. Ajoutez VITE_AZURE_CONTAINER_APPS_API_KEY dans votre .env');
        console.warn('⚠️ [Azure Container Apps] Clé API non configurée');
        return;
      }

      // Cast pour éviter les problèmes de types entre CandidateApplication et CandidateAIData
      const cand = candidate as any;
      
      // Préparer les données au format Azure Container Apps API
      const rawCandidate = cand.rawData || cand;
      
      // Récupérer le CV et la lettre de motivation depuis l'API
      let cvContent = 'CV non disponible';
      let coverLetterContent = 'Lettre de motivation non disponible';
      
      // Essayer de récupérer le CV - priorité aux données brutes de l'API
      if (rawCandidate.documents?.cv) {
        if (typeof rawCandidate.documents.cv === 'string') {
          cvContent = rawCandidate.documents.cv;
        } else if (rawCandidate.documents.cv.url) {
          cvContent = `CV disponible: ${rawCandidate.documents.cv.name} (${rawCandidate.documents.cv.url})`;
        }
      } else if (cand.documents?.cv) {
        if (typeof cand.documents.cv === 'string') {
          cvContent = cand.documents.cv;
        } else if (cand.documents.cv.url) {
          cvContent = `CV disponible: ${cand.documents.cv.name} (${cand.documents.cv.url})`;
        }
      } else if (cand.cv) {
        if (typeof cand.cv === 'string') {
          cvContent = cand.cv;
        } else if (cand.cv.url) {
          cvContent = `CV disponible: ${cand.cv.name} (${cand.cv.url})`;
        }
      } else if (rawCandidate.cv) {
        if (typeof rawCandidate.cv === 'string') {
          cvContent = rawCandidate.cv;
        } else if (rawCandidate.cv.url) {
          cvContent = `CV disponible: ${rawCandidate.cv.name} (${rawCandidate.cv.url})`;
        }
      }
      
      // Essayer de récupérer la lettre de motivation - priorité aux données brutes de l'API
      if (rawCandidate.documents?.cover_letter) {
        if (typeof rawCandidate.documents.cover_letter === 'string') {
          coverLetterContent = rawCandidate.documents.cover_letter;
        } else if (rawCandidate.documents.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.documents.cover_letter.name} (${rawCandidate.documents.cover_letter.url})`;
        }
      } else if (cand.documents?.cover_letter) {
        if (typeof cand.documents.cover_letter === 'string') {
          coverLetterContent = cand.documents.cover_letter;
        } else if (cand.documents.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${cand.documents.cover_letter.name} (${cand.documents.cover_letter.url})`;
        }
      } else if (cand.cover_letter) {
        if (typeof cand.cover_letter === 'string') {
          coverLetterContent = cand.cover_letter;
        } else if (cand.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${cand.cover_letter.name} (${cand.cover_letter.url})`;
        }
      } else if (rawCandidate.cover_letter) {
        if (typeof rawCandidate.cover_letter === 'string') {
          coverLetterContent = rawCandidate.cover_letter;
        } else if (rawCandidate.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.cover_letter.name} (${rawCandidate.cover_letter.url})`;
        }
      }
      
      const candidateData: CandidateData = {
        id: cand.id,
        Nom: cand.nom || cand.lastName || rawCandidate.nom || 'N/A',
        Prénom: cand.prenom || cand.firstName || rawCandidate.prenom || 'N/A',
        cv: cvContent,
        lettre_motivation: coverLetterContent,
        MTP: {
          M: cand.reponses_mtp?.metier ? cand.reponses_mtp.metier.join(' | ') :
             rawCandidate.reponses_mtp?.metier ? rawCandidate.reponses_mtp.metier.join(' | ') : 'Réponses métier non disponibles',
          T: cand.reponses_mtp?.talent ? cand.reponses_mtp.talent.join(' | ') :
             rawCandidate.reponses_mtp?.talent ? rawCandidate.reponses_mtp.talent.join(' | ') : 'Réponses talent non disponibles',
          P: cand.reponses_mtp?.paradigme ? cand.reponses_mtp.paradigme.join(' | ') :
             rawCandidate.reponses_mtp?.paradigme ? rawCandidate.reponses_mtp.paradigme.join(' | ') : 'Réponses paradigme non disponibles'
        },
        post: cand.offre?.reference || rawCandidate.offre?.reference || cand.poste || 'Poste non spécifié'
      };

      console.log('📤 ENVOI DES DONNÉES À L\'API AZURE CONTAINER APPS:', candidateData);

      const result = await azureContainerAppsService.sendCandidateData(candidateData);

      if (result.success) {
        setSendStatus('success');
        setSendMessage('Données envoyées avec succès à l\'API Azure Container Apps');
        console.log('✅ Envoi réussi:', result);
      } else {
        setSendStatus('error');
        setSendMessage(result.error || 'Erreur lors de l\'envoi');
        console.error('❌ Erreur d\'envoi:', result.error);
      }

    } catch (error) {
      setSendStatus('error');
      setSendMessage('Erreur inattendue lors de l\'envoi');
      console.error('❌ Erreur inattendue:', error);
    } finally {
      setIsSending(false);
    }
  };

  // La pagination est maintenant gérée par le DataTable

  if (isLoading) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des candidatures...</p>
            </div>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  if (error) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <ErrorBoundary>
      <div className="container mx-auto px-4 py-6">
        {/* En-tête de la page */}
        <div className="mb-8">
          {/* Bouton retour */}
          {returnUrl && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(decodeURIComponent(returnUrl))}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au protocole
              </Button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Traitements IA</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Gestion intelligente des candidatures</p>
              {sendStatus !== 'idle' && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${sendStatus === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-xs ${sendStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {sendMessage}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Barre de recherche et filtres */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Recherche principale */}
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom, prénom, département, poste ou contenu IA..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
                
                {/* Filtres de base */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 sm:max-w-[240px]">
                    <div className="relative group">
                      <select
                        value={selectedDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="block w-full h-10 rounded-lg border border-input bg-background px-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors hover:border-ring/40 appearance-none"
                      >
                        <option value="all">Tous les départements</option>
                        {aiData && (
                          (CAMPAIGN_MODE
                            ? allowedDepartments
                            : Object.keys(aiData)
                          ).map((departmentKey) => (
                            <option key={departmentKey} value={departmentKey}>{departmentKey}</option>
                          ))
                        )}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground group-hover:text-foreground/80">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center justify-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden xs:inline">Filtres avancés</span>
                    <span className="xs:hidden">Filtres</span>
                  </Button>
                </div>
              </div>

              {/* Filtres avancés */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t">
                  {/* Filtre par verdict */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Verdict
                    </label>
                    <Select value={selectedVerdict} onValueChange={setSelectedVerdict}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les verdicts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les verdicts</SelectItem>
                        <SelectItem value="Favorable">Favorable</SelectItem>
                        <SelectItem value="Mitigé">Mitigé</SelectItem>
                        <SelectItem value="Non retenu">Non retenu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtre par plage de score */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Score global
                    </label>
                    <Select value={selectedScoreRange} onValueChange={setSelectedScoreRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les plages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les plages</SelectItem>
                        <SelectItem value="0-20">0% - 20%</SelectItem>
                        <SelectItem value="21-40">21% - 40%</SelectItem>
                        <SelectItem value="41-60">41% - 60%</SelectItem>
                        <SelectItem value="61-80">61% - 80%</SelectItem>
                        <SelectItem value="81-100">81% - 100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tri par */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Trier par
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Critère de tri" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rang">Rang</SelectItem>
                        <SelectItem value="score">Score global</SelectItem>
                        <SelectItem value="nom">Nom</SelectItem>
                        <SelectItem value="verdict">Verdict</SelectItem>
                        <SelectItem value="departement">Département</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ordre de tri */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Ordre
                    </label>
                    <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ordre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Croissant</SelectItem>
                        <SelectItem value="desc">Décroissant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Résumé des filtres actifs */}
              {(selectedDepartment !== "all" || selectedVerdict !== "all" || selectedScoreRange !== "all" || searchTerm) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Recherche: "{searchTerm}"
                      <button 
                        onClick={() => setSearchTerm("")}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedDepartment !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Département: {selectedDepartment}
                      <button 
                        onClick={() => setSelectedDepartment("all")}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedVerdict !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Verdict: {selectedVerdict}
                      <button 
                        onClick={() => setSelectedVerdict("all")}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedScoreRange !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Score: {selectedScoreRange}%
                      <button 
                        onClick={() => setSelectedScoreRange("all")}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedDepartment("all");
                      setSelectedVerdict("all");
                      setSelectedScoreRange("all");
                    }}
                    className="text-xs"
                  >
                    Effacer tout
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tableau des candidats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Évaluations IA des Candidats
              <span className="text-sm font-normal text-muted-foreground">
                - {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* DataTable moderne avec toutes les fonctionnalités intégrées */}
            <DataTable 
              columns={createColumns(handleViewResults, candidateEvaluations)} 
              data={filteredCandidates as CandidateAIData[]} 
              searchKey="fullName"
              searchPlaceholder="Rechercher par nom..."
            />
          </CardContent>
        </Card>

        {/* Modal de détails des évaluations IA */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Évaluation IA - {selectedCandidate?.firstName} {selectedCandidate?.lastName}
              </DialogTitle>
            </DialogHeader>
            
            {selectedCandidate && (
              <div className="space-y-6">
                {/* Informations du candidat */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations du candidat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                        <p className="text-lg">{selectedCandidate.firstName} {selectedCandidate.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Poste</p>
                        <p className="text-lg">{selectedCandidate.poste}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Évaluation IA */}
                {isEvaluating ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Évaluation IA en cours...</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : evaluationData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        Évaluation IA Complète
                        /
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Scores */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {evaluationData.scores?.score_offre_pct || 0}%
                          </div>
                          <p className="text-sm text-muted-foreground">Score Offre</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {evaluationData.scores?.score_mtp_pct || 0}%
                          </div>
                          <p className="text-sm text-muted-foreground">Score MTP</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {evaluationData.scores?.score_global_pct || 0}%
                          </div>
                          <p className="text-sm text-muted-foreground">Score Global</p>
                        </div>
                      </div>

                      {/* Verdict */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Verdict</h4>
                        <div className="mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            evaluationData.verdict?.verdict?.toLowerCase().includes('accept') || 
                            evaluationData.verdict?.verdict?.toLowerCase().includes('favorable')
                              ? 'bg-green-100 text-green-800'
                              : evaluationData.verdict?.verdict?.toLowerCase().includes('reject') ||
                                evaluationData.verdict?.verdict?.toLowerCase().includes('défavorable')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {evaluationData.verdict?.verdict || 'Non spécifié'}
                          </span>
                        </div>
                        {/* Justification masquée - contient souvent du texte technique */}
                        {/* {evaluationData.verdict?.rationale && (
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Justification :</strong> {evaluationData.verdict.rationale}
                          </p>
                        )} */}
                        {/* Commentaires masqués - contiennent souvent du texte technique */}
                        {/* {evaluationData.verdict?.commentaires && evaluationData.verdict.commentaires.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Commentaires :</p>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {evaluationData.verdict.commentaires.map((comment, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-gray-400">•</span>
                                  {comment}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )} */}
                      </div>

                      {/* Forces */}
                      {evaluationData.forces && evaluationData.forces.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Points Forts
                          </h4>
                          <ul className="space-y-1">
                            {evaluationData.forces.map((force, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {force}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Faiblesses */}
                      {evaluationData.faiblesses && evaluationData.faiblesses.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            Points à Améliorer
                          </h4>
                          <ul className="space-y-1">
                            {evaluationData.faiblesses.map((faiblesse, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                {faiblesse}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Justifications - Afficher uniquement la première */}
                      {evaluationData.justification && evaluationData.justification.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Justifications Détaillées
                          </h4>
                          <ul className="space-y-2">
                            {evaluationData.justification.slice(0, 1).map((justif, index) => (
                              <li key={index} className="text-sm bg-blue-50 p-3 rounded-lg">
                                {justif}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Commentaires généraux */}
                      {evaluationData.commentaires && evaluationData.commentaires.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-gray-500" />
                            Commentaires Généraux
                          </h4>
                          <ul className="space-y-2">
                            {evaluationData.commentaires.map((comment, index) => (
                              <li key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                                {comment}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : null}

                {/* Score Global */}
                {/* <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Score Global IA
                      <Badge variant="outline" className="ml-2">
                        Données statiques
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {selectedCandidate.aiData?.resume_global?.score_global > 0 
                            ? (selectedCandidate.aiData?.resume_global?.score_global || 0) > 1
                              ? `${(selectedCandidate.aiData?.resume_global?.score_global || 0).toFixed(1)}%`
                              : `${((selectedCandidate.aiData?.resume_global?.score_global || 0) * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </div>
                        <p className="text-sm text-muted-foreground">Score Global</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          #{selectedCandidate.aiData?.resume_global?.rang_global || 'N/A'}
                        </div>
                        <p className="text-sm text-muted-foreground">Rang</p>
                      </div>
                      <div className="text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          getVerdictVariant(selectedCandidate.aiData?.resume_global?.verdict || '') === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : getVerdictVariant(selectedCandidate.aiData?.resume_global?.verdict || '') === 'secondary'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getVerdictLabel(selectedCandidate.aiData?.resume_global?.verdict || '')}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Verdict</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Commentaire global :</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">
                        {selectedCandidate.aiData?.resume_global?.commentaire_global || 'Aucun commentaire disponible'}
                      </p>
                    </div>
                  </CardContent>
                </Card> */}

                {/* Conformité documentaire
                {selectedCandidate.aiData?.conformite ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Conformité documentaire
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500">
                          {selectedCandidate.aiData.conformite.score_conformité || 'N/A'}%
                        </div>
                        <p className="text-sm text-muted-foreground">Score de conformité</p>
                        <p className="text-sm bg-muted p-2 rounded mt-2">
                          {selectedCandidate.aiData.conformite.commentaire || 'Aucun commentaire disponible'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Conformité documentaire
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucune évaluation de conformité disponible pour ce candidat</p>
                      </div>
                    </CardContent>
                  </Card>
                )} */}

                {/* Complétude
                {selectedCandidate.aiData?.similarite_offre ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Complétude
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            {selectedCandidate.aiData.similarite_offre.score > 1 
                              ? `${selectedCandidate.aiData.similarite_offre.score.toFixed(1)}%`
                              : `${(selectedCandidate.aiData.similarite_offre.score * 100).toFixed(1)}%`
                            }
                          </div>
                          <p className="text-sm text-muted-foreground">Score de similarité</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Expérience :</p>
                          <p className="text-sm bg-muted p-2 rounded">
                            {selectedCandidate.aiData.similarite_offre?.resume_experience ? (
                              typeof selectedCandidate.aiData.similarite_offre.resume_experience === 'string' 
                              ? selectedCandidate.aiData.similarite_offre.resume_experience
                                : selectedCandidate.aiData.similarite_offre.resume_experience?.nombre_d_annees && selectedCandidate.aiData.similarite_offre.resume_experience?.specialite
                                  ? `${selectedCandidate.aiData.similarite_offre.resume_experience.nombre_d_annees} ans - ${selectedCandidate.aiData.similarite_offre.resume_experience.specialite}`
                                  : 'Informations non disponibles'
                            ) : 'Aucune information d\'expérience disponible'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Commentaire :</p>
                          <p className="text-sm bg-muted p-2 rounded">
                            {selectedCandidate.aiData.similarite_offre?.commentaire_score || 'Aucun commentaire disponible'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Forces :</p>
                            <ul className="text-sm space-y-1">
                              {Array.isArray(selectedCandidate.aiData.similarite_offre.forces) 
                                ? selectedCandidate.aiData.similarite_offre.forces.map((force, index) => (
                                <li key={`force-${index}-${force}`} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {force}
                                </li>
                                  ))
                                : <li className="text-muted-foreground">Aucune force identifiée</li>
                              }
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Faiblesses :</p>
                            <ul className="text-sm space-y-1">
                              {Array.isArray(selectedCandidate.aiData.similarite_offre.faiblesses) 
                                ? selectedCandidate.aiData.similarite_offre.faiblesses.map((faiblesse, index) => (
                                <li key={`faiblesse-${index}-${faiblesse}`} className="flex items-start gap-2">
                                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  {faiblesse}
                                </li>
                                  ))
                                : <li className="text-muted-foreground">Aucune faiblesse identifiée</li>
                              }
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Complétude
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucune évaluation de similarité disponible pour ce candidat</p>
                      </div>
                    </CardContent>
                  </Card>
                )} */}

                {/* Scores MTP
                {selectedCandidate.aiData?.mtp ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Évaluation MTP (Métier, Talent, Paradigme)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`grid gap-4 mb-4 ${
                        (selectedCandidate.aiData?.mtp?.scores?.Moyen || 0) > 0 
                          ? 'grid-cols-2 md:grid-cols-4' 
                          : 'grid-cols-1 md:grid-cols-3'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">
                            {(selectedCandidate.aiData?.mtp?.scores?.Métier || 0) > 0 
                              ? (selectedCandidate.aiData?.mtp?.scores?.Métier || 0) > 1
                                ? `${(selectedCandidate.aiData?.mtp?.scores?.Métier || 0).toFixed(1)}%`
                                : `${((selectedCandidate.aiData?.mtp?.scores?.Métier || 0) * 100).toFixed(1)}%`
                              : 'N/A'
                            }
                          </div>
                          <p className="text-sm text-muted-foreground">Métier</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {(selectedCandidate.aiData?.mtp?.scores?.Talent || 0) > 0 
                              ? (selectedCandidate.aiData?.mtp?.scores?.Talent || 0) > 1
                                ? `${(selectedCandidate.aiData?.mtp?.scores?.Talent || 0).toFixed(1)}%`
                                : `${((selectedCandidate.aiData?.mtp?.scores?.Talent || 0) * 100).toFixed(1)}%`
                              : 'N/A'
                            }
                          </div>
                          <p className="text-sm text-muted-foreground">Talent</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-500">
                            {(selectedCandidate.aiData?.mtp?.scores?.Paradigme || 0) > 0 
                              ? (selectedCandidate.aiData?.mtp?.scores?.Paradigme || 0) > 1
                                ? `${(selectedCandidate.aiData?.mtp?.scores?.Paradigme || 0).toFixed(1)}%`
                                : `${((selectedCandidate.aiData?.mtp?.scores?.Paradigme || 0) * 100).toFixed(1)}%`
                              : 'N/A'
                            }
                          </div>
                          <p className="text-sm text-muted-foreground">Paradigme</p>
                        </div>
                        {(selectedCandidate.aiData?.mtp?.scores?.Moyen || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-500">
                              {(selectedCandidate.aiData?.mtp?.scores?.Moyen || 0) > 1
                                ? `${(selectedCandidate.aiData?.mtp?.scores?.Moyen || 0).toFixed(1)}%`
                                : `${((selectedCandidate.aiData?.mtp?.scores?.Moyen || 0) * 100).toFixed(1)}%`
                              }
                          </div>
                          <p className="text-sm text-muted-foreground">Moyen</p>
                        </div>
                        )}
                      </div>
                      {selectedCandidate.aiData?.mtp?.score_moyen && (
                        <div className="text-center mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl shadow-sm">
                          <div className="text-3xl font-extrabold text-indigo-600 mb-1">
                            {(selectedCandidate.aiData?.mtp?.score_moyen || 0) > 1
                              ? `${(selectedCandidate.aiData?.mtp?.score_moyen || 0).toFixed(1)}%`
                              : `${((selectedCandidate.aiData?.mtp?.score_moyen || 0) * 100).toFixed(1)}%`
                            }
                          </div>
                          <p className="text-sm font-medium text-indigo-700">Score Moyen MTP</p>
                        </div>
                      )}
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Niveau :</p>
                          <p className="text-sm bg-muted p-2 rounded">{selectedCandidate.aiData?.mtp?.niveau || 'Non spécifié'}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Points forts :</p>
                            <ul className="text-sm space-y-1">
                              {Array.isArray(selectedCandidate.aiData?.mtp?.points_forts) && selectedCandidate.aiData?.mtp?.points_forts.length > 0
                                ? selectedCandidate.aiData?.mtp?.points_forts.map((point, index) => (
                                <li key={`mtp-fort-${index}-${point}`} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {point}
                                </li>
                                  ))
                                : <li className="text-muted-foreground">Aucun point fort identifié</li>
                              }
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Points à travailler :</p>
                            <ul className="text-sm space-y-1">
                              {Array.isArray(selectedCandidate.aiData?.mtp?.points_a_travailler) && selectedCandidate.aiData?.mtp?.points_a_travailler.length > 0
                                ? selectedCandidate.aiData?.mtp?.points_a_travailler.map((point, index) => (
                                <li key={`mtp-travailler-${index}-${point}`} className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  {point}
                                </li>
                                  ))
                                : <li className="text-muted-foreground">Aucun point à travailler identifié</li>
                              }
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Évaluation MTP (Métier, Talent, Paradigme)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucune évaluation MTP disponible pour ce candidat</p>
                      </div>
                    </CardContent>
                  </Card>
                )} */}

                {/* Feedback RH */}
                {/* {selectedCandidate.aiData.feedback ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Feedback RH
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            {selectedCandidate.aiData.feedback.score > 0 
                              ? selectedCandidate.aiData.feedback.score > 1
                                ? `${selectedCandidate.aiData.feedback.score.toFixed(1)}%`
                                : `${(selectedCandidate.aiData.feedback.score * 100).toFixed(1)}%`
                              : 'N/A'
                            }
                          </div>
                          <p className="text-sm text-muted-foreground">Score Feedback</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Raisons :</p>
                          <p className="text-sm bg-muted p-2 rounded">
                            {(selectedCandidate.aiData.feedback as any)?.raisons || 'Aucune raison spécifiée'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Points forts :</p>
                            <ul className="text-sm space-y-1">
                              {Array.isArray(selectedCandidate.aiData.feedback?.points_forts) && selectedCandidate.aiData.feedback.points_forts.length > 0 ? selectedCandidate.aiData.feedback.points_forts.map((point, index) => (
                                <li key={`feedback-fort-${index}-${point}`} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {point}
                                </li>
                              )) : <li className="text-muted-foreground">Aucun point fort spécifié</li>}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Points à travailler :</p>
                            <ul className="text-sm space-y-1">
                              {Array.isArray(selectedCandidate.aiData.feedback?.points_a_travailler) && selectedCandidate.aiData.feedback.points_a_travailler.length > 0 ? selectedCandidate.aiData.feedback.points_a_travailler.map((point, index) => (
                                <li key={`feedback-travailler-${index}-${point}`} className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  {point}
                                </li>
                              )) : <li className="text-muted-foreground">Aucun point à travailler spécifié</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Feedback RH
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucun feedback RH disponible pour ce candidat</p>
                      </div>
                    </CardContent>
                  </Card>
                )} */}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      </ErrorBoundary>
    </RecruiterLayout>
  );
}
