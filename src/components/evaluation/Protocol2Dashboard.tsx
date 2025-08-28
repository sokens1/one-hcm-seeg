/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/SafeSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Clock, AlertCircle, FileText, Users, Target, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Protocol2Data {
  score: number;
  status: 'pending' | 'in_progress' | 'completed';
  rolePlay: {
    completed: boolean;
    score: number;
    reportAttached: boolean;
  };
  codirGame: {
    completed: boolean;
    score: number;
    reportAttached: boolean;
  };
  physicalVisit: boolean;
  jobDescriptionValidated: boolean;
  skillsGap: 'low' | 'medium' | 'high';
  skillsGapJustification: string;
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
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'in_progress':
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Terminé</Badge>;
    case 'in_progress':
      return <Badge variant="secondary">En cours</Badge>;
    default:
      return <Badge variant="outline">En attente</Badge>;
  }
};

const getSkillsGapColor = (gap: string) => {
  switch (gap) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export function Protocol2Dashboard({ candidateName, jobTitle, applicationId, onStatusChange }: Protocol2DashboardProps) {
  const [protocol2Data, setProtocol2Data] = useState<Protocol2Data>({
    score: 0,
    status: 'pending',
    rolePlay: {
      completed: false,
      score: 0,
      reportAttached: false
    },
    codirGame: {
      completed: false,
      score: 0,
      reportAttached: false
    },
    physicalVisit: false,
    jobDescriptionValidated: false,
    skillsGap: 'medium',
    skillsGapJustification: ""
  });

  const updateProtocol2 = (field: string, value: any) => {
    setProtocol2Data(prev => {
      const newProtocol2 = {
        ...prev,
        [field]: value
      };
      
      // Calculer le score du protocole 2 dynamiquement
      let totalScore = 0;
      let scoreCount = 0;
      
      if (newProtocol2.rolePlay.completed && newProtocol2.rolePlay.score > 0) {
        totalScore += newProtocol2.rolePlay.score;
        scoreCount++;
      }
      
      if (newProtocol2.codirGame.completed && newProtocol2.codirGame.score > 0) {
        totalScore += newProtocol2.codirGame.score;
        scoreCount++;
      }
      
      // Bonus pour validations opérationnelles
      if (newProtocol2.physicalVisit) totalScore += 5;
      if (newProtocol2.jobDescriptionValidated) totalScore += 5;
      
      newProtocol2.score = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
      
      // Mettre à jour le statut
      if (newProtocol2.rolePlay.completed || newProtocol2.codirGame.completed) {
        newProtocol2.status = 'in_progress';
      }
      if (newProtocol2.rolePlay.completed && newProtocol2.codirGame.completed) {
        newProtocol2.status = 'completed';
      }
      
      return newProtocol2;
    });
  };

  const handleDecision = (decision: 'embauche' | 'refuse') => {
    onStatusChange(decision);
  };

  return (
    <div className="space-y-6">
      {/* En-tête du Protocole 2 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(protocol2Data.status)}
                Protocole 2 - Évaluation Approfondie
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tests pratiques et validation opérationnelle pour {candidateName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(protocol2Data.status)}
              <div className="text-right">
                <div className="font-bold text-lg">{protocol2Data.score}/100</div>
                <div className="text-xs text-muted-foreground">Score Global P2</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression Protocole 2</span>
              <span>{protocol2Data.score}%</span>
            </div>
            <Progress value={protocol2Data.score} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Section 2.1: Tests Pratiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            2.1 Tests Pratiques & Mise en Situation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jeu de Rôle */}
            <div className="space-y-3">
              <h5 className="font-medium">Jeu de Rôle</h5>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={protocol2Data.rolePlay.completed}
                  onCheckedChange={(checked) => updateProtocol2('rolePlay', {
                    ...protocol2Data.rolePlay,
                    completed: checked
                  })}
                />
                <Badge variant={protocol2Data.rolePlay.completed ? "default" : "secondary"}>
                  {protocol2Data.rolePlay.completed ? "Réalisé" : "Non réalisé"}
                </Badge>
              </div>
              {protocol2Data.rolePlay.completed && (
                <div className="space-y-2">
                  <Label>Score obtenu</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={protocol2Data.rolePlay.score}
                      onChange={(e) => updateProtocol2('rolePlay', {
                        ...protocol2Data.rolePlay,
                        score: parseInt(e.target.value) || 0
                      })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={protocol2Data.rolePlay.reportAttached}
                      onCheckedChange={(checked) => updateProtocol2('rolePlay', {
                        ...protocol2Data.rolePlay,
                        reportAttached: checked
                      })}
                    />
                    <Label className="text-sm">Rapport annexé</Label>
                  </div>
                </div>
              )}
            </div>

            {/* Jeu de CODIR */}
            <div className="space-y-3">
              <h5 className="font-medium">Jeu de CODIR (Comité de Direction)</h5>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={protocol2Data.codirGame.completed}
                  onCheckedChange={(checked) => updateProtocol2('codirGame', {
                    ...protocol2Data.codirGame,
                    completed: checked
                  })}
                />
                <Badge variant={protocol2Data.codirGame.completed ? "default" : "secondary"}>
                  {protocol2Data.codirGame.completed ? "Réalisé" : "Non réalisé"}
                </Badge>
              </div>
              {protocol2Data.codirGame.completed && (
                <div className="space-y-2">
                  <Label>Score obtenu</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={protocol2Data.codirGame.score}
                      onChange={(e) => updateProtocol2('codirGame', {
                        ...protocol2Data.codirGame,
                        score: parseInt(e.target.value) || 0
                      })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={protocol2Data.codirGame.reportAttached}
                      onCheckedChange={(checked) => updateProtocol2('codirGame', {
                        ...protocol2Data.codirGame,
                        reportAttached: checked
                      })}
                    />
                    <Label className="text-sm">Rapport annexé</Label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2.2: Validation Opérationnelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            2.2 Validation Opérationnelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={protocol2Data.physicalVisit}
                onCheckedChange={(checked) => updateProtocol2('physicalVisit', checked)}
              />
              <Label>Visite physique effectuée</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={protocol2Data.jobDescriptionValidated}
                onCheckedChange={(checked) => updateProtocol2('jobDescriptionValidated', checked)}
              />
              <Label>Fiche de fonction éditée et validée avec le candidat</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2.3: Analyse des Compétences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            2.3 Analyse des Compétences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Analyse du "Gap" de compétences</Label>
              <Select 
                value={protocol2Data.skillsGap}
                onValueChange={(value: 'low' | 'medium' | 'high') => updateProtocol2('skillsGap', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible - Formation mineure requise</SelectItem>
                  <SelectItem value="medium">Moyen - Formation significative nécessaire</SelectItem>
                  <SelectItem value="high">Élevé - Formation approfondie requise</SelectItem>
                </SelectContent>
              </Select>
              <div className={cn(
                "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                getSkillsGapColor(protocol2Data.skillsGap)
              )}>
                Niveau de formation requis : {
                  protocol2Data.skillsGap === 'low' ? 'Faible' :
                  protocol2Data.skillsGap === 'medium' ? 'Moyen' : 'Élevé'
                }
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Justification et Plan de Formation</Label>
              <Textarea
                placeholder="Détaillez les compétences à développer et le plan de formation recommandé..."
                value={protocol2Data.skillsGapJustification}
                onChange={(e) => updateProtocol2('skillsGapJustification', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons de Décision Finale */}
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
              Refuser la Candidature
            </Button>
            <Button 
              onClick={() => handleDecision('embauche')}
              disabled={protocol2Data.status !== 'completed'}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Valider l'Embauche
            </Button>
          </div>
          {protocol2Data.status !== 'completed' && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Complétez tous les tests du Protocole 2 pour valider l'embauche
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
