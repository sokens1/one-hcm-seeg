import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ForgotPasswordProps {
  onBack: () => void;
  embedded?: boolean; // when true, render form content only (for usage inside Auth card)
}

export function ForgotPassword({ onBack, embedded = true }: ForgotPasswordProps) {
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
      const emailToCheck = email.trim().toLowerCase();
      // 1) Vérifier l'existence en appelant la fonction RPC sécurisée
      const { data: existsRaw, error: lookupError } = await supabase
        .rpc('email_exists', { p_email: emailToCheck });

      if (lookupError) {
        console.warn('Email lookup failed:', lookupError.message);
        toast.error("Impossible de vérifier l'email pour le moment. Réessayez plus tard.");
        return;
      }

      const exists = !!existsRaw;
      if (!exists) {
        toast.error("Aucun compte associé à cette adresse email.");
        return;
      }

      // 2) Envoyer l'email de réinitialisation
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
    if (embedded) {
      return (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Email envoyé</h2>
            <p className="text-gray-600 text-sm">
              Un lien a été envoyé à <strong>{email}</strong>
            </p>
          </div>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full h-10"
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
              }}
            >
              Renvoyer l'email
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-10"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-3">
        <Card className="w-full max-w-sm shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Email envoyé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-0">
            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm">
                Nous avons envoyé un lien à <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Ouvrez le lien pour créer un nouveau mot de passe.
              </p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full h-10" onClick={() => { setIsEmailSent(false); setEmail(""); }}>
                Renvoyer l'email
              </Button>
              <Button variant="ghost" className="w-full h-10" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Mot de passe oublié</h2>
          <p className="text-gray-600 text-sm">Saisissez votre adresse email pour recevoir un lien.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || cooldown > 0}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Button type="submit" className="w-full h-10" disabled={isLoading || cooldown > 0}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : cooldown > 0 ? (
                `Réessayez dans ${cooldown}s`
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer le lien
                </>
              )}
            </Button>
            <Button type="button" variant="ghost" className="w-full h-10" onClick={onBack} disabled={isLoading || cooldown > 0}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </div>
        </form>
      </div>
    );
  }
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-3">
      <Card className="w-full max-w-sm shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3 py-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Mot de passe oublié</CardTitle>
          <p className="text-gray-600 text-sm">Saisissez votre adresse email pour recevoir un lien.</p>
        </CardHeader>
        <CardContent className="py-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Adresse email</Label>
              <Input id="email" type="email" placeholder="votre.email@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || cooldown > 0} className="h-10" />
            </div>
            <div className="space-y-2">
              <Button type="submit" className="w-full h-10" disabled={isLoading || cooldown > 0}>
                {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi...</>) : cooldown > 0 ? (`Réessayez dans ${cooldown}s`) : (<><Mail className="w-4 h-4 mr-2" />Envoyer le lien</>)}
              </Button>
              <Button type="button" variant="ghost" className="w-full h-10" onClick={onBack} disabled={isLoading || cooldown > 0}>
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
