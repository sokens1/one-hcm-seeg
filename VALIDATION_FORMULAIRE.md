# Validation Complète du Formulaire d'Inscription

## ✅ Amélioration Effectuée

### 🎯 Objectif
Désactiver le bouton de soumission tant que tous les champs requis ne sont pas remplis, et afficher un loader pendant la soumission.

---

## 📋 Fonction de Validation : `isFormValid()`

### Code Implémenté

```typescript
const isFormValid = () => {
  // 1. Vérifier si un type de candidature est sélectionné
  if (!signUpData.candidateStatus) return false;

  // 2. Vérifier que tous les champs communs sont remplis
  const commonFieldsFilled = 
    signUpData.firstName.trim() !== "" &&
    signUpData.lastName.trim() !== "" &&
    signUpData.email.trim() !== "" &&
    signUpData.phone.trim() !== "" &&
    signUpData.dateOfBirth !== "" &&
    signUpData.sexe !== "" &&
    signUpData.adresse.trim() !== "" &&
    signUpData.password.trim() !== "" &&
    signUpData.confirmPassword.trim() !== "";

  if (!commonFieldsFilled) return false;

  // 3. Vérifier qu'il n'y a pas d'erreur sur l'email
  if (emailError !== "") return false;

  // 4. Vérifier que les mots de passe correspondent
  if (signUpData.password !== signUpData.confirmPassword) return false;

  // 5. Pour les candidats internes, vérifier le matricule
  if (signUpData.candidateStatus === "interne") {
    return signUpData.matricule.trim() !== "" && isMatriculeValid;
  }

  return true;
};
```

### Logique de Validation

#### ✅ Champs Communs Validés
- Prénom (`firstName`)
- Nom (`lastName`)
- Email (`email`)
- Téléphone (`phone`)
- Date de naissance (`dateOfBirth`)
- Sexe (`sexe`)
- Adresse (`adresse`)
- Mot de passe (`password`)
- Confirmation mot de passe (`confirmPassword`)

#### ✅ Validations Spécifiques

