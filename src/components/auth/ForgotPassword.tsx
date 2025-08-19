import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { resetPassword } = useAuth();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Veuillez saisir votre adresse email");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      
      if (error) {
        if (error.status === 429) {
          toast.error("Trop de tentatives. Veuillez réessayer dans 60 secondes.");
          setCooldown(60);
        } else {
          toast.error(error.message || "Une erreur est survenue lors de l'envoi.");
        }
      } else {
        setIsEmailSent(true);
        toast.success("Email de réinitialisation envoyé!");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite";
      toast.error("Une erreur s'est produite: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email envoyé !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Nous avons envoyé un lien de réinitialisation à{" "}
                <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Vérifiez votre boîte de réception et cliquez sur le lien pour 
                créer un nouveau mot de passe. Le lien expire dans 1 heure.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail("");
                }}
              >
                Renvoyer l'email
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Mot de passe oublié ?
          </CardTitle>
          <p className="text-gray-600">
            Saisissez votre adresse email et nous vous enverrons un lien 
            pour réinitialiser votre mot de passe.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || cooldown > 0}
                className="h-12"
              />
            </div>
            
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={isLoading || cooldown > 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : cooldown > 0 ? (
                  `Réessayez dans ${cooldown}s`
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer le lien de réinitialisation
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                className="w-full"
                onClick={onBack}
                disabled={isLoading || cooldown > 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
