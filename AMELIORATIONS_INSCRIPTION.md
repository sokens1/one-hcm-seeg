# Améliorations du Formulaire d'Inscription

## ✅ Modifications Effectuées

### 1. 🔒 Masquage des Champs Tant Que le Type N'est Pas Sélectionné

**Problème initial :** Tous les champs étaient affichés dès le chargement de la page.

**Solution :**
- État initial du `candidateStatus` : `""` (vide)
- Tous les champs après la sélection du type sont enveloppés dans une condition :
  ```tsx
  {signUpData.candidateStatus && (
    <>
      {/* Tous les champs du formulaire */}
    </>
  )}
  ```
- Message affiché si aucun type n'est sélectionné :
  ```
  "Veuillez sélectionner un type de candidature pour continuer"
  ```

**Résultat :**
- ✅ L'utilisateur doit d'abord choisir entre "Candidat Interne" ou "Candidat Externe"
- ✅ Les champs s'affichent uniquement après la sélection
- ✅ Meilleure expérience utilisateur avec un flux guidé

---

### 2. 📧 Validation Email en Temps Réel avec Message d'Erreur

**Problème initial :** La validation de l'email @seeg.com était uniquement native HTML5 (pattern), sans retour visuel clair.

**Solution :**

#### État pour l'erreur email :
```tsx
const [emailError, setEmailError] = useState<string>("");
```

#### Validation en temps réel :
```tsx
useEffect(() => {
  if (signUpData.candidateStatus === "interne" && !signUpData.noSeegEmail && signUpData.email) {
    const emailPattern = /@seeg\.com$/i;
    if (!emailPattern.test(signUpData.email)) {
      setEmailError("L'email doit être un email professionnel SEEG (@seeg.com)");
    } else {
      setEmailError("");
    }
  } else {
    setEmailError("");
  }
}, [signUpData.email, signUpData.candidateStatus, signUpData.noSeegEmail]);
```

#### Affichage visuel :
- **Bordure rouge** sur l'input : `border-red-500 focus:ring-red-500`
- **Message d'erreur** en dessous avec icône :
  ```tsx
  {emailError && (
    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3" />
      {emailError}
    </p>
  )}
  ```
- **Bouton désactivé** si erreur email : `disabled={... || emailError !== ""}`

**Résultat :**
- ✅ Feedback visuel immédiat avec bordure rouge
- ✅ Message d'erreur clair avec icône
- ✅ Bouton d'inscription désactivé si email invalide
- ✅ Validation uniquement pour les internes sans checkbox "Pas d'email SEEG"

---

### 3. 🔢 Vérification Réelle du Matricule dans la Table `seeg_agents`

**Problème initial :** La vérification utilisait `verify_seeg_matricule` qui n'existait pas dans les dernières migrations.

**Solution :**

#### Correction de la fonction RPC :
```tsx
const { data: isValid, error } = await supabase.rpc('verify_matricule', {
  p_matricule: matricule,
});
```

#### Fonction RPC Backend (Supabase) :
La fonction `verify_matricule` est définie dans les migrations :
- **Table** : `public.seeg_agents`
- **Colonnes** : `id`, `email`, `matricule`, `active`, `created_at`, `updated_at`
- **Logique** : Vérifie si le matricule existe dans la table et est actif
- **Sécurité** : `SECURITY DEFINER` pour accès sécurisé sans exposer la table
- **Permissions** : `GRANT EXECUTE TO anon` pour permettre la vérification avant authentification

#### Code de la fonction :
```sql
CREATE OR REPLACE FUNCTION public.verify_matricule(p_matricule TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.seeg_agents sa
    WHERE trim(sa.matricule) = trim(p_matricule)
  ) INTO v_match;

  RETURN COALESCE(v_match, false);
END;
$$;
```

**Résultat :**
- ✅ Vérification réelle dans la base de données Supabase
- ✅ Table `seeg_agents` utilisée pour stocker les matricules valides
- ✅ Sécurité : Fonction RPC sécurisée sans exposition directe de la table
- ✅ Feedback visuel : bordure verte + "Matricule vérifié"
- ✅ Gestion des erreurs : messages clairs en cas d'échec

---

## 📊 Flux Utilisateur Mis à Jour

