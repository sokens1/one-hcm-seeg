import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, FileText, BarChart3, TrendingUp, Star } from 'lucide-react';

interface SynthesisData {
  protocol1Score: number;
  protocol1Status: string;
  protocol2Score: number;
  protocol2Status: string;
  globalScore: number;
  finalStatus: string;
  recommendation: string;
}

interface SynthesisDashboardProps {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  synthesisData: SynthesisData;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'in_progress':
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'embauche':
      return <Badge variant="success">Recommandé pour l'embauche</Badge>;
    case 'incubation':
      return <Badge variant="secondary">En cours d'évaluation</Badge>;
    case 'refuse':
      return <Badge variant="destructive">Non recommandé</Badge>;
    default:
      return <Badge variant="outline">En attente</Badge>;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export function SynthesisDashboard({ candidateName, jobTitle, applicationId, synthesisData }: SynthesisDashboardProps) {
  return (
    <div className="space-y-6">
      {/* En-tête de la Synthèse */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Synthèse Globale de l'Évaluation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Rapport de synthèse pour {candidateName} - {jobTitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(synthesisData.finalStatus)}
              <div className="text-right">
                <div className={`font-bold text-2xl ${getScoreColor(synthesisData.globalScore)}`}>
                  {synthesisData.globalScore}/100
                </div>
                <div className="text-xs text-muted-foreground">Score Global</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Score Global d'Évaluation</span>
              <span className={getScoreColor(synthesisData.globalScore)}>
                {synthesisData.globalScore}%
              </span>
            </div>
            <Progress value={synthesisData.globalScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Résultats par Protocole */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Protocole 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(synthesisData.protocol1Status)}
              Protocole 1 - Évaluation Initiale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score obtenu</span>
                <span className={`font-bold text-lg ${getScoreColor(synthesisData.protocol1Score)}`}>
                  {synthesisData.protocol1Score}/100
                </span>
              </div>
              <Progress value={synthesisData.protocol1Score} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Évaluation documentaire, MTP et entretien initial
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protocole 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(synthesisData.protocol2Status)}
              Protocole 2 - Évaluation Approfondie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score obtenu</span>
                <span className={`font-bold text-lg ${getScoreColor(synthesisData.protocol2Score)}`}>
                  {synthesisData.protocol2Score}/100
                </span>
              </div>
              <Progress value={synthesisData.protocol2Score} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Tests pratiques, jeux de rôle et validation opérationnelle
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse Détaillée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analyse Détaillée des Performances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Évaluation Documentaire</h5>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">4/5</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Adhérence MTP</h5>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">3/5</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Performance Entretien</h5>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">4/5</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recommandations et Conclusion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Recommandation finale :</h5>
              <p className="text-sm text-muted-foreground">
                {synthesisData.recommendation || 
                  "Le candidat présente un profil intéressant avec des compétences solides. Recommandation d'embauche sous réserve de formation complémentaire sur les aspects techniques spécifiques au poste."
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h6 className="font-medium text-green-600 mb-2">Points forts :</h6>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Excellente présentation des documents</li>
                  <li>• Bonne communication lors de l'entretien</li>
                  <li>• Motivation et engagement démontrés</li>
                  <li>• Expérience pertinente dans le domaine</li>
                </ul>
              </div>
              
              <div>
                <h6 className="font-medium text-orange-600 mb-2">Points d'amélioration :</h6>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Formation technique complémentaire nécessaire</li>
                  <li>• Adaptation aux outils internes requis</li>
                  <li>• Renforcement des compétences managériales</li>
                  <li>• Familiarisation avec les processus</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des Évaluations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historique du Processus d'Évaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Protocole 1 complété</div>
                <div className="text-xs text-muted-foreground">
                  Score : {synthesisData.protocol1Score}/100 - Candidat validé pour la phase suivante
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Terminé</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Protocole 2 complété</div>
                <div className="text-xs text-muted-foreground">
                  Score : {synthesisData.protocol2Score}/100 - Tests pratiques réalisés
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Terminé</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Synthèse générée</div>
                <div className="text-xs text-muted-foreground">
                  Score global : {synthesisData.globalScore}/100 - Décision finale disponible
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Maintenant</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
