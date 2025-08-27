/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Star, Users, CheckCircle, Clock, AlertCircle, FileText, User, Calendar as CalendarLucide } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface EvaluationData {
  globalScore: number;
  status: string;
  protocol1: {
    score: number;
    status: 'pending' | 'in_progress' | 'completed';
    documentsValidated: boolean;
    positionAdequacy: number;
    adequacyComment: string;
    interviewDate?: Date;
    interviewer: string;
    cultureAlignment: number;
    cultureComment: string;
    pastAchievements: number;
    achievementsComment: string;
    communication: number;
    communicationComment: string;
    generalSummary: string;
  };
  protocol2: {
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
  };
}

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

interface EvaluationDashboardProps {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  onStatusChange: (status: 'incubation' | 'embauche' | 'refuse') => void;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  candidateName,
  jobTitle,
  applicationId,
  onStatusChange
}) => {
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    globalScore: 0,
    status: "Évaluation - Protocole 1 en cours",
    protocol1: {
      score: 0,
      status: 'pending',
      documentsValidated: false,
      positionAdequacy: 0,
      adequacyComment: "",
      interviewer: "",
      cultureAlignment: 0,
      cultureComment: "",
      pastAchievements: 0,
      achievementsComment: "",
      communication: 0,
      communicationComment: "",
      generalSummary: ""
    },
    protocol2: {
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
    }
  });

  const [interviewDate, setInterviewDate] = useState<Date>();

  const updateProtocol1 = (field: string, value: any) => {
    setEvaluationData(prev => {
      const newProtocol1 = {
        ...prev.protocol1,
        [field]: value
      };
      
      // Auto-validation des documents si adéquation >= 3 étoiles
      if (field === 'positionAdequacy' && value >= 3) {
        newProtocol1.documentsValidated = true;
      }
      
      // Calculer le score dynamiquement (inclut métier, talent, paradigme)
      const scores = [
        newProtocol1.positionAdequacy * 20, // Métier - 0-100
        newProtocol1.cultureAlignment * 20,  // Paradigme - 0-100
        newProtocol1.pastAchievements * 20,  // Talent - 0-100
        newProtocol1.communication * 20      // Communication - 0-100
      ].filter(score => score > 0);
      
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      newProtocol1.score = Math.round(avgScore);
      
      // Mettre à jour le statut
      if (newProtocol1.documentsValidated && scores.length > 0) {
        newProtocol1.status = 'in_progress';
      }
      if (newProtocol1.score >= 60) {
        newProtocol1.status = 'completed';
      }
      
      // Calculer le score global
      const globalScore = newProtocol1.score;
      
      return {
        ...prev,
        protocol1: newProtocol1,
        globalScore
      };
    });
  };

  const updateProtocol2 = (field: string, value: any) => {
    setEvaluationData(prev => {
      const newProtocol2 = {
        ...prev.protocol2,
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
      
      // Calculer le score global (moyenne des deux protocoles)
      const globalScore = prev.protocol1.score > 0 && newProtocol2.score > 0 
        ? Math.round((prev.protocol1.score + newProtocol2.score) / 2)
        : prev.protocol1.score;
      
      return {
        ...prev,
        protocol2: newProtocol2,
        globalScore
      };
    });
  };

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

  return (
    <div className="space-y-6">
      {/* Header - Synthèse de l'Évaluation */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                📊 Synthèse de l'Évaluation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Candidat: {candidateName} • Poste: {jobTitle}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{evaluationData.globalScore}%</div>
              <div className="text-xs text-muted-foreground">Score Global</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Score Global Provisoire</span>
              <span className="text-sm text-muted-foreground">{evaluationData.globalScore}%</span>
            </div>
            <Progress value={evaluationData.globalScore} className="h-3" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Statut Actuel:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {evaluationData.status}
            </Badge>
          </div>

        </CardContent>
      </Card>

      {/* Protocole 1 - Présélection & Entretien Initial */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.protocol1.status)}
              ✅ Protocole 1 : Présélection & Entretien Initial
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(evaluationData.protocol1.status)}
              <div className="text-right">
                <div className="font-bold text-lg">{evaluationData.protocol1.score}/100</div>
                <div className="text-xs text-muted-foreground">Score Protocole 1</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sous-section 1.1 : Validation des Prérequis */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              1.1 Validation des Prérequis
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Vérification des documents (CV, diplômes)</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={evaluationData.protocol1.documentsValidated}
                      onCheckedChange={(checked) => updateProtocol1('documentsValidated', checked)}
                    />
                    <Badge variant={evaluationData.protocol1.documentsValidated ? "default" : "destructive"}>
                      {evaluationData.protocol1.documentsValidated ? "Validé" : "Non conforme"}
                    </Badge>
                  </div>
                </div>
                
                {evaluationData.protocol1.documentsValidated && (
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        const today = new Date();
                        setInterviewDate(today);
                        updateProtocol1('interviewer', 'Entretien programmé');
                      }}
                    >
                      <CalendarLucide className="w-4 h-4" />
                      Programmer l'entretien
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <StarRating
                  value={evaluationData.protocol1.positionAdequacy}
                  onChange={(value) => updateProtocol1('positionAdequacy', value)}
                  label="Adéquation avec les prérequis du poste (Métier)"
                />
                <Textarea
                  placeholder="Commentaire rapide..."
                  value={evaluationData.protocol1.adequacyComment}
                  onChange={(e) => updateProtocol1('adequacyComment', e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Sous-section 1.2 : Évaluation de l'Entretien */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              1.2 Évaluation de l'Entretien
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entretien réalisé le</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !interviewDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {interviewDate ? format(interviewDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={interviewDate}
                        onSelect={setInterviewDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Interviewer</Label>
                  <Input
                    placeholder="Nom de l'interviewer"
                    value={evaluationData.protocol1.interviewer}
                    onChange={(e) => updateProtocol1('interviewer', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <StarRating
                    value={evaluationData.protocol1.cultureAlignment}
                    onChange={(value) => updateProtocol1('cultureAlignment', value)}
                    label="Alignement avec la culture d'entreprise (Paradigme)"
                  />
                  <Textarea
                    placeholder="Commentaire..."
                    value={evaluationData.protocol1.cultureComment}
                    onChange={(e) => updateProtocol1('cultureComment', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-4">
                  <StarRating
                    value={evaluationData.protocol1.pastAchievements}
                    onChange={(value) => updateProtocol1('pastAchievements', value)}
                    label="Qualité des réalisations passées (Talent)"
                  />
                  <Textarea
                    placeholder="Commentaire..."
                    value={evaluationData.protocol1.achievementsComment}
                    onChange={(e) => updateProtocol1('achievementsComment', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <StarRating
                  value={evaluationData.protocol1.communication}
                  onChange={(value) => updateProtocol1('communication', value)}
                  label="Communication et Leadership"
                />
                <Textarea
                  placeholder="Commentaire..."
                  value={evaluationData.protocol1.communicationComment}
                  onChange={(e) => updateProtocol1('communicationComment', e.target.value)}
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Compte-rendu général de l'entretien</Label>
                <Textarea
                  placeholder="Résumé détaillé de l'entretien..."
                  value={evaluationData.protocol1.generalSummary}
                  onChange={(e) => updateProtocol1('generalSummary', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>
          
          {/* Actions Protocole 1 */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => onStatusChange('refuse')}
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            >
              Refuser
            </Button>
            <Button 
              onClick={() => onStatusChange('incubation')}
              disabled={evaluationData.protocol1.score < 60}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Incuber
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Protocole 2 - Évaluation Approfondie & Tests */}
      <Card className={cn(
        "transition-all duration-200",
        evaluationData.protocol1.score < 60 && "opacity-50 pointer-events-none"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.protocol2.status)}
              🚀 Protocole 2 : Évaluation Approfondie & Tests
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(evaluationData.protocol2.status)}
              <div className="text-right">
                <div className="font-bold text-lg">{evaluationData.protocol2.score}/100</div>
                <div className="text-xs text-muted-foreground">Score Protocole 2</div>
              </div>
            </div>
          </div>
          {evaluationData.protocol1.score < 60 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ Ce protocole sera accessible une fois le Protocole 1 validé (score ≥ 60)
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Module 2.1 : Mise en Situation & Tests Techniques */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              2.1 Mise en Situation & Tests Techniques
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-medium">Jeu de Rôle</h5>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={evaluationData.protocol2.rolePlay.completed}
                      onCheckedChange={(checked) => updateProtocol2('rolePlay', {
                        ...evaluationData.protocol2.rolePlay,
                        completed: checked
                      })}
                    />
                    <Badge variant={evaluationData.protocol2.rolePlay.completed ? "default" : "secondary"}>
                      {evaluationData.protocol2.rolePlay.completed ? "Réalisé" : "Non réalisé"}
                    </Badge>
                  </div>
                  {evaluationData.protocol2.rolePlay.completed && (
                    <div className="space-y-2">
                      <Label>Score obtenu</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={evaluationData.protocol2.rolePlay.score}
                          onChange={(e) => updateProtocol2('rolePlay', {
                            ...evaluationData.protocol2.rolePlay,
                            score: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Joindre le rapport d'évaluation
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">Jeu de CODIR (Comité de Direction)</h5>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={evaluationData.protocol2.codirGame.completed}
                      onCheckedChange={(checked) => updateProtocol2('codirGame', {
                        ...evaluationData.protocol2.codirGame,
                        completed: checked
                      })}
                    />
                    <Badge variant={evaluationData.protocol2.codirGame.completed ? "default" : "secondary"}>
                      {evaluationData.protocol2.codirGame.completed ? "Réalisé" : "Non réalisé"}
                    </Badge>
                  </div>
                  {evaluationData.protocol2.codirGame.completed && (
                    <div className="space-y-2">
                      <Label>Score obtenu</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={evaluationData.protocol2.codirGame.score}
                          onChange={(e) => updateProtocol2('codirGame', {
                            ...evaluationData.protocol2.codirGame,
                            score: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Joindre le rapport d'évaluation
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Module 2.2 : Validation Opérationnelle */}
          <div className="border rounded-lg p-4 bg-purple-50">
            <h4 className="font-semibold mb-4">2.2 Validation Opérationnelle</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={evaluationData.protocol2.physicalVisit}
                  onCheckedChange={(checked) => updateProtocol2('physicalVisit', checked)}
                />
                <Label>Visite physique effectuée</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={evaluationData.protocol2.jobDescriptionValidated}
                  onCheckedChange={(checked) => updateProtocol2('jobDescriptionValidated', checked)}
                />
                <Label>Fiche de fonction éditée et validée avec le candidat</Label>
              </div>
            </div>
          </div>

          {/* Module 2.3 : Synthèse des Compétences */}
          <div className="border rounded-lg p-4 bg-orange-50">
            <h4 className="font-semibold mb-4">2.3 Synthèse des Compétences</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Analyse du "Gap" de compétences</Label>
                <Select 
                  value={evaluationData.protocol2.skillsGap}
                  onValueChange={(value: 'low' | 'medium' | 'high') => updateProtocol2('skillsGap', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Justification</Label>
                <Textarea
                  placeholder="Le candidat devra être formé sur notre logiciel de paie interne. Excellente maîtrise des autres aspects."
                  value={evaluationData.protocol2.skillsGapJustification}
                  onChange={(e) => updateProtocol2('skillsGapJustification', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Protocole 2 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline">Sauvegarder le brouillon</Button>
        <Button 
          variant="outline" 
          onClick={() => onStatusChange('refuse')}
          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        >
          Refuser
        </Button>
        <Button 
          onClick={() => onStatusChange('embauche')}
          disabled={evaluationData.protocol2.score < 70}
          className="bg-green-600 hover:bg-green-700"
        >
          Engager
        </Button>
      </div>
    </div>
  );
};
