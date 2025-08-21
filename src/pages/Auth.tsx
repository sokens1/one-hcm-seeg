import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, User, Building2 } from "lucide-react";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { supabase } from "@/integrations/supabase/client";
// Link already imported above

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("signin");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const searchParams = new URLSearchParams(location.search);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirectParam = (location.state as any)?.redirect || searchParams.get('redirect');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await signIn(signInData.email, signInData.password);

      if (error || !data.user) {
        if (error && error.status === 429) {
          toast.error("Trop de tentatives. Veuillez réessayer dans quelques instants.");
        } else if (error && error.status === 400) {
          toast.error("Email ou mot de passe incorrect.");
        } else {
          toast.error(error?.message || "Une erreur est survenue lors de la connexion.");
        }
        return;
      }

      toast.success("Connexion réussie !");
      // If a redirect param is present, go there first
      if (redirectParam) {
        navigate(redirectParam);
      } else {
        // Prefer role from DB for accurate redirection
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          const dbRole = (profile as { role?: string } | null)?.role;
          const role = dbRole || data.user.user_metadata?.role || 'candidat';
          const isRecruiter = role === 'recruiter' || role === 'recruteur';
          navigate(isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard?view=jobs');
        } catch {
          const role = data.user.user_metadata?.role || 'candidat';
          const isRecruiter = role === 'recruiter' || role === 'recruteur';
          navigate(isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard?view=jobs');
        }
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      setIsSubmitting(false);
      return;
    }

    if (signUpData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, {
        role: "candidat",
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone
      });
      
      if (error) {
        if (error.status === 429 || error.message.includes('rate limit')) {
          toast.error("Limite d'envoi d'emails atteinte. En mode développement, vous pouvez vous connecter directement.");
          setCooldown(120); // 2 minutes de cooldown
          // En développement, on peut suggérer de se connecter directement
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => {
              toast.info("💡 Astuce: En développement, essayez de vous connecter directement avec vos identifiants.");
            }, 2000);
          }
        } else if (error.message.includes("already registered")) {
          toast.error("Cette adresse email est déjà utilisée. Essayez de vous connecter.");
          setActiveTab("signin");
        } else if (error.message.includes('email')) {
          toast.error("Problème avec l'adresse email. Vérifiez le format.");
        } else {
          toast.error("Erreur d'inscription: " + error.message);
        }
      } else {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isDevelopment) {
          toast.success("Inscription réussie! Vous pouvez maintenant vous connecter.");
        } else {
          toast.success("Inscription réussie! Vérifiez votre email pour confirmer votre compte.");
        }
        setActiveTab("signin");
        // Pré-remplir l'email dans le formulaire de connexion
        setSignInData(prev => ({ ...prev, email: signUpData.email }));
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <div className="text-center space-y-4">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Building2 className="w-4 h-4 inline mr-2" />
              Plateforme SEEG
            </div>
            <h1 className="text-4xl font-bold">Accès à votre compte</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Connectez-vous ou créez votre compte pour accéder à la plateforme de recrutement SEEG
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Authentification</CardTitle>
            </CardHeader>
            <CardContent>
                            {showForgotPassword ? (
                <ForgotPassword onBack={() => setShowForgotPassword(false)} />
              ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Inscription</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="votre.email@exemple.com"
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Votre mot de passe"
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                                        <div className="text-right text-sm">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto font-normal"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          placeholder="Prénom"
                          value={signUpData.firstName}
                          onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          placeholder="Nom"
                          value={signUpData.lastName}
                          onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="votre.email@exemple.com"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+241 01 23 45 67"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      />
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Mot de passe (min. 6 caractères)"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirmez votre mot de passe"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting || cooldown > 0}>
                      {isSubmitting
                        ? "Inscription..."
                        : cooldown > 0
                        ? `Réessayez dans ${cooldown}s`
                        : "S'inscrire"}
                    </Button>
                  </form>
                </TabsContent>
                            </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}