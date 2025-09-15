import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptimizedProtocol1Evaluation } from "@/hooks/useOptimizedProtocol1Evaluation";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label, disabled = false }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              // console.log('⭐ [FULL DEBUG TEST] Clic sur étoile:', star, 'disabled:', disabled);
              !disabled && onChange(star);
            }}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={cn(
                "w-5 h-5",
                star <= value
                  ? disabled ? "fill-yellow-200 text-yellow-200" : "fill-yellow-400 text-yellow-400"
                  : disabled ? "text-gray-200" : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{value}/5</span>
    </div>
  );
};

export function FullDebugTest() {
  const [applicationId, setApplicationId] = useState("");
  const [currentAppId, setCurrentAppId] = useState("");
  
  const { 
    evaluationData, 
    updateEvaluation, 
    calculateSectionScores, 
    isLoading, 
    isSaving 
  } = useOptimizedProtocol1Evaluation(currentAppId);

  // Fonction exacte du composant d'évaluation original
  const updateProtocol1 = (section: string, field: string, value: any) => {
    // console.log('🔄 [FULL DEBUG TEST] updateProtocol1 appelé:', { section, field, value });
    updateEvaluation(prev => {
      // console.log('🔄 [FULL DEBUG TEST] Données précédentes:', prev);
      const newData = { ...prev };
      const newProtocol1 = { ...newData.protocol1 };
      
      // Mise à jour des données selon la section
      if (section === 'documentaryEvaluation') {
        const [docType, property] = field.split('.');
        newProtocol1.documentaryEvaluation = {
          ...newProtocol1.documentaryEvaluation,
          [docType]: {
            ...newProtocol1.documentaryEvaluation[docType as keyof typeof newProtocol1.documentaryEvaluation],
            [property]: value
          }
        };
      } else if (section === 'mtpAdherence') {
        const [mtpField, property] = field.split('.');
        newProtocol1.mtpAdherence = {
          ...newProtocol1.mtpAdherence,
          [mtpField]: {
            ...newProtocol1.mtpAdherence[mtpField as keyof typeof newProtocol1.mtpAdherence],
            [property]: value
          }
        };
      } else if (section === 'interview') {
        if (field.startsWith('physicalMtpAdherence.')) {
          const [_, mtpField, property] = field.split('.');
          newProtocol1.interview.physicalMtpAdherence = {
            ...newProtocol1.interview.physicalMtpAdherence,
            [mtpField]: {
              ...newProtocol1.interview.physicalMtpAdherence[mtpField as keyof typeof newProtocol1.interview.physicalMtpAdherence],
              [property]: value
            }
          };
        } else if (field.startsWith('gapCompetence.')) {
          const [_, property] = field.split('.');
          newProtocol1.interview.gapCompetence = {
            ...newProtocol1.interview.gapCompetence,
            [property]: value
          };
        } else {
          newProtocol1.interview = {
            ...newProtocol1.interview,
            [field]: value
          };
        }
      }
      
      newData.protocol1 = newProtocol1;
      // console.log('🔄 [FULL DEBUG TEST] Nouvelles données:', newData);
      return newData;
    });
  };

  const handleLoadData = () => {
    if (applicationId.trim()) {
      // console.log('🔄 [FULL DEBUG TEST] Chargement des données pour:', applicationId);
      setCurrentAppId(applicationId.trim());
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Debug Complet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="ID de l'application à tester"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleLoadData} disabled={!applicationId.trim()}>
              Charger
            </Button>
          </div>
          
          {currentAppId && (
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {isSaving ? "Sauvegarde en cours..." : "Prêt"}
              </Badge>
              <Badge variant="outline">
                Score global: {evaluationData.globalScore}
              </Badge>
              <Badge variant="outline">
                App ID: {currentAppId}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {currentAppId && (
        <>
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p>Chargement des données...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Évaluation MTP - Taux d'adhérence MTP */}
              <div className="border rounded-lg p-4 bg-blue-50 relative">
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-white font-semibold">
                    {calculateSectionScores().mtpScore.toFixed(1)}%
                  </Badge>
                </div>
                <h4 className="font-semibold mb-4 flex items-center gap-2 pr-16">
                  Évaluation MTP
                </h4>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <StarRating
                        value={evaluationData.protocol1.mtpAdherence.metier.score}
                        onChange={(value) => updateProtocol1('mtpAdherence', 'metier.score', value)}
                        label="Métier"
                      />
                      <Textarea
                        placeholder="Commentaires métier..."
                        value={evaluationData.protocol1.mtpAdherence.metier.comments}
                        onChange={(e) => {
                          // console.log('📝 [FULL DEBUG TEST] Changement commentaire métier:', e.target.value);
                          updateProtocol1('mtpAdherence', 'metier.comments', e.target.value);
                        }}
                        className="min-h-[60px]"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <StarRating
                        value={evaluationData.protocol1.mtpAdherence.talent.score}
                        onChange={(value) => updateProtocol1('mtpAdherence', 'talent.score', value)}
                        label="Talent"
                      />
                      <Textarea
                        placeholder="Commentaires talent..."
                        value={evaluationData.protocol1.mtpAdherence.talent.comments}
                        onChange={(e) => {
                          // console.log('📝 [FULL DEBUG TEST] Changement commentaire talent:', e.target.value);
                          updateProtocol1('mtpAdherence', 'talent.comments', e.target.value);
                        }}
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="space-y-3">
                      <StarRating
                        value={evaluationData.protocol1.mtpAdherence.paradigme.score}
                        onChange={(value) => updateProtocol1('mtpAdherence', 'paradigme.score', value)}
                        label="Paradigme"
                      />
                      <Textarea
                        placeholder="Commentaires paradigme..."
                        value={evaluationData.protocol1.mtpAdherence.paradigme.comments}
                        onChange={(e) => {
                          // console.log('📝 [FULL DEBUG TEST] Changement commentaire paradigme:', e.target.value);
                          updateProtocol1('mtpAdherence', 'paradigme.comments', e.target.value);
                        }}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Données du Hook</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                    {JSON.stringify(evaluationData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}


