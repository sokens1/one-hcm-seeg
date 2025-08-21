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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
          <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Email envoyé !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-gray-600">
                Nous avons envoyé un lien de réinitialisation à{" "}
                <strong>{email}</strong>
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Vérifiez votre boîte de réception et cliquez sur le lien pour 
                créer un nouveau mot de passe. Le lien expire dans 1 heure.
              </p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Button 
                variant="outline" 
                className="w-full text-sm sm:text-base h-10 sm:h-11"
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail("");
                }}
              >
                Renvoyer l'email
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-sm sm:text-base h-10 sm:h-11"
                onClick={onBack}
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Retour à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            Mot de passe oublié ?
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Saisissez votre adresse email et nous vous enverrons un lien 
            pour réinitialiser votre mot de passe.
          </p>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || cooldown > 0}
                className="h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Button 
                type="submit" 
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
                disabled={isLoading || cooldown > 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Envoi en cours...</span>
                    <span className="sm:hidden">Envoi...</span>
                  </>
                ) : cooldown > 0 ? (
                  `Réessayez dans ${cooldown}s`
                ) : (
                  <>
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Envoyer le lien de réinitialisation</span>
                    <span className="sm:hidden">Envoyer le lien</span>
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                className="w-full h-10 sm:h-11 text-sm sm:text-base"
                onClick={onBack}
                disabled={isLoading || cooldown > 0}
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Retour à la connexion
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
