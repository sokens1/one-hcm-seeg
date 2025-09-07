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
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useAIData, AICandidateData } from "@/hooks/useAIData";
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
  const { data: aiData, isLoading, error } = useAIData();
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
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Transformer les données IA pour l'affichage
  const candidatesData = useMemo(() => {
    if (!aiData) return [];

    const allCandidates: CandidateApplication[] = [];

    // Parcourir dynamiquement tous les départements
    Object.entries(aiData).forEach(([departmentKey, candidates]) => {
      candidates.forEach((candidate, index) => {
        // Capitaliser la première lettre du département pour l'affichage
        const departmentName = departmentKey.charAt(0).toUpperCase() + departmentKey.slice(1);
        
        allCandidates.push({
          id: `${departmentKey}-${index}`,
          firstName: candidate.prenom,
          lastName: candidate.nom,
          poste: candidate.poste,
          department: departmentName,
          aiData: candidate
        });
      });
    });

    return allCandidates;
  }, [aiData]);

  // Filtrer et trier les candidats
  const filteredCandidates = useMemo(() => {
    let filtered = candidatesData;

    // Filtrer par terme de recherche (recherche avancée)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate => {
        // Recherche dans les informations de base
        const basicMatch = 
          candidate.firstName.toLowerCase().includes(searchLower) ||
          candidate.lastName.toLowerCase().includes(searchLower) ||
          candidate.department.toLowerCase().includes(searchLower) ||
          candidate.poste.toLowerCase().includes(searchLower);
        
        // Recherche dans les données IA
        const aiMatch = 
          candidate.aiData.resume_global.commentaire_global.toLowerCase().includes(searchLower) ||
          (candidate.aiData.mtp?.niveau && candidate.aiData.mtp.niveau.toLowerCase().includes(searchLower)) ||
          (candidate.aiData.similarite_offre?.commentaire_score && candidate.aiData.similarite_offre.commentaire_score.toLowerCase().includes(searchLower)) ||
          (candidate.aiData.conformite?.commentaire && candidate.aiData.conformite.commentaire.toLowerCase().includes(searchLower));
        
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
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case "score":
          aValue = a.aiData.resume_global.score_global;
          bValue = b.aiData.resume_global.score_global;
          break;
        case "rang":
          aValue = a.aiData.resume_global.rang_global;
          bValue = b.aiData.resume_global.rang_global;
          break;
        case "verdict":
          aValue = getVerdictLabel(a.aiData.resume_global.verdict);
          bValue = getVerdictLabel(b.aiData.resume_global.verdict);
          break;
        case "departement":
          aValue = a.department;
          bValue = b.department;
          break;
        default:
          aValue = a.aiData.resume_global.rang_global;
          bValue = b.aiData.resume_global.rang_global;
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
  }, [candidatesData, searchTerm, selectedDepartment, selectedVerdict, selectedScoreRange, sortBy, sortOrder]);

  // Calculer la pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedVerdict, selectedScoreRange]);

  const handleViewResults = (candidate: CandidateApplication) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
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
                  <div className="flex-1 sm:max-w-[200px]">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les départements</SelectItem>
                        {aiData && Object.keys(aiData).map((departmentKey) => {
                          const departmentName = departmentKey.charAt(0).toUpperCase() + departmentKey.slice(1);
                          return (
                            <SelectItem key={departmentKey} value={departmentName}>
                              Département {departmentName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
              Évaluations IA des Candidats ({filteredCandidates.length})
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
                    <TableHead>Département</TableHead>
                    <TableHead>Rang</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                            {candidate.firstName[0]}{candidate.lastName[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{candidate.firstName} {candidate.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{candidate.poste}</span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">{candidate.department}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm sm:text-base">#{candidate.aiData.resume_global.rang_global}</span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(candidate)}
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Voir Résultats</span>
                          <span className="sm:hidden">Voir</span>
                        </Button>
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
                        {candidate.firstName[0]}{candidate.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium">{candidate.firstName} {candidate.lastName}</div>
                        <div className="text-sm text-muted-foreground">#{candidate.aiData.resume_global.rang_global}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResults(candidate)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden xs:inline">Voir</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{candidate.poste}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{candidate.department}</Badge>
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
                    Affichage de {startIndex + 1} à {Math.min(endIndex, filteredCandidates.length)} sur {filteredCandidates.length} candidats
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
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                <span className="truncate">Évaluation IA - {selectedCandidate?.firstName} {selectedCandidate?.lastName}</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedCandidate && (
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

                {/* Score Global */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Score Global IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {selectedCandidate.aiData.resume_global.score_global >= 0 
                            ? `${(selectedCandidate.aiData.resume_global.score_global * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </div>
                        <p className="text-sm text-muted-foreground">Score Global</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          #{selectedCandidate.aiData.resume_global.rang_global || 'N/A'}
                        </div>
                        <p className="text-sm text-muted-foreground">Rang</p>
                      </div>
                      <div className="text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          getVerdictVariant(selectedCandidate.aiData.resume_global.verdict) === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : getVerdictVariant(selectedCandidate.aiData.resume_global.verdict) === 'secondary'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getVerdictLabel(selectedCandidate.aiData.resume_global.verdict)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Verdict</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Commentaire global :</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">
                        {selectedCandidate.aiData.resume_global.commentaire_global}
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

                {/* Similarité avec l'offre */}
                {selectedCandidate.aiData.similarite_offre && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Similarité avec l'offre
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