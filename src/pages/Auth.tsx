/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
// import { useAzureAuth } from "@/hooks/useAzureAuth"; // Azure API - Commenté temporairement
import { useAccessRequestNotification } from "@/hooks/useAccessRequestNotification";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, User, Building2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { supabase } from "@/integrations/supabase/client";
import { isPreLaunch } from "@/utils/launchGate";
import { isApplicationClosed } from "@/utils/applicationUtils";
import { isExternalRegistrationDisabled, getDisabledMessage } from "@/utils/midnightGate";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isLoading } = useAuth(); // Supabase Auth
  // const { signIn, signUp, verifyMatricule: azureVerifyMatricule } = useAzureAuth(); // Azure API - Commenté
  const { sendAccessRequestNotification } = useAccessRequestNotification();
  const [activeTab, setActiveTab] = useState("signin");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const preLaunch = isPreLaunch();
  const applicationsClosed = isApplicationClosed();
  const externalRegistrationDisabled = isExternalRegistrationDisabled();

  // Deduplicate pre-launch toasts (shown in multiple places)
  const lastPreLaunchToastTs = useRef<number>(0);
  const preLaunchToast = () => {
    const now = Date.now();
    if (now - lastPreLaunchToastTs.current > 1200) {
      toast.info("Les inscriptions seront disponibles à partir du lundi 25 août 2025.");
      lastPreLaunchToastTs.current = now;
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = (location.state as any)?.redirect || searchParams.get('redirect');
  const tabParam = searchParams.get('tab');
  
  // Configuration pour désactiver le champ matricule (pour les externes)
  const MATRICULE_REQUIRED = false; // Mettre à true pour réactiver le champ matricule

  // Prevent duplicate success toasts on login (e.g., unexpected double submits)
  const lastLoginToastTs = useRef<number>(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Gérer le paramètre tab pour ouvrir directement l'onglet inscription
  useEffect(() => {
    if (tabParam === 'signup') {
      setActiveTab('signup');
    }
  }, [tabParam]);

  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    matricule: "",
    dateOfBirth: "",
    sexe: "",
    adresse: "",
    candidateStatus: "", // "interne" ou "externe" - vide par défaut
    noSeegEmail: false, // Checkbox pour les internes sans email SEEG
    politiqueConfidentialite: false // Checkbox obligatoire pour la politique de confidentialité
  });

  const [matriculeError, setMatriculeError] = useState<string>("");
  const [isMatriculeValid, setIsMatriculeValid] = useState<boolean>(!MATRICULE_REQUIRED);
  const [isVerifyingMatricule, setIsVerifyingMatricule] = useState<boolean>(false);
  const [lastVerifiedMatricule, setLastVerifiedMatricule] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  // Validation de l'email en temps réel pour les candidats internes
  useEffect(() => {
    if (signUpData.candidateStatus === "interne" && !signUpData.noSeegEmail && signUpData.email) {
      const emailPattern = /@seeg-gabon\.com$/i;
      if (!emailPattern.test(signUpData.email)) {
        setEmailError("L'email doit être un email professionnel SEEG (@seeg-gabon.com)");
      } else {
        setEmailError("");
      }
    } else {
      setEmailError("");
    }
  }, [signUpData.email, signUpData.candidateStatus, signUpData.noSeegEmail]);

  useEffect(() => {
    // Réinitialiser la validation quand le matricule change
    if (signUpData.candidateStatus === "interne" && signUpData.matricule) {
      // Ne pas auto-valider, attendre la vérification
      setIsMatriculeValid(false);
      setMatriculeError("");
    } else if (signUpData.candidateStatus === "externe") {
      // Pour les externes, pas de matricule requis
      setIsMatriculeValid(true);
      setMatriculeError("");
    }
  }, [signUpData.matricule, signUpData.candidateStatus]);

  const verifyMatricule = useCallback(async (): Promise<boolean> => {
    // Si le candidat est externe, on valide automatiquement (pas de matricule requis)
    if (signUpData.candidateStatus === "externe") {
      setIsMatriculeValid(true);
      setMatriculeError("");
      return true;
    }

    const matricule = signUpData.matricule.trim();
    if (!matricule) {
      setMatriculeError("Le matricule est requis.");
      setIsMatriculeValid(false);
      return false;
    }

    // Si le matricule a déjà été vérifié avec succès, ne pas revérifier
    if (matricule === lastVerifiedMatricule && isMatriculeValid) {
      console.log('✅ Matricule déjà vérifié, pas de nouvelle requête');
      return true;
    }

    try {
      setIsVerifyingMatricule(true);
      console.log('🔍 Vérification du matricule:', matricule);
      
      // Utiliser la fonction RPC de Supabase pour vérifier dans seeg_agents ET users
      const { data, error } = await supabase.rpc('verify_matricule', {
        p_matricule: matricule,
      });

      console.log('✅ Réponse vérification:', { data, error });

      if (error) {
        console.error('❌ Erreur vérification matricule:', error);
        // Gestion spécifique du rate limiting
        if (error.message.includes('rate limit') || error.code === 'PGRST301') {
          setMatriculeError("Trop de vérifications. Attendez quelques secondes avant de réessayer.");
        } else {
          setMatriculeError(`Erreur lors de la vérification du matricule: ${error.message}`);
        }
        setIsMatriculeValid(false);
        return false;
      }

      // La fonction retourne maintenant un objet JSON avec plus d'informations
      const result = data as { exists_in_agents: boolean; already_used: boolean; is_valid: boolean; message: string };

      if (!result.is_valid) {
        console.log('❌ Matricule invalide:', result.message);
        setMatriculeError(result.message);
        setIsMatriculeValid(false);
        return false;
      }

      console.log('✅ Matricule valide');
      setMatriculeError("");
      setIsMatriculeValid(true);
      setLastVerifiedMatricule(matricule);
      return true;
    } catch (e) {
      console.error('❌ Exception vérification matricule:', e);
      setMatriculeError("Erreur lors de la vérification du matricule.");
      setIsMatriculeValid(false);
      return false;
    }
    finally {
      setIsVerifyingMatricule(false);
    }
  }, [signUpData.matricule, signUpData.candidateStatus, lastVerifiedMatricule, isMatriculeValid]);

  useEffect(() => {
    // Ne vérifier que si c'est un candidat interne et qu'il y a un matricule
    if (signUpData.candidateStatus !== "interne") return;
    if (!signUpData.matricule || signUpData.matricule.trim() === "") {
      setIsMatriculeValid(false);
      setMatriculeError("");
      return;
    }
    
    console.log('⏱️ Timer de vérification du matricule démarré (1s)...');
    const timer = setTimeout(() => {
      verifyMatricule();
    }, 1000);
    return () => clearTimeout(timer);
  }, [signUpData.matricule, signUpData.candidateStatus, verifyMatricule]);

  // Vérifier si tous les champs requis sont remplis (Inscription)
  const isSignUpFormValid = () => {
    // Vérifier si un type de candidature est sélectionné
    if (!signUpData.candidateStatus) return false;

    // Champs communs requis
    const commonFieldsFilled = 
      signUpData.firstName.trim() !== "" &&
      signUpData.lastName.trim() !== "" &&
      signUpData.email.trim() !== "" &&
      signUpData.phone.trim() !== "" &&
      signUpData.dateOfBirth !== "" &&
      signUpData.sexe !== "" &&
      signUpData.adresse.trim() !== "" &&
      signUpData.password.trim() !== "" &&
      signUpData.confirmPassword.trim() !== "" &&
      signUpData.politiqueConfidentialite === true; // Politique de confidentialité obligatoire

    if (!commonFieldsFilled) return false;

    // Validation de l'email (pas d'erreur)
    if (emailError !== "") return false;

    // Validation des mots de passe correspondants
    if (signUpData.password !== signUpData.confirmPassword) return false;

    // Si candidat interne, vérifier le matricule
    if (signUpData.candidateStatus === "interne") {
      return signUpData.matricule.trim() !== "" && isMatriculeValid;
    }

    return true;
  };

  // Vérifier si les champs de connexion sont remplis
  const isSignInFormValid = () => {
    return signInData.email.trim() !== "" && signInData.password.trim() !== "";
  };

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

      // Vérifier le statut AVANT d'afficher le toast de succès
      const { data: userRow, error: userRowError } = await supabase
        .from('users')
        .select('role, statut')
        .eq('id', data.user.id)
        .single();

      // Vérifier le statut de l'utilisateur
      if (userRow?.statut && userRow.statut !== 'actif') {
        await supabase.auth.signOut();
        
        const statutMessages: { [key: string]: string } = {
          'en_attente': 'Votre compte est en attente de validation par notre équipe.',
          'inactif': 'Votre compte a été désactivé. Contactez l\'administrateur.',
          'bloqué': 'Votre compte a été bloqué. Contactez l\'administrateur.',
          'archivé': 'Votre compte a été archivé. Contactez l\'administrateur.'
        };
        
        const message = statutMessages[userRow.statut] || 'Votre compte n\'est pas actif.';
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      // Toast de succès seulement si le statut est actif
      const now = Date.now();
      if (now - lastLoginToastTs.current > 1500) {
        toast.success("Connexion réussie !");
        lastLoginToastTs.current = now;
      }
      
      if (redirectParam) {
        await syncUsersRowFromAuth();
        navigate(redirectParam);
      } else {
        try {

          const rawRole = String((!userRowError && (userRow as { role?: string; statut?: string } | null)?.role) ?? data.user.user_metadata?.role ?? '').toLowerCase();
          const isAdmin = rawRole === 'admin';
          const isRecruiter = rawRole === 'recruteur' || rawRole === 'recruiter';
          const isObserver = rawRole === 'observateur' || rawRole === 'observer';

          await syncUsersRowFromAuth();
          if (isAdmin) {
            navigate('/admin/dashboard');
          } else if (isRecruiter || isObserver) {
            navigate('/recruiter/dashboard');
          } else {
            navigate('/candidate/dashboard');
          }
        } catch {
          const rawRole = String(data.user.user_metadata?.role ?? '').toLowerCase();
          await syncUsersRowFromAuth();
          if (rawRole === 'admin') {
            navigate('/admin/dashboard');
          } else if (rawRole === 'recruteur' || rawRole === 'recruiter' || rawRole === 'observateur' || rawRole === 'observer') {
            navigate('/recruiter/dashboard');
          } else {
            navigate('/candidate/dashboard');
          }
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

    if (preLaunch) {
      toast.info("Les inscriptions seront disponibles à partir du lundi 25 août 2025.");
      setIsSubmitting(false);
      return;
    }

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

    // Pour les candidats internes, vérifier le matricule
    if (signUpData.candidateStatus === "interne") {
      const currentMatricule = signUpData.matricule.trim();
      let ok = isMatriculeValid && lastVerifiedMatricule === currentMatricule;
      
      if (!ok) {
        ok = await verifyMatricule();
      }
      
      if (!ok) {
        toast.error("Vérifiez votre matricule pour continuer.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, {
        role: "candidat",
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone,
        matricule: signUpData.matricule || null,
        date_of_birth: signUpData.dateOfBirth,
        sexe: signUpData.sexe,
        adresse: signUpData.adresse,
        candidate_status: signUpData.candidateStatus,
        no_seeg_email: signUpData.noSeegEmail,
        politique_confidentialite: signUpData.politiqueConfidentialite,
      });
      
      if (error) {
        if (error.status === 429 || error.message.includes('rate limit')) {
          toast.error("Trop de tentatives. Attendez 60 secondes avant de réessayer.");
          setCooldown(60);
        } else if (error.message.includes("already registered")) {
          toast.error("Cette adresse email est déjà utilisée. Essayez de vous connecter.");
          setActiveTab("signin");
        } else if (error.message.includes('email')) {
          toast.error("Problème avec l'adresse email. Vérifiez le format.");
        } else {
          toast.error("Erreur d'inscription: " + error.message);
        }
      } else {
        // Envoyer l'email de bienvenue pour TOUS les nouveaux inscrits (non bloquant)
        fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: signUpData.email,
            firstName: signUpData.firstName,
            lastName: signUpData.lastName,
            sexe: signUpData.sexe,
            candidateStatus: signUpData.candidateStatus,
          }),
        }).catch(err => {
          console.error('⚠️ Erreur envoi email de bienvenue (non bloquant):', err);
        });

        // Si candidat interne sans email SEEG, envoyer les notifications spécifiques
        if (signUpData.candidateStatus === "interne" && signUpData.noSeegEmail) {
          console.log('📧 Envoi des notifications pour candidat interne sans email SEEG...');
          
          // Envoyer les emails de notification (non bloquant)
          sendAccessRequestNotification({
            userEmail: signUpData.email,
            firstName: signUpData.firstName,
            lastName: signUpData.lastName,
            phone: signUpData.phone,
            matricule: signUpData.matricule,
            dateOfBirth: signUpData.dateOfBirth,
            sexe: signUpData.sexe,
            adresse: signUpData.adresse,
          }).catch(err => {
            console.error('⚠️ Erreur envoi notifications (non bloquant):', err);
          });

          toast.success("Inscription réussie ! Votre demande d'accès est en attente de validation.");
          toast.info("Vous recevrez un email de confirmation une fois votre compte validé.");
          setActiveTab("signin");
          setSignInData(prev => ({ ...prev, email: signUpData.email }));
          return;
        }

        // Pour les autres cas, connexion immédiate
        try {
          const { data: sess } = await supabase.auth.getSession();
          if (!sess.session) {
            const { data: siData, error: siErr } = await signIn(signUpData.email, signUpData.password);
            if (!siErr && siData.user) {
              await syncUsersRowFromAuth();
              toast.success("Inscription réussie ! Vous êtes connecté.");
              navigate('/candidate/dashboard');
              return;
            }
          } else {
            await syncUsersRowFromAuth();
            toast.success("Inscription réussie ! Vous êtes connecté.");
            navigate('/candidate/dashboard');
            return;
          }
        } catch {
          // ignore and fall back to classic flow
        }

        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isDevelopment) {
          toast.success("Inscription réussie! Vous pouvez maintenant vous connecter.");
        } else {
          toast.success("Inscription réussie! Vérifiez votre email pour confirmer votre compte.");
        }
        setActiveTab("signin");
        setSignInData(prev => ({ ...prev, email: signUpData.email }));
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const syncUsersRowFromAuth = async () => {
    try {
      const { data: sess } = await supabase.auth.getSession();
      const authUser = sess.session?.user;
      if (!authUser) return;
      const meta = (authUser as unknown as { user_metadata?: Record<string, unknown> })?.user_metadata || {};
      const get = (k: string) => (meta as Record<string, unknown>)[k];
      const upsertPayload: Record<string, unknown> = {
        id: authUser.id,
        email: authUser.email,
      };
      if (typeof get('first_name') === 'string') upsertPayload.first_name = get('first_name');
      if (typeof get('last_name') === 'string') upsertPayload.last_name = get('last_name');
      if (typeof get('phone') === 'string') upsertPayload.phone = get('phone');
      if (typeof get('matricule') === 'string') upsertPayload.matricule = get('matricule');
      // Do NOT set role here from client
      // Vérifier d'abord si l'utilisateur existe déjà
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (existingUser) {
        // Utilisateur existe déjà, faire un update sans le matricule pour éviter les conflits
        const updatePayload = { ...upsertPayload };
        delete updatePayload.matricule; // Ne pas mettre à jour le matricule s'il existe déjà
        delete updatePayload.id; // Ne pas inclure l'ID dans l'update
        
        const { error: upErr } = await supabase
          .from('users')
          .update(updatePayload as any)
          .eq('id', authUser.id);
        
        if (upErr) {
          console.warn('users update after signup failed (non-blocking):', upErr.message);
        }
      } else {
        // Nouvel utilisateur, faire un insert
        const { error: upErr } = await supabase
          .from('users')
          .insert(upsertPayload as any);
        
        if (upErr) {
          console.warn('users insert after signup failed (non-blocking):', upErr.message);
        }
      }
    } catch (err) {
      console.warn('users upsert sync error (non-blocking):', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <Link to="/">
            <Button variant="ghost" className="mb-3 sm:mb-4 text-blue-600 bg-white text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Retour à l'accueil</span>
              <span className="sm:hidden">Retour</span>
            </Button>
          </Link>
          
          <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Plateforme OneHCM | Talent source
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">Accès à votre compte</h1>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg opacity-90 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
              Connectez-vous ou créez votre compte pour accéder à la plateforme de recrutement SEEG
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-sm sm:max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Authentification</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {showForgotPassword ? (
                <ForgotPassword onBack={() => setShowForgotPassword(false)} />
              ) : (
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Connexion</TabsTrigger>
                    <TabsTrigger value="signup">
                      Inscription
                    </TabsTrigger>
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
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showSigninPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        aria-label={showSigninPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        onClick={() => setShowSigninPassword((v) => !v)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showSigninPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
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

                  {!isSignInFormValid() && (
                    <p className="text-xs text-center text-muted-foreground">
                      Veuillez remplir votre email et mot de passe
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={!isSignInFormValid() || isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Connexion en cours...</span>
                      </div>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <div className="relative">
                  {preLaunch && (
                    <div
                      className="absolute inset-0 z-10 cursor-not-allowed"
                      onClick={preLaunchToast}
                      aria-hidden="true"
                    />
                  )}
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Type de candidat */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Type de candidature</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSignUpData({ ...signUpData, candidateStatus: "interne", noSeegEmail: false })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            signUpData.candidateStatus === "interne"
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Building2 className={`w-5 h-5 mx-auto mb-2 ${
                            signUpData.candidateStatus === "interne" ? "text-primary" : "text-gray-400"
                          }`} />
                          <div className={`text-sm font-medium ${
                            signUpData.candidateStatus === "interne" ? "text-primary" : "text-gray-700"
                          }`}>
                            Candidat Interne
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Agent SEEG
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (externalRegistrationDisabled) {
                              toast.error(getDisabledMessage());
                              return;
                            }
                            setSignUpData({ ...signUpData, candidateStatus: "externe", matricule: "" });
                          }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            externalRegistrationDisabled
                              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                              : signUpData.candidateStatus === "externe"
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          disabled={externalRegistrationDisabled}
                          title={externalRegistrationDisabled ? getDisabledMessage() : ""}
                        >
                          <User className={`w-5 h-5 mx-auto mb-2 ${
                            externalRegistrationDisabled
                              ? "text-gray-300"
                              : signUpData.candidateStatus === "externe" ? "text-primary" : "text-gray-400"
                          }`} />
                          <div className={`text-sm font-medium ${
                            externalRegistrationDisabled
                              ? "text-gray-400"
                              : signUpData.candidateStatus === "externe" ? "text-primary" : "text-gray-700"
                          }`}>
                            Candidat Externe
                          </div>
                          <div className={`text-xs mt-1 ${
                            externalRegistrationDisabled
                              ? "text-gray-300"
                              : "text-muted-foreground"
                          }`}>
                            {externalRegistrationDisabled ? <span className='text-orange-500'> Les inscriptions externes sont fermées</span> : "Hors SEEG"}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Afficher un message si aucun type n'est sélectionné */}
                    {!signUpData.candidateStatus && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          Veuillez sélectionner un type de candidature pour continuer
                        </p>
                      </div>
                    )}

                    {/* Afficher les champs uniquement si un type est sélectionné */}
                    {signUpData.candidateStatus && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm">Prénom</Label>
                            <Input
                              id="firstName"
                              placeholder="Prénom"
                              value={signUpData.firstName}
                              onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                              className="text-sm"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm">Nom</Label>
                            <Input
                              id="lastName"
                              placeholder="Nom"
                              value={signUpData.lastName}
                              onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                              className="text-sm"
                              required
                            />
                          </div>
                        </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">
                        Email {signUpData.candidateStatus === "interne" && !signUpData.noSeegEmail && "(professionnel SEEG)"}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder={
                            signUpData.candidateStatus === "interne" && !signUpData.noSeegEmail
                              ? "prenom.nom@seeg-gabon.com"
                              : "votre.email@exemple.com"
                          }
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          className={`pl-10 ${emailError ? "border-red-500 focus:ring-red-500" : ""}`}
                          required
                        />
                      </div>
                      {emailError && (
                        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {emailError}
                        </p>
                      )}
                      {signUpData.candidateStatus === "interne" && (
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="checkbox"
                            id="noSeegEmail"
                            checked={signUpData.noSeegEmail}
                            onChange={(e) => setSignUpData({ ...signUpData, noSeegEmail: e.target.checked, email: "" })}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          />
                          <Label htmlFor="noSeegEmail" className="text-xs text-muted-foreground font-normal cursor-pointer">
                            Je n'ai pas d'email professionnel SEEG
                          </Label>
                        </div>
                      )}
                    </div>

                    {/* Matricule field (only for internal candidates) */}
                    {signUpData.candidateStatus === "interne" && (
                      <div className="space-y-2">
                        <Label htmlFor="matricule">Matricule SEEG</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="matricule"
                            placeholder="Ex: 1234"
                            title="Le matricule ne doit contenir que des chiffres."
                            value={signUpData.matricule}
                            onChange={(e) => setSignUpData({ ...signUpData, matricule: e.target.value })}
                            className={`pl-10 ${matriculeError ? "border-destructive" : isMatriculeValid && signUpData.matricule ? "border-green-500" : ""}`}
                            required
                          />
                          {isVerifyingMatricule && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {matriculeError && (
                          <Card className="border-red-200 bg-red-50">
                            <CardContent className="py-3 flex items-start gap-2 text-red-700">
                              <AlertCircle className="w-4 h-4 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Vérification du matricule</p>
                                <p className="text-sm">{matriculeError}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {isVerifyingMatricule && (
                          <p className="text-xs text-blue-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Vérification en cours...
                          </p>
                        )}
                        {!isVerifyingMatricule && isMatriculeValid && signUpData.matricule && signUpData.matricule.trim() === lastVerifiedMatricule && !matriculeError && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                            Matricule vérifié
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+241 01 23 45 67"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        disabled={signUpData.candidateStatus === "interne" && !isMatriculeValid}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date de naissance</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={signUpData.dateOfBirth}
                          onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })}
                          disabled={signUpData.candidateStatus === "interne" && !isMatriculeValid}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sexe">Sexe</Label>
                        <select
                          id="sexe"
                          value={signUpData.sexe}
                          onChange={(e) => setSignUpData({ ...signUpData, sexe: e.target.value })}
                          disabled={signUpData.candidateStatus === "interne" && !isMatriculeValid}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Sélectionner</option>
                          <option value="M">Homme</option>
                          <option value="F">Femme</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adresse">Adresse</Label>
                      <Input
                        id="adresse"
                        type="text"
                        placeholder="Ex: bikele"
                        value={signUpData.adresse}
                        onChange={(e) => setSignUpData({ ...signUpData, adresse: e.target.value })}
                        disabled={signUpData.candidateStatus === "interne" && !isMatriculeValid}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="Mot de passe (min. 6 caractères)"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                          disabled={signUpData.candidateStatus === "interne" && !isMatriculeValid}
                        />
                        <button
                          type="button"
                          aria-label={showSignupPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          onClick={() => setShowSignupPassword((v) => !v)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showSignupConfirm ? "text" : "password"}
                          placeholder="Confirmez votre mot de passe"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                          className="pl-10 pr-10"
                          required
                          disabled={signUpData.candidateStatus === "interne" && !isMatriculeValid}
                        />
                        <button
                          type="button"
                          aria-label={showSignupConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          onClick={() => setShowSignupConfirm((v) => !v)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showSignupConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Politique de confidentialité */}
                    <div className="space-y-3 border-t pt-4 mt-2">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="politiqueConfidentialite"
                          checked={signUpData.politiqueConfidentialite}
                          onChange={(e) => setSignUpData({ ...signUpData, politiqueConfidentialite: e.target.checked })}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 mt-0.5 flex-shrink-0"
                          required
                        />
                        <Label htmlFor="politiqueConfidentialite" className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed">
                          J'accepte la{" "}
                          <a 
                            href="/privacy-policy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                          >
                            politique de confidentialité
                          </a>
                          {" "}et je consens au traitement de mes données personnelles conformément à celle-ci. *
                        </Label>
                      </div>
                      {!signUpData.politiqueConfidentialite && signUpData.candidateStatus && (
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Vous devez accepter la politique de confidentialité pour continuer
                        </p>
                      )}
                    </div>

                    {!isSignUpFormValid() && signUpData.candidateStatus && (
                      <p className="text-xs text-center text-muted-foreground">
                        {signUpData.candidateStatus === "interne" && !isMatriculeValid 
                          ? "Veuillez vérifier que votre matricule est valide"
                          : emailError 
                            ? "Veuillez corriger l'adresse email"
                            : signUpData.password !== signUpData.confirmPassword
                              ? "Les mots de passe ne correspondent pas"
                              : !signUpData.politiqueConfidentialite
                                ? "Veuillez accepter la politique de confidentialité"
                                : "Veuillez remplir tous les champs obligatoires"}
                      </p>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!isSignUpFormValid() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Inscription en cours...</span>
                        </div>
                      ) : (
                        "S'inscrire"
                      )}
                    </Button>
                      </>
                    )}
                  </form>
                </div>
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