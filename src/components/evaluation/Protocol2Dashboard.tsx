import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, AlertCircle, FileText, Users, Target, TrendingUp, Star } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useProtocol2Evaluation } from "@/hooks/useProtocol2Evaluation";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label, disabled = false }) => {
  // S'assurer que la valeur ne dépasse jamais 5
  const safeValue = Math.min(Math.max(value, 0), 5);
  
  return (
    <div className="space-y-2">
      <h5 className="font-medium text-sm">{label}</h5>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={cn(
                "w-5 h-5",
                star <= safeValue
                  ? disabled ? "fill-yellow-200 text-yellow-200" : "fill-yellow-400 text-yellow-400"
                  : disabled ? "text-gray-200" : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{Math.round(safeValue)}/5</span>
    </div>
  );
};

interface Protocol2DashboardProps {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  onStatusChange: (status: 'embauche' | 'refuse') => void;
  isReadOnly?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-100 text-green-800">Terminé</Badge>;
    case 'in_progress':
      return <Badge variant="default" className="bg-blue-100 text-blue-800">En cours</Badge>;
    default:
      return <Badge variant="secondary">En attente</Badge>;
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case 'candidature':
      return 'Candidature';
    case 'incubation':
      return 'Incubation';
    case 'embauche':
      return 'Embauche';
    case 'refuse':
      return 'Refusé';
    case 'completed':
      return 'Terminé';
    case 'in_progress':
      return 'En cours';
    default:
      return status;
  }
};

export function Protocol2Dashboard({ candidateName, jobTitle, applicationId, onStatusChange, isReadOnly = false }: Protocol2DashboardProps) {
  const {
    evaluationData,
    updateEvaluation,
    calculateSectionScores,
    isLoading,
    isSaving,
  } = useProtocol2Evaluation(applicationId);

  const handleDecision = (decision: 'embauche' | 'refuse') => {
    onStatusChange(decision);
  };

  const updateSection = (section: string, field: string, value: string | number) => {
    updateEvaluation(prev => {
      const newData = { ...prev };
      const [category, subCategory] = field.split('.');

      if (section === 'mise_en_situation') {
        newData.mise_en_situation = {
          ...newData.mise_en_situation,
          [category]: {
            ...newData.mise_en_situation[category as keyof typeof newData.mise_en_situation],
            [subCategory]: value
          }
        };
      } else if (section === 'validation_operationnelle') {
        newData.validation_operationnelle = {
          ...newData.validation_operationnelle,
          [category]: {
            ...newData.validation_operationnelle[category as keyof typeof newData.validation_operationnelle],
            [subCategory]: value
          }
        };
      } else if (section === 'analyse_competences') {
        newData.analyse_competences = {
          ...newData.analyse_competences,
          [category]: {
            ...newData.analyse_competences[category as keyof typeof newData.analyse_competences],
            [subCategory]: value
          }
        };
      }

      return newData;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Chargement de l'évaluation...</span>
        </div>
      </div>
    );
  }

  const scores = calculateSectionScores();

  return (
    <div className="space-y-6">
      {/* En-tête du Protocole 2 */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Synthèse de l'Évaluation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Candidat: {candidateName} • Poste: {jobTitle}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{scores.globalScore.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Score Global</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de progression globale */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-600">Progression de l'évaluation</span>
            </div>
            <Progress 
              value={scores.globalScore} 
              className="h-3 bg-gray-200"
              style={{
                '--progress-foreground': 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
              } as React.CSSProperties}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Pondération :</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Mise en Situation</div>
                <div className="font-semibold text-sm text-blue-600">{scores.miseEnSituationScore.toFixed(1)}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Planification de la performance</div>
                <div className="font-semibold text-sm text-green-600">{scores.validationScore.toFixed(1)}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Compétence</div>
                <div className="font-semibold text-sm text-purple-600">{scores.analyseScore.toFixed(1)}%</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Statut Actuel:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {translateStatus(evaluationData.status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Mise en Situation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.status)}
              Mise en Situation
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(evaluationData.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <StarRating
                value={evaluationData.mise_en_situation.jeu_de_role.score}
                onChange={(value) => !isReadOnly && updateSection('mise_en_situation', 'jeu_de_role.score', value)}
                label="Jeu de Rôle fonctionnel"
                disabled={isReadOnly}
              />
              <Textarea
                placeholder="Commentaires sur le jeu de rôle..."
                value={evaluationData.mise_en_situation.jeu_de_role.comments}
                onChange={(e) => !isReadOnly && updateSection('mise_en_situation', 'jeu_de_role.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <StarRating
                value={evaluationData.mise_en_situation.jeu_codir.score}
                onChange={(value) => !isReadOnly && updateSection('mise_en_situation', 'jeu_codir.score', value)}
                label="Jeu de role CODIR"
                disabled={isReadOnly}
              />
              <Textarea
                placeholder="Commentaires sur le jeu CODIR..."
                value={evaluationData.mise_en_situation.jeu_codir.comments}
                onChange={(e) => !isReadOnly && updateSection('mise_en_situation', 'jeu_codir.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Opérationnelle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.status)}
              Planification de la performance
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(evaluationData.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <StarRating
                value={evaluationData.validation_operationnelle.fiche_kpis.score}
                onChange={(value) => !isReadOnly && updateSection('validation_operationnelle', 'fiche_kpis.score', value)}
                label="Key Performance Indicators (KPI's)"
                disabled={isReadOnly}
              />
              <Textarea
                placeholder="Commentaires sur les KPI's..."
                value={evaluationData.validation_operationnelle.fiche_kpis.comments}
                onChange={(e) => !isReadOnly && updateSection('validation_operationnelle', 'fiche_kpis.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <StarRating
                value={evaluationData.validation_operationnelle.fiche_kpis.score}
                onChange={(value) => !isReadOnly && updateSection('validation_operationnelle', 'fiche_kpis.score', value)}
                label="Key Risque Indicators (KRI's)"
                disabled={isReadOnly}
              />
              <Textarea
                placeholder="Commentaires sur les KRI's..."
                value={evaluationData.validation_operationnelle.fiche_kpis.comments}
                onChange={(e) => !isReadOnly && updateSection('validation_operationnelle', 'fiche_kpis.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <StarRating
                value={evaluationData.validation_operationnelle.fiche_kpis.score}
                onChange={(value) => !isReadOnly && updateSection('validation_operationnelle', 'fiche_kpis.score', value)}
                label="Key Control Indicators (KCI's)"
                disabled={isReadOnly}
              />
              <Textarea
                placeholder="Commentaires sur les KCI's..."
                value={evaluationData.validation_operationnelle.fiche_kpis.comments}
                onChange={(e) => !isReadOnly && updateSection('validation_operationnelle', 'fiche_kpis.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyse des Compétences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.status)}
              Compétence
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(evaluationData.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <StarRating
                value={evaluationData.analyse_competences.gap_competences.score}
                onChange={(value) => !isReadOnly && updateSection('analyse_competences', 'gap_competences.score', value)}
                label="Gap de compétences"
                disabled={isReadOnly}
              />
              <Textarea
                placeholder="Commentaires sur l'analyse des compétences..."
                value={evaluationData.analyse_competences.gap_competences.comments}
                onChange={(e) => !isReadOnly && updateSection('analyse_competences', 'gap_competences.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Formation requise et Justification</h5>
                <Textarea
                  placeholder="Commentaires sur la formation requise et justification..."
                  value={evaluationData.analyse_competences.plan_formation.comments}
                  onChange={(e) => !isReadOnly && updateSection('analyse_competences', 'plan_formation.comments', e.target.value)}
                  className={cn("min-h-[120px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Décision Finale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Décision Finale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => !isReadOnly && handleDecision('refuse')}
              className={cn("text-red-600 border-red-300 hover:bg-red-50", isReadOnly ? "opacity-50 cursor-not-allowed" : "")}
              disabled={isReadOnly}
            >
              <AlertCircle className="w-4 h-4" />
              Refuser
            </Button>
            <Button 
              onClick={() => !isReadOnly && handleDecision('embauche')}
              className={cn("bg-green-600 hover:bg-green-700", isReadOnly ? "opacity-50 cursor-not-allowed" : "")}
              disabled={isReadOnly}
            >
              <CheckCircle className="w-4 h-4" />
              Engager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicateur de sauvegarde */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
          <span>Sauvegarde en cours...</span>
        </div>
      )}
    </div>
  );
}