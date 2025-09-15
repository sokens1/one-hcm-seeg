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
              // console.log('⭐ [REAL TEST] Clic sur étoile:', star, 'disabled:', disabled);
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

export function RealDataTest() {
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
    // console.log('🔄 [REAL TEST] updateProtocol1 appelé:', { section, field, value });
    updateEvaluation(prev => {
      // console.log('🔄 [REAL TEST] Données précédentes:', prev);
      const newData = { ...prev };
      const newProtocol1 = { ...newData.protocol1 };
      
      // Mise à jour des données selon la section
      if (section === 'mtpAdherence') {
        const [mtpField, property] = field.split('.');
        newProtocol1.mtpAdherence = {
          ...newProtocol1.mtpAdherence,
          [mtpField]: {
            ...newProtocol1.mtpAdherence[mtpField as keyof typeof newProtocol1.mtpAdherence],
            [property]: value
          }
        };
      }
      
      newData.protocol1 = newProtocol1;
      // console.log('🔄 [REAL TEST] Nouvelles données:', newData);
      return newData;
    });
  };

  const handleLoadData = () => {
    if (applicationId.trim()) {
      // console.log('🔄 [REAL TEST] Chargement des données pour:', applicationId);
      setCurrentAppId(applicationId.trim());
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test avec Données Réelles</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Métier */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Métier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.metier.score}
                    onChange={(value) => updateProtocol1('mtpAdherence', 'metier.score', value)}
                    label="Score Métier"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commentaires</label>
                    <Textarea
                      placeholder="Commentaires sur le métier..."
                      value={evaluationData.protocol1.mtpAdherence.metier.comments}
                      onChange={(e) => {
                        // console.log('📝 [REAL TEST] Changement commentaire métier:', e.target.value);
                        updateProtocol1('mtpAdherence', 'metier.comments', e.target.value);
                      }}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Talent */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Talent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.talent.score}
                    onChange={(value) => updateProtocol1('mtpAdherence', 'talent.score', value)}
                    label="Score Talent"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commentaires</label>
                    <Textarea
                      placeholder="Commentaires sur le talent..."
                      value={evaluationData.protocol1.mtpAdherence.talent.comments}
                      onChange={(e) => {
                        // console.log('📝 [REAL TEST] Changement commentaire talent:', e.target.value);
                        updateProtocol1('mtpAdherence', 'talent.comments', e.target.value);
                      }}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Paradigme */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Paradigme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.paradigme.score}
                    onChange={(value) => updateProtocol1('mtpAdherence', 'paradigme.score', value)}
                    label="Score Paradigme"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commentaires</label>
                    <Textarea
                      placeholder="Commentaires sur le paradigme..."
                      value={evaluationData.protocol1.mtpAdherence.paradigme.comments}
                      onChange={(e) => {
                        // console.log('📝 [REAL TEST] Changement commentaire paradigme:', e.target.value);
                        updateProtocol1('mtpAdherence', 'paradigme.comments', e.target.value);
                      }}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
        </>
      )}
    </div>
  );
}


