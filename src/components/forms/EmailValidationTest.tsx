// Composant de test pour la validation email
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidEmail, getCandidateEmail, getEmailErrorMessage } from "@/utils/emailValidation";

export function EmailValidationTest() {
  const [testEmail, setTestEmail] = useState("");
  const [validationResult, setValidationResult] = useState<string>("");

  const testEmailValidation = () => {
    if (!testEmail.trim()) {
      setValidationResult("Veuillez saisir un email à tester");
      return;
    }

    const isValid = isValidEmail(testEmail);
    const errorMessage = getEmailErrorMessage(testEmail);
    
    setValidationResult(`
      Email testé: ${testEmail}
      Valide: ${isValid ? "✅ Oui" : "❌ Non"}
      Message d'erreur: ${errorMessage || "Aucune erreur"}
    `);
  };

  const testCandidateEmail = () => {
    const formEmail = testEmail;
    const userEmail = "user@example.com";
    const dbEmail = "db@example.com";
    
    const result = getCandidateEmail(formEmail, userEmail, dbEmail);
    
    setValidationResult(`
      Test getCandidateEmail:
      Email formulaire: ${formEmail || "Non défini"}
      Email utilisateur: ${userEmail}
      Email base de données: ${dbEmail}
      Résultat: ${result || "Aucun email valide trouvé"}
    `);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test de Validation Email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="testEmail">Email à tester</Label>
          <Input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@exemple.com"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={testEmailValidation} variant="outline">
            Tester Validation
          </Button>
          <Button onClick={testCandidateEmail} variant="outline">
            Tester Priorité
          </Button>
        </div>
        
        {validationResult && (
          <div className="p-3 bg-muted rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{validationResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
