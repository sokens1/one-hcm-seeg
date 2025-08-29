/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, CheckCircle, Clock, AlertCircle, FileText, Users, Target, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
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
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{value}/5</span>
    </div>
  );
};

interface Protocol2Data {
  score: number;
  status: 'pending' | 'in_progress' | 'completed';
  miseEnSituation: {
    jeuDeRole: {
      score: number;
      comments: string;
    };
    jeuCodir: {
      score: number;
      comments: string;
    };
  };
  validationOperationnelle: {
    ficheKPIS: {
      score: number;
      comments: string;
    };
  };
  analyseCompetences: {
    gapCompetences: {
      score: number;
      comments: string;
    };
    planFormation: {
      score: number;
      comments: string;
    };
  };
}

interface Protocol2DashboardProps {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  onStatusChange: (status: 'embauche' | 'refuse') => void;
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

export function Protocol2Dashboard({ candidateName, jobTitle, applicationId, onStatusChange }: Protocol2DashboardProps) {
  const [protocol2Data, setProtocol2Data] = useState<Protocol2Data>({
    score: 0,
    status: 'pending',
    miseEnSituation: {
      jeuDeRole: {
        score: 0,
        comments: ''
      },
      jeuCodir: {
        score: 0,
        comments: ''
      }
    },
    validationOperationnelle: {
      ficheKPIS: {
        score: 0,
        comments: ''
      }
    },
    analyseCompetences: {
      gapCompetences: {
        score: 0,
        comments: ''
      },
      planFormation: {
        score: 0,
        comments: ''
      }
    }
  });

  const calculateSectionScores = () => {
    const miseEnSituationScore = (protocol2Data.miseEnSituation.jeuDeRole.score + protocol2Data.miseEnSituation.jeuCodir.score) / 2;
    const validationScore = protocol2Data.validationOperationnelle.ficheKPIS.score;
    const analyseScore = (protocol2Data.analyseCompetences.gapCompetences.score + protocol2Data.analyseCompetences.planFormation.score) / 2;

    return {
      miseEnSituationScore,
      validationScore,
      analyseScore,
      globalScore: ((miseEnSituationScore + validationScore + analyseScore) / 3) * 20 // Convertir en pourcentage
    };
  };

  const updateProtocol2 = (section: string, fieldPath: string, value: any) => {
    setProtocol2Data(prev => {
      const newData = { ...prev };
      
      // Mise à jour des données selon la section
      if (section === 'miseEnSituation') {
        const [activity, property] = fieldPath.split('.');
        newData.miseEnSituation = {
          ...newData.miseEnSituation,
          [activity]: {
            ...newData.miseEnSituation[activity as keyof typeof newData.miseEnSituation],
            [property]: value
          }
        };
      } else if (section === 'validationOperationnelle') {
        const [activity, property] = fieldPath.split('.');
        newData.validationOperationnelle = {
          ...newData.validationOperationnelle,
          [activity]: {
            ...newData.validationOperationnelle[activity as keyof typeof newData.validationOperationnelle],
            [property]: value
          }
        };
      } else if (section === 'analyseCompetences') {
        const [activity, property] = fieldPath.split('.');
        newData.analyseCompetences = {
          ...newData.analyseCompetences,
          [activity]: {
            ...newData.analyseCompetences[activity as keyof typeof newData.analyseCompetences],
            [property]: value
          }
        };
      }

      // Calculer le score global et mettre à jour le statut
      const scores = calculateSectionScores();
      newData.score = scores.globalScore;

      // Mettre à jour le statut
      if (newData.score > 0) {
        newData.status = 'in_progress';
      }
      if (newData.score >= 60) {
        newData.status = 'completed';
      }

      return newData;
    });
  };

  const scores = calculateSectionScores();

  return (
    <div className="space-y-6">
      {/* Header - Synthèse de l'Évaluation */}
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
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Mise en Situation</div>
              <div className="font-semibold text-sm text-blue-600">{scores.miseEnSituationScore.toFixed(1)}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Validation Opérationnelle</div>
              <div className="font-semibold text-sm text-green-600">{scores.validationScore.toFixed(1)}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Analyse des Compétences</div>
              <div className="font-semibold text-sm text-purple-600">{scores.analyseScore.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mise en Situation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(protocol2Data.status)}
              Mise en Situation
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(protocol2Data.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <StarRating
                value={protocol2Data.miseEnSituation.jeuDeRole.score}
                onChange={(value) => updateProtocol2('miseEnSituation', 'jeuDeRole.score', value)}
                label="Jeu de Rôle"
              />
              <Textarea
                placeholder="Commentaires sur le jeu de rôle..."
                value={protocol2Data.miseEnSituation.jeuDeRole.comments}
                onChange={(e) => updateProtocol2('miseEnSituation', 'jeuDeRole.comments', e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            
            <div className="space-y-3">
              <StarRating
                value={protocol2Data.miseEnSituation.jeuCodir.score}
                onChange={(value) => updateProtocol2('miseEnSituation', 'jeuCodir.score', value)}
                label="Jeu de mise en situation CODIR"
              />
              <Textarea
                placeholder="Commentaires sur le jeu CODIR..."
                value={protocol2Data.miseEnSituation.jeuCodir.comments}
                onChange={(e) => updateProtocol2('miseEnSituation', 'jeuCodir.comments', e.target.value)}
                className="min-h-[60px]"
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
              {getStatusIcon(protocol2Data.status)}
              Validation Opérationnelle
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(protocol2Data.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <StarRating
              value={protocol2Data.validationOperationnelle.ficheKPIS.score}
              onChange={(value) => updateProtocol2('validationOperationnelle', 'ficheKPIS.score', value)}
              label="Edition de Fiche KPI'S"
            />
            <Textarea
              placeholder="Commentaires sur la fiche KPI'S..."
              value={protocol2Data.validationOperationnelle.ficheKPIS.comments}
              onChange={(e) => updateProtocol2('validationOperationnelle', 'ficheKPIS.comments', e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Analyse des Compétences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(protocol2Data.status)}
              Analyse des Compétences
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(protocol2Data.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Analyse du "Gap" de compétences</Label>
              <Select 
                value={protocol2Data.analyseCompetences.gapCompetences.score.toString()}
                onValueChange={(value) => updateProtocol2('analyseCompetences', 'gapCompetences.score', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Élevé - Formation approfondie requise</SelectItem>
                  <SelectItem value="3">Moyen - Formation significative nécessaire</SelectItem>
                  <SelectItem value="5">Faible - Formation mineure requise</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Commentaires sur le gap de compétences..."
                value={protocol2Data.analyseCompetences.gapCompetences.comments}
                onChange={(e) => updateProtocol2('analyseCompetences', 'gapCompetences.comments', e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            
            <div className="space-y-3">
              <StarRating
                value={protocol2Data.analyseCompetences.planFormation.score}
                onChange={(value) => updateProtocol2('analyseCompetences', 'planFormation.score', value)}
                label="Justification et Plan de Formation"
              />
              <Textarea
                placeholder="Commentaires sur le plan de formation..."
                value={protocol2Data.analyseCompetences.planFormation.comments}
                onChange={(e) => updateProtocol2('analyseCompetences', 'planFormation.comments', e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Décision Finale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Décision Finale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              variant="destructive" 
              onClick={() => handleDecision('refuse')}
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Refuser
            </Button>
            <Button 
              onClick={() => handleDecision('embauche')}
              disabled={protocol2Data.status !== 'completed'}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Engager
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}