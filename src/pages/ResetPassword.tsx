import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Gérer les deux patterns possibles de Supabase
    // 1) Nouveau pattern: ?code=... à échanger via exchangeCodeForSession
    // 2) Ancien pattern: ?access_token=...&refresh_token=... à passer à setSession
    // Lecture des paramètres depuis la query ET le hash
    const hash = window.location.hash?.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash || '');

    const code = searchParams.get('code') || hashParams.get('code');
    const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');

    const initSession = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            toast.error("Lien de réinitialisation invalide ou expiré (code)");
            navigate('/auth');
          }
          return;
        }
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            toast.error("Échec d'initialisation de session. Veuillez redemander un lien.");
            navigate('/auth');
          }
          return;
        }
        // Aucun paramètre pertinent trouvé
        toast.error("Lien de réinitialisation invalide ou expiré");
        navigate('/auth');
      } catch (e) {
        toast.error("Erreur inattendue lors de l'initialisation de la session");
        navigate('/auth');
      }
    };

    void initSession();
  }, [searchParams, navigate]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "Le mot de passe doit contenir au moins une lettre minuscule";
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "Le mot de passe doit contenir au moins une lettre majuscule";
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error("Erreur lors de la mise à jour: " + error.message);
      } else {
        setIsSuccess(true);
        toast.success("Mot de passe mis à jour avec succès!");
        
        // Rediriger vers la page d'authentification après 3 secondes
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite";
      toast.error("Une erreur s'est produite: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
          <CardHeader className="text-center space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Mot de passe mis à jour !
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-gray-600">
              Votre mot de passe a été mis à jour avec succès.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Vous allez être redirigé vers la page de connexion...
            </p>
            <Button 
              variant="outline" 
              className="w-full text-sm sm:text-base"
              onClick={() => navigate('/login')}
            >
              Aller à l'authentification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
        <CardHeader className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            Nouveau mot de passe
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </p>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Saisissez votre nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 sm:h-12 pr-10 sm:pr-12 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-10 sm:h-12 px-2 sm:px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  )}
                </Button>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                <p>Le mot de passe doit contenir :</p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                  <li>Au moins 8 caractères</li>
                  <li>Une lettre minuscule et majuscule</li>
                  <li>Au moins un chiffre</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 sm:h-12 pr-10 sm:pr-12 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-10 sm:h-12 px-2 sm:px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-10 sm:h-12 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Mise à jour...</span>
                  <span className="sm:hidden">Mise à jour...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="hidden sm:inline">Mettre à jour le mot de passe</span>
                  <span className="sm:hidden">Mettre à jour</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
