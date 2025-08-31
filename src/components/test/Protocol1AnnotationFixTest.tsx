import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptimizedProtocol1Evaluation } from "@/hooks/useOptimizedProtocol1Evaluation";

interface TestData {
  metier: { score: number; comments: string };
  talent: { score: number; comments: string };
  paradigme: { score: number; comments: string };
}

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label, disabled = false }) => {
  const handleStarClick = (starValue: number) => {
    if (disabled) return;
    
    console.log('⭐ [TEST DEBUG] Clic sur étoile:', starValue, 'pour', label);
    onChange(starValue);
  };

  return (
    <div className="space-y-2">
      <h5 className="font-medium text-sm">{label}</h5>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleStarClick(star);
            }}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "transition-colors hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm p-1",
              disabled && "cursor-not-allowed"
            )}
            disabled={disabled}
            aria-label={`Noter ${star} étoile${star > 1 ? 's' : ''} pour ${label}`}
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

export function Protocol1AnnotationFixTest() {
  // Utiliser un ID d'application de test
  const testApplicationId = "test-application-id";
  
  const { 
    evaluationData, 
    updateEvaluation, 
    isLoading, 
    isSaving,
    reload
  } = useOptimizedProtocol1Evaluation(testApplicationId);

  const [testData, setTestData] = useState<TestData>({
    metier: { score: 0, comments: "" },
    talent: { score: 0, comments: "" },
    paradigme: { score: 0, comments: "" }
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Synchroniser les données de test avec les données d'évaluation
  useEffect(() => {
    if (evaluationData) {
      setTestData({
        metier: {
          score: evaluationData.protocol1.mtpAdherence.metier.score,
          comments: evaluationData.protocol1.mtpAdherence.metier.comments
        },
        talent: {
          score: evaluationData.protocol1.mtpAdherence.talent.score,
          comments: evaluationData.protocol1.mtpAdherence.talent.comments
        },
        paradigme: {
          score: evaluationData.protocol1.mtpAdherence.paradigme.score,
          comments: evaluationData.protocol1.mtpAdherence.paradigme.comments
        }
      });
    }
  }, [evaluationData]);

  const updateField = (field: keyof TestData, subField: 'score' | 'comments', value: number | string) => {
    console.log('🔄 [TEST DEBUG] Mise à jour:', { field, subField, value });
    
    const newTestData = {
      ...testData,
      [field]: {
        ...testData[field],
        [subField]: value
      }
    };
    
    setTestData(newTestData);
    
    // Mettre à jour l'évaluation via le hook
    updateEvaluation(prev => {
      const newData = { ...prev };
      const newProtocol1 = { ...newData.protocol1 };
      
      if (field === 'metier') {
        newProtocol1.mtpAdherence.metier = {
          ...newProtocol1.mtpAdherence.metier,
          [subField]: value
        };
      } else if (field === 'talent') {
        newProtocol1.mtpAdherence.talent = {
          ...newProtocol1.mtpAdherence.talent,
          [subField]: value
        };
      } else if (field === 'paradigme') {
        newProtocol1.mtpAdherence.paradigme = {
          ...newProtocol1.mtpAdherence.paradigme,
          [subField]: value
        };
      }
      
      newData.protocol1 = newProtocol1;
      return newData;
    });
  };

  const handleReload = async () => {
    try {
      await reload();
      setLastSaved(new Date());
      console.log('✅ [TEST DEBUG] Données rechargées');
    } catch (error) {
      console.error('❌ [TEST DEBUG] Erreur de rechargement:', error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de Correction des Annotations Protocole 1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {isSaving ? "Sauvegarde en cours..." : isLoading ? "Chargement..." : "Prêt"}
            </Badge>
            {lastSaved && (
              <span className="text-sm text-muted-foreground">
                Dernière rechargement: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleReload} disabled={isSaving || isLoading}>
              {isLoading ? "Chargement..." : "Recharger les données"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Métier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StarRating
              value={testData.metier.score}
              onChange={(value) => updateField('metier', 'score', value)}
              label="Score Métier"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaires</label>
              <Textarea
                placeholder="Commentaires sur le métier..."
                value={testData.metier.comments}
                onChange={(e) => updateField('metier', 'comments', e.target.value)}
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
              value={testData.talent.score}
              onChange={(value) => updateField('talent', 'score', value)}
              label="Score Talent"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaires</label>
              <Textarea
                placeholder="Commentaires sur le talent..."
                value={testData.talent.comments}
                onChange={(e) => updateField('talent', 'comments', e.target.value)}
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
              value={testData.paradigme.score}
              onChange={(value) => updateField('paradigme', 'score', value)}
              label="Score Paradigme"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaires</label>
              <Textarea
                placeholder="Commentaires sur le paradigme..."
                value={testData.paradigme.comments}
                onChange={(e) => updateField('paradigme', 'comments', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Données de Test (État Local)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Données d'Évaluation (État Global)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(evaluationData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
