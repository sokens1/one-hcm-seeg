import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ObserverLayout } from "@/components/layout/ObserverLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Loader2,
  AlertTriangle,
  MessageSquare,
  Award,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useSEEGAIData } from "@/hooks/useSEEGAIData";
import { AICandidateData } from "@/hooks/useAIData";
import ErrorBoundary from "@/components/ErrorBoundary";

interface CandidateApplication {
  id: string;
  firstName: string;
  lastName: string;
  poste: string;
  department: string;
  aiData: AICandidateData;
}

const getVerdictIcon = (verdict: string) => {
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

const getVerdictLabel = (verdict: string) => {
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

const getVerdictVariant = (verdict: string) => {
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

export default function Traitements_IA() {
  console.log('🚀 [DEBUG] === COMPOSANT TRAITEMENTS_IA DÉMARRÉ ===');
  console.log('🔍 [DEBUG] === FORCEMENT DES DONNÉES DE TEST ===');
  console.log('⚠️ [DEBUG] === MODAL AVEC DONNÉES SIMULÉES ===');
  console.log('🎯 [DEBUG] === TEST MODAL FONCTIONNEL ===');
  console.log('📊 [DEBUG] === DONNÉES API RH EVAL ===');
  
  const { 
    data: aiData, 
    isLoading, 
    error, 
    isConnected,
    searchCandidates,
    loadAIData,
    forceReload
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchResults, setSearchResults] = useState<CandidateApplication[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sendMessage, setSendMessage] = useState('');
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [candidateEvaluations, setCandidateEvaluations] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  
  // Log de débogage pour vérifier que le composant se charge
  console.log('🔍 [DEBUG] Composant Traitements_IA chargé avec:', {
    candidatesDataLength: candidatesData.length,
    aiDataLength: aiData ? Object.keys(aiData).length : 0,
    searchResultsLength: searchResults.length
  });
  
  // Données de test pour le développement
  const testCandidates: CandidateApplication[] = [
    {
      id: 'test-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      poste: 'Développeur Full Stack',
      department: 'IT',
      email: 'jean.dupont@example.com',
      phone: '+241 01 23 45 67',
      aiData: {
        resume_global: {
          score_global: 0.85,
          rang_global: 5,
          verdict: 'Favorable',
          commentaire_global: 'Excellent profil technique avec une expérience solide'
        },
        mtp: {
          scores: {
            Métier: 0.9,
            Talent: 0.8,
            Paradigme: 0.75,
            Moyen: 0.82
          },
          niveau: 'Senior',
          points_forts: [
            'Expérience solide en React',
            'Maîtrise des bases de données',
            'Esprit d\'équipe'
          ],
          points_faibles: [
            'Manque d\'expérience en DevOps',
            'Anglais technique à améliorer'
          ]
        }
      },
      rawData: {
        documents: {
          cv: 'CV de Jean Dupont - Développeur Full Stack avec 5 ans d\'expérience...',
          cover_letter: 'Lettre de motivation pour le poste de Développeur Full Stack...'
        },
        reponses_mtp: {
          metier: ['React', 'Node.js', 'TypeScript'],
          talent: ['Collaboration', 'Innovation'],
          paradigme: ['Agile', 'DevOps']
        }
      }
    },
    {
      id: 'test-2',
      firstName: 'Marie',
      lastName: 'Martin',
      poste: 'Chef de Projet',
      department: 'Management',
      email: 'marie.martin@example.com',
      phone: '+241 01 23 45 68',
      aiData: {
        resume_global: {
          score_global: 0.78,
          rang_global: 12,
          verdict: 'Favorable',
          commentaire_global: 'Profil managérial intéressant'
        },
        mtp: {
          scores: {
            Métier: 0.85,
            Talent: 0.9,
            Paradigme: 0.7,
            Moyen: 0.82
          },
          niveau: 'Senior',
          points_forts: [
            'Leadership naturel',
            'Expérience en gestion d\'équipe',
            'Communication excellente'
          ],
          points_faibles: [
            'Expérience technique limitée',
            'Connaissance des outils de gestion'
          ]
        }
      },
      rawData: {
        documents: {
          cv: 'CV de Marie Martin - Chef de Projet avec 8 ans d\'expérience...',
          cover_letter: 'Lettre de motivation pour le poste de Chef de Projet...'
        },
        reponses_mtp: {
          metier: ['Gestion de projet', 'Agile', 'Scrum'],
          talent: ['Leadership', 'Communication'],
          paradigme: ['Agile', 'Management']
        }
      }
    }
  ];
  
  // Utiliser les données de test si aucune donnée IA n'est disponible
  const finalCandidatesData = useMemo(() => {
    console.log('🔍 [DEBUG] Vérification des données:', {
      candidatesDataLength: candidatesData.length,
      hasAiData: candidatesData.some(c => c.aiData),
      firstCandidateAiData: candidatesData[0]?.aiData
    });
    
    // FORCER l'utilisation des données de test pour le développement
    console.log('⚠️ [DEBUG] FORCEMENT des données de test pour le développement');
    console.log('📊 [DEBUG] Nombre de candidats de test:', testCandidates.length);
    return testCandidates;
    
    // Si on a des candidats avec des données IA, les utiliser
    if (candidatesData.length > 0 && candidatesData.some(c => c.aiData)) {
      console.log('✅ [DEBUG] Utilisation des données réelles avec IA');
      return candidatesData;
    }
    // Sinon, utiliser les données de test
    console.log('⚠️ [DEBUG] Utilisation des données de test (pas de données IA)');
    return testCandidates;
  }, [candidatesData]);
  
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

  // Effet pour évaluer automatiquement tous les candidats au chargement
  useEffect(() => {
    const evaluateAllCandidates = async () => {
      if (finalCandidatesData.length === 0) return;
      
      console.log('🔄 [AUTO-EVAL] Début de l\'évaluation automatique de tous les candidats');
      
      // Évaluer chaque candidat qui n'a pas encore été évalué
      for (const candidate of finalCandidatesData) {
        if (!candidateEvaluations[candidate.id]) {
          console.log(`🔍 [AUTO-EVAL] Évaluation du candidat: ${candidate.fullName}`);
          try {
            await evaluateCandidateAutomatically(candidate, true);
            // Petite pause entre les évaluations pour éviter la surcharge
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`❌ [AUTO-EVAL] Erreur pour ${candidate.fullName}:`, error);
          }
        }
      }
      
      console.log('✅ [AUTO-EVAL] Évaluation automatique terminée');
    };

    // Délai pour laisser le temps aux données de se charger
    const timeoutId = setTimeout(evaluateAllCandidates, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [finalCandidatesData.length]); // Se déclenche quand le nombre de candidats change

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


  // Transformer les données IA pour l'affichage
  const processedCandidatesData = useMemo(() => {
    console.log('🔍 [DEBUG] processedCandidatesData:', {
      finalCandidatesDataLength: finalCandidatesData.length,
      searchResultsLength: searchResults.length
    });
    
    // Si on a des résultats de recherche, les utiliser
    if (searchResults.length > 0) {
      return searchResults;
    }

    // Sinon, utiliser les données statiques
    if (!aiData) return finalCandidatesData;

    const allCandidates: CandidateApplication[] = [];

    // Parcourir dynamiquement tous les départements
    Object.entries(aiData).forEach(([departmentKey, candidates]) => {
      candidates.forEach((candidate, index) => {
        allCandidates.push({
          id: `${departmentKey}-${index}`,
          firstName: candidate.prenom,
          lastName: candidate.nom,
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

    return allCandidates;
  }, [aiData, searchResults]);

  // Filtrer et trier les candidats
  const filteredCandidates = useMemo(() => {
    let filtered = processedCandidatesData;

    // Filtrer par terme de recherche (recherche avancée)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate => {
        // Recherche dans les informations de base
        const basicMatch = 
          (candidate.firstName || candidate.first_name || '').toLowerCase().includes(searchLower) ||
          (candidate.lastName || candidate.last_name || '').toLowerCase().includes(searchLower) ||
          candidate.department.toLowerCase().includes(searchLower) ||
          candidate.poste.toLowerCase().includes(searchLower);
        
        // Recherche dans les données IA
        const aiMatch = 
          (candidate.aiData?.resume_global?.commentaire_global && candidate.aiData.resume_global.commentaire_global.toLowerCase().includes(searchLower)) ||
          (candidate.aiData?.mtp?.niveau && candidate.aiData.mtp.niveau.toLowerCase().includes(searchLower)) ||
          (candidate.aiData?.similarite_offre?.commentaire_score && candidate.aiData.similarite_offre.commentaire_score.toLowerCase().includes(searchLower)) ||
          (candidate.aiData?.conformite?.commentaire && candidate.aiData.conformite.commentaire.toLowerCase().includes(searchLower));
        
        return basicMatch || aiMatch;
      });
    }

    // Filtrer par département
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(candidate => candidate.department === selectedDepartment);
    }

    // Filtrer par verdict
    if (selectedVerdict !== "all") {
      filtered = filtered.filter(candidate => {
        const verdictLabel = getVerdictLabel(candidate.aiData.resume_global.verdict);
        return verdictLabel === selectedVerdict;
      });
    }

    // Filtrer par plage de score
    if (selectedScoreRange !== "all") {
      filtered = filtered.filter(candidate => {
        const score = candidate.aiData.resume_global.score_global * 100;
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
          aValue = `${a.firstName || a.first_name || 'N/A'} ${a.lastName || a.last_name || 'N/A'}`;
          bValue = `${b.firstName || b.first_name || 'N/A'} ${b.lastName || b.last_name || 'N/A'}`;
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
  }, [processedCandidatesData, searchTerm, selectedDepartment, selectedVerdict, selectedScoreRange, sortBy, sortOrder]);

  // Calculer la pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedVerdict, selectedScoreRange]);

  const handleViewResults = async (candidate: CandidateApplication) => {
    console.log('🔍 [DEBUG] handleViewResults appelé avec:', candidate);
    
    // Préparer les données au format Azure Container Apps API
    const rawCandidate = candidate.rawData || candidate;
    
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
    } else if (candidate.documents?.cv) {
      if (typeof candidate.documents.cv === 'string') {
        cvContent = candidate.documents.cv;
      } else if (candidate.documents.cv.url) {
        cvContent = `CV disponible: ${candidate.documents.cv.name} (${candidate.documents.cv.url})`;
      }
    } else if (candidate.cv) {
      if (typeof candidate.cv === 'string') {
        cvContent = candidate.cv;
      } else if (candidate.cv.url) {
        cvContent = `CV disponible: ${candidate.cv.name} (${candidate.cv.url})`;
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
    } else if (candidate.documents?.cover_letter) {
      if (typeof candidate.documents.cover_letter === 'string') {
        coverLetterContent = candidate.documents.cover_letter;
      } else if (candidate.documents.cover_letter.url) {
        coverLetterContent = `Lettre de motivation disponible: ${candidate.documents.cover_letter.name} (${candidate.documents.cover_letter.url})`;
      }
    } else if (candidate.cover_letter) {
      if (typeof candidate.cover_letter === 'string') {
        coverLetterContent = candidate.cover_letter;
      } else if (candidate.cover_letter.url) {
        coverLetterContent = `Lettre de motivation disponible: ${candidate.cover_letter.name} (${candidate.cover_letter.url})`;
      }
    } else if (rawCandidate.cover_letter) {
      if (typeof rawCandidate.cover_letter === 'string') {
        coverLetterContent = rawCandidate.cover_letter;
      } else if (rawCandidate.cover_letter.url) {
        coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.cover_letter.name} (${rawCandidate.cover_letter.url})`;
      }
    }
    
    const azureData = {
      id: candidate.id,
      Nom: candidate.nom || candidate.lastName || candidate.last_name || rawCandidate.last_name || 'N/A',
      Prénom: candidate.prenom || candidate.firstName || candidate.first_name || rawCandidate.first_name || 'N/A',
      cv: cvContent,
      lettre_motivation: coverLetterContent,
      MTP: {
        M: candidate.reponses_mtp?.metier ? candidate.reponses_mtp.metier.join(' | ') :
           rawCandidate.reponses_mtp?.metier ? rawCandidate.reponses_mtp.metier.join(' | ') : 
           candidate.aiData?.mtp?.reponses_mtp?.metier ? candidate.aiData.mtp.reponses_mtp.metier.join(' | ') : 'Réponses métier non disponibles',
        T: candidate.reponses_mtp?.talent ? candidate.reponses_mtp.talent.join(' | ') :
           rawCandidate.reponses_mtp?.talent ? rawCandidate.reponses_mtp.talent.join(' | ') : 
           candidate.aiData?.mtp?.reponses_mtp?.talent ? candidate.aiData.mtp.reponses_mtp.talent.join(' | ') : 'Réponses talent non disponibles',
        P: candidate.reponses_mtp?.paradigme ? candidate.reponses_mtp.paradigme.join(' | ') :
           rawCandidate.reponses_mtp?.paradigme ? rawCandidate.reponses_mtp.paradigme.join(' | ') : 
           candidate.aiData?.mtp?.reponses_mtp?.paradigme ? candidate.aiData.mtp.reponses_mtp.paradigme.join(' | ') : 'Réponses paradigme non disponibles'
      },
      post: candidate.poste || candidate.offre?.intitule || rawCandidate.offre?.intitule || 'Poste non spécifié'
    };
    
    console.log('📤 DONNÉES QUI SERAIENT ENVOYÉES À L\'API AZURE CONTAINER APPS:');
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

  const evaluateCandidateAutomatically = async (candidate: CandidateApplication, isBackground = false) => {
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

      // Préparer les données au format Azure Container Apps API
      const rawCandidate = candidate.rawData || candidate;
      
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
      } else if (candidate.documents?.cv) {
        if (typeof candidate.documents.cv === 'string') {
          cvContent = candidate.documents.cv;
        } else if (candidate.documents.cv.url) {
          cvContent = `CV disponible: ${candidate.documents.cv.name} (${candidate.documents.cv.url})`;
        }
      } else if (candidate.cv) {
        if (typeof candidate.cv === 'string') {
          cvContent = candidate.cv;
        } else if (candidate.cv.url) {
          cvContent = `CV disponible: ${candidate.cv.name} (${candidate.cv.url})`;
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
      } else if (candidate.documents?.cover_letter) {
        if (typeof candidate.documents.cover_letter === 'string') {
          coverLetterContent = candidate.documents.cover_letter;
        } else if (candidate.documents.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${candidate.documents.cover_letter.name} (${candidate.documents.cover_letter.url})`;
        }
      } else if (candidate.cover_letter) {
        if (typeof candidate.cover_letter === 'string') {
          coverLetterContent = candidate.cover_letter;
        } else if (candidate.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${candidate.cover_letter.name} (${candidate.cover_letter.url})`;
        }
      } else if (rawCandidate.cover_letter) {
        if (typeof rawCandidate.cover_letter === 'string') {
          coverLetterContent = rawCandidate.cover_letter;
        } else if (rawCandidate.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.cover_letter.name} (${rawCandidate.cover_letter.url})`;
        }
      }
      
      const evaluationData: EvaluationRequest = {
        candidate_id: candidate.id,
        candidate_name: candidate.nom || candidate.lastName || rawCandidate.nom || 'N/A',
        candidate_firstname: candidate.prenom || candidate.firstName || rawCandidate.prenom || 'N/A',
        job_title: candidate.poste || candidate.offre?.intitule || rawCandidate.offre?.intitule || 'Poste non spécifié',
        cv_content: cvContent,
        cover_letter_content: coverLetterContent,
        mtp_responses: {
          metier: candidate.reponses_mtp?.metier || rawCandidate.reponses_mtp?.metier || candidate.aiData?.mtp?.reponses_mtp?.metier || [],
          talent: candidate.reponses_mtp?.talent || rawCandidate.reponses_mtp?.talent || candidate.aiData?.mtp?.reponses_mtp?.talent || [],
          paradigme: candidate.reponses_mtp?.paradigme || rawCandidate.reponses_mtp?.paradigme || candidate.aiData?.mtp?.reponses_mtp?.paradigme || []
        }
      };

      console.log('🔍 ÉVALUATION AUTOMATIQUE DU CANDIDAT:', evaluationData);

      const result = await azureContainerAppsService.evaluateCandidate(evaluationData);

      if (result.success) {
        if (!isBackground) {
          setEvaluationData(result.data);
        }
        // Stocker l'évaluation pour ce candidat
        setCandidateEvaluations(prev => ({
          ...prev,
          [candidate.id]: result.data
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

  const handleSendToAPI = async (candidate: CandidateApplication) => {
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

      // Préparer les données au format Azure Container Apps API
      const rawCandidate = candidate.rawData || candidate;
      
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
      } else if (candidate.documents?.cv) {
        if (typeof candidate.documents.cv === 'string') {
          cvContent = candidate.documents.cv;
        } else if (candidate.documents.cv.url) {
          cvContent = `CV disponible: ${candidate.documents.cv.name} (${candidate.documents.cv.url})`;
        }
      } else if (candidate.cv) {
        if (typeof candidate.cv === 'string') {
          cvContent = candidate.cv;
        } else if (candidate.cv.url) {
          cvContent = `CV disponible: ${candidate.cv.name} (${candidate.cv.url})`;
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
      } else if (candidate.documents?.cover_letter) {
        if (typeof candidate.documents.cover_letter === 'string') {
          coverLetterContent = candidate.documents.cover_letter;
        } else if (candidate.documents.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${candidate.documents.cover_letter.name} (${candidate.documents.cover_letter.url})`;
        }
      } else if (candidate.cover_letter) {
        if (typeof candidate.cover_letter === 'string') {
          coverLetterContent = candidate.cover_letter;
        } else if (candidate.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${candidate.cover_letter.name} (${candidate.cover_letter.url})`;
        }
      } else if (rawCandidate.cover_letter) {
        if (typeof rawCandidate.cover_letter === 'string') {
          coverLetterContent = rawCandidate.cover_letter;
        } else if (rawCandidate.cover_letter.url) {
          coverLetterContent = `Lettre de motivation disponible: ${rawCandidate.cover_letter.name} (${rawCandidate.cover_letter.url})`;
        }
      }
      
      const candidateData: CandidateData = {
        id: candidate.id,
        Nom: candidate.nom || candidate.lastName || candidate.last_name || rawCandidate.last_name || 'N/A',
        Prénom: candidate.prenom || candidate.firstName || candidate.first_name || rawCandidate.first_name || 'N/A',
        cv: cvContent,
        lettre_motivation: coverLetterContent,
        MTP: {
          M: candidate.reponses_mtp?.metier ? candidate.reponses_mtp.metier.join(' | ') :
             rawCandidate.reponses_mtp?.metier ? rawCandidate.reponses_mtp.metier.join(' | ') : 
             candidate.aiData?.mtp?.reponses_mtp?.metier ? candidate.aiData.mtp.reponses_mtp.metier.join(' | ') : 'Réponses métier non disponibles',
          T: candidate.reponses_mtp?.talent ? candidate.reponses_mtp.talent.join(' | ') :
             rawCandidate.reponses_mtp?.talent ? rawCandidate.reponses_mtp.talent.join(' | ') : 
             candidate.aiData?.mtp?.reponses_mtp?.talent ? candidate.aiData.mtp.reponses_mtp.talent.join(' | ') : 'Réponses talent non disponibles',
          P: candidate.reponses_mtp?.paradigme ? candidate.reponses_mtp.paradigme.join(' | ') :
             rawCandidate.reponses_mtp?.paradigme ? rawCandidate.reponses_mtp.paradigme.join(' | ') : 
             candidate.aiData?.mtp?.reponses_mtp?.paradigme ? candidate.aiData.mtp.reponses_mtp.paradigme.join(' | ') : 'Réponses paradigme non disponibles'
        },
        post: candidate.poste || candidate.offre?.intitule || rawCandidate.offre?.intitule || 'Poste non spécifié'
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <ObserverLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des candidatures...</p>
            </div>
          </div>
        </div>
      </ObserverLayout>
    );
  }

  if (error) {
    return (
      <ObserverLayout>
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
      </ObserverLayout>
    );
  }

  return (
    <ObserverLayout>
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
              {isConnected !== null && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    API {isConnected ? 'Connectée' : 'En développement'}
                  </span>
                  {!isConnected && (
                    <span className="text-xs text-blue-600">
                      (Utilisation des données statiques)
                    </span>
                  )}
                </div>
              )}
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
                      disabled={!isConnected}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
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
                        {aiData && Object.keys(aiData).map((departmentKey) => (
                          <option key={departmentKey} value={departmentKey}>{departmentKey}</option>
                        ))}
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

        {/* Bouton de test modal */}
        <div className="mb-4">
          <Button
            variant="default"
            onClick={() => {
              console.log('🔍 [DEBUG] Test modal - ouverture manuelle');
              console.log('⚠️ [DEBUG] === OUVERTURE DU MODAL DE TEST ===');
              console.log('🎯 [DEBUG] === BOUTON TEST MODAL CLIQUE ===');
              console.log('📊 [DEBUG] === DONNÉES SIMULÉES CHARGÉES ===');
              setIsModalOpen(true);
              setSelectedCandidate({
                id: 'test-123',
                firstName: 'Test',
                lastName: 'Candidat',
                poste: 'Développeur Test',
                department: 'IT',
                email: 'test@example.com'
              } as any);
              console.log('✅ [DEBUG] Modal ouvert avec candidat de test');
              console.log('🚀 [DEBUG] === MODAL PRÊT À S\'AFFICHER ===');
            }}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Test Modal
          </Button>
        </div>

        {/* Tableau des candidats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Évaluations IA des Candidats
              {filteredCandidates.length > itemsPerPage && (
                <span className="text-sm font-normal text-muted-foreground">
                  - Page {currentPage} sur {totalPages}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Version desktop - Tableau */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Rang</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {console.log('🔍 [DEBUG] Rendu des candidats:', paginatedCandidates.length, 'candidats')}
                  {paginatedCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                            {(candidate.firstName || candidate.first_name || 'N')[0]}{(candidate.lastName || candidate.last_name || 'A')[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base break-words whitespace-normal">{candidate.firstName || candidate.first_name || 'N/A'} {candidate.lastName || candidate.last_name || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{candidate.poste}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm sm:text-base inline-flex whitespace-nowrap">#{candidate.aiData.resume_global.rang_global}</span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResults(candidate)}
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Voir Résultats</span>
                            <span className="sm:hidden">Voir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Version mobile - Cartes */}
            <div className="md:hidden space-y-4 p-4">
              {paginatedCandidates.map((candidate) => (
                <Card key={candidate.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {(candidate.firstName || candidate.first_name || 'N')[0]}{(candidate.lastName || candidate.last_name || 'A')[0]}
                      </div>
                      <div>
                        <div className="font-medium break-words whitespace-normal">{candidate.firstName || candidate.first_name || 'N/A'} {candidate.lastName || candidate.last_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground inline-flex whitespace-nowrap">#{candidate.aiData?.resume_global?.rang_global || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResults(candidate)}
                        className="gap-2 flex-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden xs:inline">Voir</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{candidate.poste}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {filteredCandidates.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun candidat trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Essayez de modifier vos critères de recherche." : "Aucune candidature disponible pour le moment."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredCandidates.length > itemsPerPage && (
              <div className="px-4 sm:px-6 py-4 border-t">
                {/* Informations sur mobile */}
                <div className="text-sm text-muted-foreground mb-4 sm:hidden text-center">
                  {startIndex + 1}-{Math.min(endIndex, filteredCandidates.length)} sur {filteredCandidates.length}
                </div>
                
                {/* Pagination responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Informations sur desktop */}
                  <div className="hidden sm:block text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages}
                  </div>
                  
                  {/* Contrôles de pagination */}
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                      className="flex items-center gap-1"
                  >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden xs:inline">Précédent</span>
                  </Button>
                  
                    <div className="flex items-center gap-1 overflow-x-auto">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Afficher seulement quelques pages autour de la page actuelle
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                              className="w-8 h-8 p-0 min-w-[32px] flex-shrink-0"
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                            <span key={page} className="text-muted-foreground px-1 flex-shrink-0">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                  >
                      <span className="hidden xs:inline">Suivant</span>
                      <ChevronRight className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de détails des évaluations IA */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            {console.log('🔍 [DEBUG] Modal rendu - isModalOpen:', isModalOpen, 'selectedCandidate:', selectedCandidate)}
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                <span className="truncate">
                  Évaluation IA - {selectedCandidate?.firstName || 'Test'} {selectedCandidate?.lastName || 'Candidat'}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            {/* Contenu de test si pas de candidat sélectionné */}
            {!selectedCandidate ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-muted-foreground">
                      <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Modal de test - Aucun candidat sélectionné</p>
                      <p className="text-sm">isModalOpen: {isModalOpen.toString()}</p>
                      <p className="text-sm">selectedCandidate: {selectedCandidate ? 'Défini' : 'Null'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : selectedCandidate && (
              <div className="space-y-6">
                {/* Informations du candidat */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Informations du candidat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                        <p className="text-lg">{selectedCandidate.firstName} {selectedCandidate.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Poste</p>
                        <p className="text-lg">{selectedCandidate.poste}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Département</p>
                        <p className="text-lg">{selectedCandidate.department}</p>
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
                        {evaluationData.verdict?.rationale && (
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Justification :</strong> {evaluationData.verdict.rationale}
                          </p>
                        )}
                        {evaluationData.verdict?.commentaires && evaluationData.verdict.commentaires.length > 0 && (
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
                        )}
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
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Points à Améliorer
                          </h4>
                          <ul className="space-y-1">
                            {evaluationData.faiblesses.map((faiblesse, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                {faiblesse}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Justifications */}
                      {evaluationData.justification && evaluationData.justification.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Justifications Détaillées
                          </h4>
                          <ul className="space-y-2">
                            {evaluationData.justification.map((justif, index) => (
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
                            <MessageSquare className="h-4 w-4 text-gray-500" />
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
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center text-muted-foreground">
                        <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune évaluation IA disponible</p>
                        <p className="text-sm">L'évaluation sera effectuée automatiquement</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Score Global (Ancien format - gardé pour compatibilité) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Score Global IA (Ancien Format)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {selectedCandidate.aiData?.resume_global?.score_global >= 0 
                            ? `${(selectedCandidate.aiData.resume_global.score_global * 100).toFixed(1)}%`
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
                </Card>

                {/* Scores MTP */}
                {selectedCandidate.aiData.mtp && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Évaluation MTP (Métier, Talent, Paradigme)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">
                            {(selectedCandidate.aiData.mtp.scores.Métier * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Métier</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {(selectedCandidate.aiData.mtp.scores.Talent * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Talent</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-500">
                            {(selectedCandidate.aiData.mtp.scores.Paradigme * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Paradigme</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-500">
                            {(selectedCandidate.aiData.mtp.scores.Moyen * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Moyen</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Niveau :</p>
                          <p className="text-sm bg-muted p-2 rounded">{selectedCandidate.aiData.mtp.niveau}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Points forts :</p>
                            <ul className="text-sm space-y-1">
                              {Array.isArray(selectedCandidate.aiData.mtp.points_forts) 
                                ? selectedCandidate.aiData.mtp.points_forts.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2">
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
                              {Array.isArray(selectedCandidate.aiData.mtp.points_a_travailler) 
                                ? selectedCandidate.aiData.mtp.points_a_travailler.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2">
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
                )}

                {/* Complétude */}
                {selectedCandidate.aiData.similarite_offre && (
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
                              ? `${selectedCandidate.aiData.similarite_offre.score * 10}%`
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
                                    <li key={index} className="flex items-start gap-2">
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
                                    <li key={index} className="flex items-start gap-2">
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
                )}

                {/* Conformité documentaire */}
                {selectedCandidate.aiData.conformite && (
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
                          {selectedCandidate.aiData.conformite.score_conformité}%
                        </div>
                        <p className="text-sm text-muted-foreground">Score de conformité</p>
                        <p className="text-sm bg-muted p-2 rounded mt-2">
                          {selectedCandidate.aiData.conformite.commentaire}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </ErrorBoundary>
    </ObserverLayout>
  );
}