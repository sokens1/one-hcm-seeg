# Basculement de l'Authentification vers Azure API

## ❓ Pourquoi Supabase est encore utilisé ?

### État Actuel

L'authentification utilise **encore Supabase** car :

1. **Hook actuel** : Le composant `Auth.tsx` utilise `useAuth` qui pointe vers Supabase
   ```tsx
   import { useAuth } from "@/hooks/useAuth"; // ← Supabase
   const { signIn, signUp, isLoading } = useAuth();
   ```

2. **Nouveau hook créé mais non utilisé** : Nous avons créé `useAzureAuth` mais il n'est **pas encore intégré**
   ```tsx
   // Fichier créé : src/hooks/useAzureAuth.tsx
   // Mais pas encore importé dans Auth.tsx
   ```

3. **Fonction de vérification matricule** : Utilise Supabase RPC pour vérifier dans la table `seeg_agents`
   ```tsx
   await supabase.rpc('verify_matricule', { p_matricule: matricule });
   ```

---

## 🔄 Options de Migration

### Option 1 : Migration Progressive (Recommandée)

**Avantages :**
- Moins de risques
- Possibilité de rollback
- Test en parallèle

**Étapes :**
1. ✅ Garder Supabase pour les fonctionnalités existantes
2. ✅ Utiliser Azure API uniquement pour les nouvelles inscriptions
3. Migrer progressivement les connexions
4. Décommissionner Supabase une fois tout validé

### Option 2 : Basculement Complet Immédiat

**Avantages :**
- Architecture unifiée
- Pas de double gestion

**Inconvénients :**
- Plus risqué
- Nécessite migration de toutes les données
- Pas de rollback facile

---

## 🚀 Comment Basculer vers Azure API

### Étape 1 : Modifier `Auth.tsx` pour utiliser `useAzureAuth`

```tsx
// AVANT (Supabase)
import { useAuth } from "@/hooks/useAuth";
const { signIn, signUp, isLoading } = useAuth();

// APRÈS (Azure)
import { useAzureAuth } from "@/hooks/useAzureAuth";
const { signIn, signUp, isLoading, isUpdating } = useAzureAuth();
```

### Étape 2 : Adapter les Appels d'Inscription

**Code actuel (Supabase) :**
```tsx
const handleSignUp = async (e: React.FormEvent) => {
  const { error } = await signUp(
    signUpData.email,
    signUpData.password,
    {
      role: "candidat",
      first_name: signUpData.firstName,
      // ...
    }
  );
};
```

**Nouveau code (Azure) :**
```tsx
const handleSignUp = async (e: React.FormEvent) => {
  const { error, success } = await signUp(signUpData);
  // signUpData contient déjà tous les champs nécessaires
};
```

### Étape 3 : Migrer la Vérification du Matricule

**Option A : Garder Supabase pour la vérification**
```tsx
// Continuer à utiliser supabase.rpc('verify_matricule')
// Car la table seeg_agents est sur Supabase
```

**Option B : Migrer vers Azure**
```tsx
// Utiliser useAzureAuth
const { verifyMatricule } = useAzureAuth();
const isValid = await verifyMatricule(matricule);
```

### Étape 4 : Configurer les Variables d'Environnement

Votre `.env.local` doit contenir :

```bash
# API Azure Backend
VITE_API_BASE_URL=https://seeg-backend-api.azurewebsites.net
VITE_API_VERSION=v1

# Supabase (pour la transition)
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_supabase
```

---

## 📝 Plan de Migration Recommandé

### Phase 1 : Inscription (En cours)
- ✅ Créer `useAzureAuth`
- ✅ Créer `azureClient`
- ⏳ Intégrer dans `Auth.tsx`
- ⏳ Tester les inscriptions

### Phase 2 : Connexion
- ⏳ Adapter la connexion pour utiliser Azure
- ⏳ Gérer les tokens/sessions Azure
- ⏳ Tester les connexions

### Phase 3 : Matricule
- **Option A** : Garder la vérification sur Supabase
- **Option B** : Migrer la table `seeg_agents` vers Azure PostgreSQL

### Phase 4 : Migration des Données
- Exporter les utilisateurs de Supabase
- Importer dans Azure PostgreSQL
- Valider la migration

### Phase 5 : Décommissionnement Supabase
- Rediriger tous les appels vers Azure
- Désactiver Supabase
- Supprimer les dépendances Supabase

---

## 🔧 Code de Basculement Rapide

Si vous voulez basculer **maintenant** vers Azure pour l'inscription :