**Pour tous :**
- Email valide (pas d'erreur)
- Mots de passe identiques

**Pour les candidats internes uniquement :**
- Matricule renseigné
- Matricule validé (vérifié dans la base de données)

---

## 🎨 Interface Utilisateur

### 1. Message d'Aide au-dessus du Bouton

Un message contextuel s'affiche pour guider l'utilisateur :

```tsx
{!isFormValid() && signUpData.candidateStatus && (
  <p className="text-xs text-center text-muted-foreground">
    {signUpData.candidateStatus === "interne" && !isMatriculeValid 
      ? "Veuillez vérifier que votre matricule est valide"
      : emailError 
        ? "Veuillez corriger l'adresse email"
        : signUpData.password !== signUpData.confirmPassword
          ? "Les mots de passe ne correspondent pas"
          : "Veuillez remplir tous les champs obligatoires"}
  </p>
)}
```

#### Messages Possibles
1. **"Veuillez vérifier que votre matricule est valide"** - Si candidat interne avec matricule invalide
2. **"Veuillez corriger l'adresse email"** - Si erreur email (domaine @seeg.com invalide)
3. **"Les mots de passe ne correspondent pas"** - Si password ≠ confirmPassword
4. **"Veuillez remplir tous les champs obligatoires"** - Si un ou plusieurs champs sont vides

### 2. Bouton Désactivé

```tsx
<Button 
  type="submit" 
  className="w-full"
  disabled={!isFormValid() || isSubmitting}
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
```

**États du bouton :**
- ✅ **Actif** : Tous les champs remplis et valides
- ❌ **Désactivé** : Un ou plusieurs champs manquants/invalides
- ⏳ **En cours** : Requête en cours avec loader animé

### 3. Overlay de Chargement (Soumission)

Un overlay s'affiche par-dessus le formulaire pendant la soumission :

```tsx
{isSubmitting && (
  <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
    <div className="bg-background border rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium">Création de votre compte...</p>
      <p className="text-xs text-muted-foreground">Veuillez patienter</p>
    </div>
  </div>
)}
```

**Caractéristiques :**
- Fond semi-transparent bloquant toute interaction
- Card centrée avec ombre
- Loader animé de 32x32px
- Message principal : "Création de votre compte..."
- Message secondaire : "Veuillez patienter"

---

## 🔄 Flux de Validation

```
┌─────────────────────────────────────────┐
│  1. Type de candidature sélectionné ?  │
│     ❌ Non → Bouton désactivé           │
│     ✅ Oui → Continuer                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Tous les champs communs remplis ?   │
│     (Prénom, Nom, Email, Tél, etc.)     │
│     ❌ Non → Message "Remplir tous..."  │
│     ✅ Oui → Continuer                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Email valide ?                      │
│     ❌ Non → Message "Corriger email"   │
│     ✅ Oui → Continuer                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Mots de passe identiques ?          │
│     ❌ Non → Message "Passwords ≠"      │
│     ✅ Oui → Continuer                  │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
   [INTERNE]        [EXTERNE]
       │                │
       │                └─► ✅ Formulaire valide
       │                    → Bouton actif
       │
       ▼
┌─────────────────────────────────────────┐
│  5. Matricule rempli et validé ?        │
│     ❌ Non → Message "Vérifier..."      │
│     ✅ Oui → Formulaire valide          │
│              → Bouton actif             │
└─────────────────────────────────────────┘
```

---

## 🎬 États Visuels du Bouton

### État 1 : Désactivé (Formulaire Incomplet)
```
┌────────────────────────────────────┐
│ Veuillez remplir tous les champs  │
│            obligatoires            │
├────────────────────────────────────┤
│         [S'inscrire]              │ ← Grisé, non cliquable
└────────────────────────────────────┘
```

### État 2 : Désactivé (Email Invalide)
```
┌────────────────────────────────────┐
│   Veuillez corriger l'adresse      │
│              email                 │
├────────────────────────────────────┤
│         [S'inscrire]              │ ← Grisé, non cliquable
└────────────────────────────────────┘
```

### État 3 : Désactivé (Mots de passe différents)
```
┌────────────────────────────────────┐
│  Les mots de passe ne              │
│     correspondent pas              │
├────────────────────────────────────┤
│         [S'inscrire]              │ ← Grisé, non cliquable
└────────────────────────────────────┘
```

### État 4 : Désactivé (Matricule Invalide - Interne)
```
┌────────────────────────────────────┐
│ Veuillez vérifier que votre        │
│      matricule est valide          │
├────────────────────────────────────┤
│         [S'inscrire]              │ ← Grisé, non cliquable
└────────────────────────────────────┘
```

### État 5 : Actif (Formulaire Valide)
```
┌────────────────────────────────────┐
│         [S'inscrire]              │ ← Bleu, cliquable
└────────────────────────────────────┘
```

### État 6 : En Cours de Soumission
```
┌────────────────────────────────────┐
│                                    │
│  ┌───────────────────────────┐    │
│  │  ⏳ Création de votre...  │    │ ← Overlay avec loader
│  │  Veuillez patienter       │    │
│  └───────────────────────────┘    │
│                                    │
│  [⏳ Inscription en cours...]     │ ← Bouton désactivé
└────────────────────────────────────┘
```

---

## 📊 Matrice de Validation

| Critère                      | Interne | Externe |
|------------------------------|---------|---------|
| Type sélectionné             | ✅      | ✅      |
| Prénom rempli                | ✅      | ✅      |
| Nom rempli                   | ✅      | ✅      |
| Email rempli                 | ✅      | ✅      |
| Email @seeg.com (si requis)  | ✅      | ❌      |
| Téléphone rempli             | ✅      | ✅      |
| Date de naissance remplie    | ✅      | ✅      |
| Sexe sélectionné             | ✅      | ✅      |
| Adresse remplie              | ✅      | ✅      |
| Mot de passe rempli          | ✅      | ✅      |
| Confirmation remplie         | ✅      | ✅      |
| Mots de passe identiques     | ✅      | ✅      |
| **Matricule rempli**         | **✅**  | **❌**  |
| **Matricule validé**         | **✅**  | **❌**  |

---

## 🚀 Expérience Utilisateur

### Avant la Soumission
1. L'utilisateur remplit progressivement les champs
2. Le message d'aide s'affiche tant que le formulaire est incomplet
3. Le message change selon le problème détecté
4. Le bouton reste grisé et non cliquable

### Pendant la Soumission
1. L'utilisateur clique sur "S'inscrire"
2. **Overlay immédiat** : Fond semi-transparent s'affiche
3. **Card de chargement** : Loader + message au centre
4. **Bouton transformé** : "⏳ Inscription en cours..."
5. **Blocage total** : Impossible de modifier le formulaire

### Après la Soumission
- **Succès** : Redirection vers la page appropriée
- **Erreur** : Overlay disparaît, message d'erreur affiché (toast)

---

## 🔧 Code des Validations

### Validation Email (Temps Réel)
```typescript
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

### Validation Matricule (Async avec Debounce)
```typescript
useEffect(() => {
  if (!signUpData.matricule) return;
  const timer = setTimeout(() => {
    verifyMatricule(); // Appel RPC Supabase
  }, 1000);
  return () => clearTimeout(timer);
}, [signUpData.matricule, verifyMatricule]);
```

---

## ✅ Résultat Final

- ✅ Bouton désactivé tant que tous les champs requis ne sont pas remplis
- ✅ Message d'aide contextuel selon le problème
- ✅ Validation différente pour interne/externe
- ✅ Loader visible dans le bouton pendant soumission
- ✅ Overlay de chargement bloquant pendant la requête
- ✅ Messages clairs : "Création de votre compte... Veuillez patienter"
- ✅ Impossible d'interagir avec le formulaire pendant la soumission
- ✅ Expérience utilisateur fluide et professionnelle
