import { useState, useMemo } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
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
  BarChart3
} from "lucide-react";
import { useAIData, AICandidateData } from "@/hooks/useAIData";

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
  switch (verdict.toLowerCase()) {
    case 'retenu':
    case 'favorable':
      return 'Favorable';
    case 'mitigé':
      return 'Mitigé';
    case 'défavorable':
    case 'non retenu':
    case 'rejeté':
      return 'Non retenu';
    default:
      return verdict;
  }
};

const getVerdictVariant = (verdict: string) => {
  switch (verdict.toLowerCase()) {
    case 'retenu':
    case 'favorable':
      return 'success';
    case 'mitigé':
      return 'secondary';
    case 'défavorable':
    case 'non retenu':
    case 'rejeté':
      return 'destructive';
    default:
      return 'default';
  }
};

export default function Traitements_IA() {
  const { data: aiData, isLoading, error } = useAIData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transformer les données IA pour l'affichage
  const candidatesData = useMemo(() => {
    if (!aiData) return [];

    const allCandidates: CandidateApplication[] = [];

    // Ajouter les candidats du département Eau
    aiData.eau.forEach((candidate, index) => {
      allCandidates.push({
        id: `eau-${index}`,
        firstName: candidate.prenom,
        lastName: candidate.nom,
        poste: candidate.poste,
        department: 'Eau',
        aiData: candidate
      });
    });

    // Ajouter les candidats du département Sable
    aiData.sable.forEach((candidate, index) => {
      allCandidates.push({
        id: `sable-${index}`,
        firstName: candidate.prenom,
        lastName: candidate.nom,
        poste: candidate.poste,
        department: 'Sable',
        aiData: candidate
      });
    });

    return allCandidates;
  }, [aiData]);

  // Filtrer les candidats selon le terme de recherche et le département
  const filteredCandidates = useMemo(() => {
    let filtered = candidatesData;

    // Filtrer par département
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(candidate => candidate.department === selectedDepartment);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(candidate => 
        candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.poste.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [candidatesData, searchTerm, selectedDepartment]);

  const handleViewResults = (candidate: CandidateApplication) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

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
      <div className="container mx-auto px-4 py-6">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Traitements IA</h1>
              <p className="text-muted-foreground">Gestion intelligente des candidatures</p>
            </div>
          </div>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{candidatesData.length}</p>
                    <p className="text-sm text-muted-foreground">Total candidats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-cyan-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {candidatesData.filter(c => c.department === 'Eau').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Département Eau</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {candidatesData.filter(c => c.department === 'Sable').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Département Sable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {candidatesData.filter(c => 
                        c.aiData.resume_global.verdict.toLowerCase().includes('retenu') ||
                        c.aiData.resume_global.verdict.toLowerCase().includes('favorable')
                      ).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Favorables</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {candidatesData.filter(c => 
                        c.aiData.resume_global.verdict.toLowerCase().includes('mitigé')
                      ).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Mitigés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {candidatesData.filter(c => 
                        c.aiData.resume_global.verdict.toLowerCase().includes('non retenu') ||
                        c.aiData.resume_global.verdict.toLowerCase().includes('rejeté') ||
                        c.aiData.resume_global.verdict.toLowerCase().includes('défavorable')
                      ).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Non retenus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, prénom, département ou poste..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    <SelectItem value="Eau">Département Eau</SelectItem>
                    <SelectItem value="Sable">Département Sable</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des candidats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Évaluations IA des Candidats ({filteredCandidates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {candidate.firstName[0]}{candidate.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{candidate.poste}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{candidate.department}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">#{candidate.aiData.resume_global.rang_global}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(candidate)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Voir Résultats
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          </CardContent>
        </Card>

        {/* Modal de détails des évaluations IA */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          {selectedCandidate.aiData.resume_global.score_global > 0 
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
                        <Badge variant={getVerdictVariant(selectedCandidate.aiData.resume_global.verdict)} className="text-lg px-4 py-2">
                          {getVerdictLabel(selectedCandidate.aiData.resume_global.verdict)}
                        </Badge>
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
                              ? `${(selectedCandidate.aiData.similarite_offre.score * 100).toFixed(1)}%`
                              : `${(selectedCandidate.aiData.similarite_offre.score * 100).toFixed(1)}%`
                            }
                          </div>
                          <p className="text-sm text-muted-foreground">Score de similarité</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Expérience :</p>
                          <p className="text-sm bg-muted p-2 rounded">
                            {typeof selectedCandidate.aiData.similarite_offre.resume_experience === 'string' 
                              ? selectedCandidate.aiData.similarite_offre.resume_experience
                              : `${selectedCandidate.aiData.similarite_offre.resume_experience.nombre_d_annees} ans - ${selectedCandidate.aiData.similarite_offre.resume_experience.specialite}`
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Commentaire :</p>
                          <p className="text-sm bg-muted p-2 rounded">
                            {selectedCandidate.aiData.similarite_offre.commentaire_score}
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
    </RecruiterLayout>
  );
}