### 1. Modifier les imports dans `Auth.tsx`

```tsx
// Ligne 9 : Remplacer
import { useAuth } from "@/hooks/useAuth";
// Par
import { useAzureAuth } from "@/hooks/useAzureAuth";

// Ligne 20 : Remplacer
const { signIn, signUp, isLoading } = useAuth();
// Par
const { signIn, signUp, isUpdating } = useAzureAuth();
```

### 2. Modifier `handleSignUp`

```tsx
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!isSignUpFormValid()) {
    toast.error("Veuillez remplir tous les champs correctement");
    return;
  }

  setIsSubmitting(true);

  try {
    const { error, success } = await signUp({
      email: signUpData.email,
      password: signUpData.password,
      confirmPassword: signUpData.confirmPassword,
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      phone: signUpData.phone,
      matricule: signUpData.matricule,
      dateOfBirth: signUpData.dateOfBirth,
      sexe: signUpData.sexe,
      adresse: signUpData.adresse,
      candidateStatus: signUpData.candidateStatus as "interne" | "externe",
      noSeegEmail: signUpData.noSeegEmail,
    });

    if (error) {
      toast.error(error);
      return;
    }

    if (success) {
      toast.success("Inscription réussie ! Bienvenue.");
      navigate("/candidate/dashboard");
    }
  } catch (error: any) {
    toast.error(error.message || "Une erreur est survenue");
  } finally {
    setIsSubmitting(false);
  }
};
```

### 3. Garder la Vérification Matricule sur Supabase (pour l'instant)

```tsx
// Ne rien changer à verifyMatricule
// Il continue d'utiliser supabase.rpc('verify_matricule')
```

---

## ⚠️ Points d'Attention

### 1. Gestion des Sessions
- **Supabase** : Utilise des tokens JWT automatiques
- **Azure** : Vous devez gérer les tokens manuellement

### 2. Routes Protégées
Les composants `ProtectedRoute` utilisent actuellement Supabase :
```tsx
// src/components/auth/ProtectedRoute.tsx
// Doit être adapté pour Azure
```

### 3. Vérification du Matricule
La table `seeg_agents` est sur **Supabase PostgreSQL**, pas sur Azure.

**Options :**
- **Court terme** : Garder la vérification sur Supabase
- **Long terme** : Migrer la table vers Azure PostgreSQL

### 4. Compatibilité des Données

**Supabase `users` table :**
```sql
- id (UUID)
- email
- role
- first_name, last_name
- metadata JSON
```

**Azure API :**
```json
{
  "email": "...",
  "first_name": "...",
  "date_of_birth": "...",
  "sexe": "M/F"
}
```

Assurez-vous que les schémas sont compatibles.

---

## 🎯 Recommandation Finale

### Pour Production Immédiate

**Garder Supabase** pour :
- ✅ Authentification existante (signIn)
- ✅ Vérification matricule
- ✅ Routes protégées
- ✅ Gestion des sessions

**Utiliser Azure** pour :
- ⏳ Nouvelles inscriptions uniquement (quand prêt)
- ⏳ Nouvelles fonctionnalités

### Pour Migration Complète

1. **Semaine 1-2** : Tester Azure API en parallèle
2. **Semaine 3-4** : Migrer progressivement les inscriptions
3. **Semaine 5-6** : Migrer les connexions
4. **Semaine 7-8** : Migrer les données utilisateurs
5. **Semaine 9** : Désactiver Supabase

---

## 📞 Support

Pour toute question sur la migration :
1. Vérifier la documentation Azure : `MIGRATION_AZURE_API.md`
2. Tester en local avec `npm run dev`
3. Vérifier les logs dans Azure Application Insights
4. Consulter l'API Swagger : `https://seeg-backend-api.azurewebsites.net/docs`

---

## ✅ Validation du Bouton de Connexion Ajoutée

### Fonctionnalités Implémentées

1. **Validation des champs** :
   - Email et mot de passe requis
   - Bouton désactivé si champs vides

2. **Message d'aide** :
   - "Veuillez remplir votre email et mot de passe"

3. **Loader** :
   - Dans le bouton : "⏳ Connexion en cours..."
   - Overlay : "Connexion en cours... Veuillez patienter"

4. **Code ajouté** :
   ```tsx
   const isSignInFormValid = () => {
     return signInData.email.trim() !== "" && signInData.password.trim() !== "";
   };
   ```

Le formulaire de connexion a maintenant la **même validation** que l'inscription ! ✅
