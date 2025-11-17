# 5 Parties de Code Essentielles pour le Rapport de Stage

## Partie 1 : Filtrage des Offres par Statut (Logique Métier Principale)

**Fichier :** `src/hooks/useJobOffers.tsx`  
**Lignes :** 211-240  
**Description :** Cette partie gère le filtrage des offres d'emploi selon le statut du candidat (interne/externe). C'est la logique métier centrale qui garantit que chaque candidat ne voit que les offres qui lui sont destinées.

```typescript
// 4.5. Filter offers based on candidate status (internal/external)
// Les recruteurs/admins/observateurs voient TOUTES les offres
// Les candidats voient uniquement les offres correspondant à leur statut
const offersFilteredByStatus = offersWithStats.filter(offer => {
  // Appliquer le filtre d'audience aux utilisateurs connectés non-recruteurs
  const shouldApplyAudienceFilter = isAuthenticated && !isRecruiter;
  if (!shouldApplyAudienceFilter) {
    // Recruteurs/admins/observateurs ou visiteurs non connectés : toutes les offres
    return true;
  }
  
  // À partir d'ici, on sait que c'est un utilisateur connecté non-recruteur (candidat)
  
  // Définir le statut de l'offre (externe par défaut si NULL)
  const offerStatus = offer.status_offerts || 'externe';
  
  // Définir le statut du candidat (externe par défaut si NULL)
  const userStatus = candidateStatus || 'externe';
  
  // RÈGLE D'AUDIENCE :
  // - Candidat INTERNE : voit SEULEMENT les offres internes
  // - Candidat EXTERNE : voit SEULEMENT les offres externes
  if (userStatus === 'interne' && offerStatus === 'interne') {
    return true; // Les internes voient seulement les offres internes
  } else if (userStatus === 'externe' && offerStatus === 'externe') {
    return true; // Les externes voient seulement les offres externes
  } else {
    return false; // Ne pas afficher les offres qui ne correspondent pas au statut
  }
});
```

---

## Partie 2 : Politiques de Sécurité RLS (Row Level Security)

**Fichier :** `supabase/migrations/20250127000004_fix_job_offers_rls_policies.sql`  
**Lignes :** 18-50  
**Description :** Ces politiques RLS sécurisent l'accès aux offres d'emploi. Elles garantissent que seuls les utilisateurs autorisés peuvent voir et modifier les données selon leur rôle.

```sql
-- Create a simple policy that allows everyone to view active job offers
CREATE POLICY "Everyone can view active job offers" ON public.job_offers
  FOR SELECT 
  USING (status = 'active');

-- Create policy for recruiters and admins to manage job offers
CREATE POLICY "Recruiters and Admins can manage job offers" ON public.job_offers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('recruteur', 'admin', 'recruiter')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('recruteur', 'admin', 'recruiter')
    )
  );

-- Create policy for observers to view job offers (read-only)
CREATE POLICY "Observers can view job offers" ON public.job_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('observateur', 'observer')
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
```

---

## Partie 3 : Validation du Formulaire de Candidature

**Fichier :** `src/components/forms/ApplicationForm.tsx`  
**Lignes :** 1092-1127  
**Description :** Cette partie gère la validation des différentes étapes du formulaire de candidature, avec des règles spécifiques selon le type d'offre (interne/externe).

```typescript
// Validation functions for each step
const validateStep1 = () => {
  // Validation de l'email avec nos utilitaires
  const isEmailValid = true; // Validation d'email désactivée
  
  return (
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    isEmailValid &&
    formData.gender.trim() !== '' &&
    formData.dateOfBirth !== null &&
    formData.currentPosition.trim() !== '' &&
    formData.yearsOfExperience.trim() !== ''
  );
};

const validateStep2 = () => {
  const basicDocsValid = (
    formData.cv !== null &&
    formData.coverLetter !== null &&
    formData.certificates && formData.certificates.length > 0  // At least one diploma is required
  );
  
  // Les références sont requises uniquement pour les offres externes (minimum 2)
  if (isExternalOffer) {
    return basicDocsValid && formData.references && formData.references.length >= 2;
  }
  
  // Le champ hasBeenManager est requis uniquement pour les offres internes
  if (isInternalOffer) {
    return basicDocsValid && formData.hasBeenManager !== null;
  }
  
  return basicDocsValid;
};
```

---

## Partie 4 : Gestion de l'Authentification et des Rôles Utilisateur

**Fichier :** `src/hooks/useAuth.tsx`  
**Lignes :** 423-439  
**Description :** Cette partie centralise la gestion des rôles utilisateur (candidat, recruteur, admin, observateur) et permet de déterminer les permissions de chaque utilisateur dans l'application.

```typescript
// Helper functions to check user role (normalize FR/EN + admin)
const getUserRole = () => {
  // Prefer DB role for dynamic behavior; fallback to auth metadata; default 'candidat'
  return dbRole || (user?.user_metadata?.role as string | undefined) || 'candidat';
};

const roleValue = getUserRole();
console.log('🔍 [useAuth] Role detection:', { 
  dbRole, 
  metadataRole: user?.user_metadata?.role, 
  roleValue,
  userId: user?.id 
});
const isCandidate = roleValue === 'candidat' || roleValue === 'candidate';
const isRecruiter = roleValue === 'recruteur' || roleValue === 'recruiter';
const isAdmin = roleValue === 'admin';
const isObserver = roleValue === 'observateur' || roleValue === 'observer';
```

---

## Partie 5 : Flux d'Authentification (Inscription et Connexion)

**Fichier :** `src/pages/Auth.tsx`  
**Lignes :** 200-335  
**Description :** Cette portion illustre le parcours complet d'inscription et de connexion : vérification des champs obligatoires, validation du matricule interne, gestion des messages d'erreur et redirection selon le rôle (admin, recruteur, candidat, observateur).

```typescript
const isSignUpFormValid = () => {
  if (!signUpData.candidateStatus) return false;

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
    signUpData.politiqueConfidentialite === true;

  if (!commonFieldsFilled) return false;
  if (emailError !== "") return false;
  if (signUpData.password !== signUpData.confirmPassword) return false;

  if (signUpData.candidateStatus === "interne") {
    return signUpData.matricule.trim() !== "" && isMatriculeValid;
  }

  return true;
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

    const { data: userRow, error: userRowError } = await supabase
      .from('users')
      .select('role, statut')
      .eq('id', data.user.id)
      .single();

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
  } catch {
    toast.error("Une erreur est survenue lors de la connexion");
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Notes pour la Présentation dans le Rapport

1. **Partie 1 (Filtrage)** : Montre la logique métier qui sépare les offres internes et externes
2. **Partie 2 (RLS)** : Démontre la sécurité au niveau de la base de données
3. **Partie 3 (Validation)** : Illustre la gestion des formulaires avec validation conditionnelle
4. **Partie 4 (Authentification)** : Présente la gestion centralisée des rôles et permissions
5. **Partie 5 (Inscription/Connexion)** : Explique le parcours complet d'inscription et de connexion avec redirection selon le rôle

Ces 5 parties couvrent les aspects essentiels du projet : logique métier, sécurité, validation des données, gestion des utilisateurs et flux d'inscription/connexion.