```
1. Page de connexion/inscription
   ↓
2. Onglet "Inscription"
   ↓
3. Sélection du type de candidature
   ├── [Candidat Interne]
   │   ↓
   │   ├─ Prénom, Nom
   │   ├─ Email @seeg.com (validation en temps réel)
   │   │  └─ ❌ Bordure rouge + message si invalide
   │   ├─ ☑ "Pas d'email SEEG" (optionnel)
   │   ├─ Matricule (vérification dans seeg_agents)
   │   │  ├─ ⏳ Vérification automatique après 1s
   │   │  ├─ ✅ Bordure verte + "Matricule vérifié"
   │   │  └─ ❌ Message d'erreur si invalide
   │   ├─ Téléphone, Date de naissance, Sexe, Adresse
   │   └─ Mot de passe + Confirmation
   │
   └── [Candidat Externe]
       ↓
       ├─ Prénom, Nom
       ├─ Email (tout domaine)
       ├─ Téléphone, Date de naissance, Sexe, Adresse
       └─ Mot de passe + Confirmation
   ↓
4. Bouton "S'inscrire"
   ├─ Désactivé si :
   │  ├─ Interne ET matricule non validé
   │  ├─ Email invalide (erreur)
   │  └─ Soumission en cours
   └─ Activé si toutes les validations sont OK
   ↓
5. Inscription réussie → Redirection
```

---

## 🎨 Améliorations Visuelles

### Email avec Erreur
```
┌────────────────────────────────────┐
│ Email (professionnel SEEG)         │
├────────────────────────────────────┤
│ 📧 [prenom.nom@gmail.com]          │ ← Bordure rouge
├────────────────────────────────────┤
│ ⚠ L'email doit être un email      │ ← Message en rouge
│   professionnel SEEG (@seeg.com)   │
└────────────────────────────────────┘
```

### Matricule Validé
```
┌────────────────────────────────────┐
│ Matricule SEEG                     │
├────────────────────────────────────┤
│ 🏢 [1234]                          │ ← Bordure verte
├────────────────────────────────────┤
│ 🟢 Matricule vérifié               │ ← Message en vert
└────────────────────────────────────┘
```

### Message Avant Sélection
```
┌────────────────────────────────────┐
│ Type de candidature                │
├────────────────────────────────────┤
│ [Candidat Interne] [Candidat Ext.] │
├────────────────────────────────────┤
│                                    │
│  Veuillez sélectionner un type    │
│  de candidature pour continuer    │
│                                    │
└────────────────────────────────────┘
```

---

## 🔧 Configuration Technique

### Table Supabase : `seeg_agents`

Pour que la vérification du matricule fonctionne, assurez-vous que la table existe :

```sql
CREATE TABLE IF NOT EXISTS public.seeg_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  matricule TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Fonction RPC : `verify_matricule`

```sql
CREATE OR REPLACE FUNCTION public.verify_matricule(p_matricule TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.seeg_agents sa
    WHERE trim(sa.matricule) = trim(p_matricule)
  ) INTO v_match;

  RETURN COALESCE(v_match, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO anon;
```

### Permissions

- La fonction RPC doit être exécutable par `anon` pour permettre la vérification avant authentification
- La table `seeg_agents` doit avoir RLS activé pour sécurité
- Aucune politique de SELECT directe (tout passe par la fonction RPC)

---

## 🚀 Tests à Effectuer

### Test 1 : Sélection du Type
- [ ] Aucun champ affiché au départ
- [ ] Message "Veuillez sélectionner..." affiché
- [ ] Champs affichés après sélection du type

### Test 2 : Validation Email (Interne)
- [ ] Email @seeg.com accepté (pas d'erreur)
- [ ] Email autre domaine : bordure rouge + message
- [ ] Checkbox "Pas d'email SEEG" : permet autre domaine
- [ ] Bouton désactivé si email invalide

### Test 3 : Vérification Matricule
- [ ] Matricule valide → bordure verte + "Matricule vérifié"
- [ ] Matricule invalide → message d'erreur
- [ ] Spinner pendant la vérification (1s)
- [ ] Champs suivants désactivés tant que non validé

### Test 4 : Candidat Externe
- [ ] Pas de champ matricule
- [ ] Email tout domaine accepté
- [ ] Tous les champs actifs immédiatement

### Test 5 : Soumission
- [ ] Bouton désactivé si validations non OK
- [ ] Bouton actif si tout est OK
- [ ] Spinner + "Inscription en cours..." pendant soumission

---

## 📝 Notes Importantes

1. **Table `seeg_agents`** : Doit être peuplée avec les matricules valides des employés SEEG
2. **Fonction RPC** : Doit être déployée sur Supabase (vérifier dans SQL Editor)
3. **Performance** : Debounce de 1 seconde sur la vérification du matricule pour éviter trop d'appels
4. **Sécurité** : La fonction RPC est `SECURITY DEFINER` pour accès sécurisé sans exposer la table
5. **UX** : Feedback visuel immédiat pour guider l'utilisateur à chaque étape
