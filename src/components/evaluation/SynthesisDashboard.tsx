import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/ui/editor";
import { CheckCircle, Clock, AlertCircle, FileText, BarChart3, TrendingUp, Star, Download } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StarDisplayProps {
  value: number;
  label: string;
}

const StarDisplay: React.FC<StarDisplayProps> = ({ value, label }) => {
  // S'assurer que la valeur ne dépasse jamais 5
  const safeValue = Math.min(Math.max(value, 0), 5);
  
  return (
    <div className="space-y-2">
      <h5 className="font-medium text-sm">{label}</h5>
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4",
                star <= safeValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(safeValue)}/5</span>
      </div>
    </div>
  );
};

interface SynthesisData {
  protocol1: {
    score: number;
    status: string;
    validationPrerequis: number;
    evaluationMTP: number;
    entretien: number;
  };
  protocol2: {
    score: number;
    status: string;
    miseEnSituation: number;
    validationOperationnelle: number;
    analyseCompetences: number;
  };
  globalScore: number;
  finalStatus: string;
  pointsForts: string;
  pointsAmelioration: string;
  conclusion?: string;
}

interface SynthesisDashboardProps {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  synthesisData: SynthesisData;
  isReadOnly?: boolean;
  onUpdate?: (data: Partial<SynthesisData>) => void;
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
    case 'embauche':
      return <Badge variant="default" className="bg-green-100 text-green-800">Recommandé pour l'embauche</Badge>;
    case 'incubation':
      return <Badge variant="default" className="bg-blue-100 text-blue-800">En cours d'évaluation</Badge>;
    case 'refuse':
      return <Badge variant="destructive">Non recommandé</Badge>;
    default:
      return <Badge variant="secondary">En attente</Badge>;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-blue-600';
};

export function SynthesisDashboard({ 
  candidateName, 
  jobTitle, 
  applicationId, 
  synthesisData, 
  isReadOnly = false,
  onUpdate
}: SynthesisDashboardProps) {
  const handleDownloadReport = () => {
    // TODO: Implémenter la génération et le téléchargement du rapport
    console.log('Téléchargement du rapport...');
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la Synthèse */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Synthèse Globale de l'Évaluation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Rapport de synthèse pour {candidateName} • {jobTitle}
              </p>
            </div>
              <div className="flex items-center gap-4">
              <div className="text-right">
              <div className="text-2xl font-bold text-primary">{synthesisData.globalScore.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Score Global</div>
              </div>

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
              value={synthesisData.globalScore} 
              className="h-3 bg-gray-200"
              style={{
                '--progress-foreground': 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
              } as React.CSSProperties}
            />
          </div>
        </CardContent>
      </Card>

      {/* Résultats par Protocole */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Protocole 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(synthesisData.protocol1.status)}
              Protocole 1 - Évaluation Initiale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score obtenu</span>
                <span className={`font-bold text-lg ${getScoreColor(synthesisData.protocol1.score)}`}>
                  {synthesisData.protocol1.score.toFixed(1)}%
                </span>
              </div>
              <Progress value={synthesisData.protocol1.score} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Protocole 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(synthesisData.protocol2.status)}
              Protocole 2 - Évaluation Approfondie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score obtenu</span>
                <span className={`font-bold text-lg ${getScoreColor(synthesisData.protocol2.score)}`}>
                  {synthesisData.protocol2.score.toFixed(1)}%
                </span>
              </div>
              <Progress value={synthesisData.protocol2.score} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse Détaillée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rubriques détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StarDisplay 
              value={synthesisData.protocol1.validationPrerequis}
              label="Validation des Prérequis"
            />
            <StarDisplay 
              value={synthesisData.protocol1.evaluationMTP}
              label="Évaluation MTP"
            />
            <StarDisplay 
              value={synthesisData.protocol1.entretien}
              label="Entretien"
            />
            <StarDisplay 
              value={synthesisData.protocol2.miseEnSituation}
              label="Mise en Situation"
            />
            <StarDisplay 
              value={synthesisData.protocol2.validationOperationnelle}
              label="Planification de la performance"
            />
            <StarDisplay 
              value={synthesisData.protocol2.analyseCompetences}
              label="Compétence"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Conclusion et Recommandation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
              <div>
                <h6 className="font-medium text-green-600 mb-2">Points forts :</h6>
              <Editor
                value={synthesisData.pointsForts}
                onChange={(value) => onUpdate?.({ pointsForts: value })}
                placeholder="Listez les points forts du candidat..."
                disabled={isReadOnly}
              />
              </div>
              
              <div>
                <h6 className="font-medium text-orange-600 mb-2">Points d'amélioration :</h6>
              <Editor
                value={synthesisData.pointsAmelioration}
                onChange={(value) => onUpdate?.({ pointsAmelioration: value })}
                placeholder="Listez les points d'amélioration..."
                disabled={isReadOnly}
              />
            </div>
            
            <div>
              <h6 className="font-medium text-blue-600 mb-2">Conclusion :</h6>
              <Editor
                value={synthesisData.conclusion || ''}
                onChange={(value) => onUpdate?.({ conclusion: value })}
                placeholder="Rédigez la conclusion de l'évaluation..."
                disabled={isReadOnly}
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleDownloadReport}
                className="bg-gray-400 hover:bg-gray-500 w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3"
                disabled={true}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le rapport
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
