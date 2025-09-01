import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestData {
  metier: { score: number; comments: string };
  talent: { score: number; comments: string };
  paradigme: { score: number; comments: string };
}

export function Protocol1AnnotationsTest() {
  const [testData, setTestData] = React.useState<TestData>({
    metier: { score: 0, comments: "" },
    talent: { score: 0, comments: "" },
    paradigme: { score: 0, comments: "" }
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  const updateField = (field: keyof TestData, subField: 'score' | 'comments', value: number | string) => {
    setTestData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value
      }
    }));
  };

  const simulateSave = async () => {
    setIsSaving(true);
    // Simuler une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastSaved(new Date());
    setIsSaving(false);
  };

  const StarRating: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
  }> = ({ value, onChange, label }) => {
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

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test des Annotations Protocole 1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {isSaving ? "Sauvegarde en cours..." : "Prêt"}
            </Badge>
            {lastSaved && (
              <span className="text-sm text-muted-foreground">
                Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <Button onClick={simulateSave} disabled={isSaving}>
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
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
          <CardTitle>Données de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}


