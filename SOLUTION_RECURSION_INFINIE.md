# 🚨 Solution pour la récursion infinie RLS

## ❌ Problème identifié

**Erreur :** `infinite recursion detected in policy for relation "users"`

Cette erreur se produit quand les politiques RLS (Row Level Security) font référence à elles-mêmes de manière circulaire, créant une boucle infinie.

## ✅ Solution recommandée

### **Étape 1 : Désactiver RLS temporairement**

1. **Allez sur le Dashboard Supabase :**
   - URL : https://supabase.com/dashboard
   - Sélectionnez votre projet `ndkkrsjgaekdrobpntjr`

2. **Désactiver RLS pour les tables problématiques :**
   - Allez dans **Database** > **Tables**
   - Cliquez sur la table **"users"**
   - Allez dans l'onglet **"RLS"**
   - **Désactivez RLS** (bouton toggle)
   - Répétez pour la table **"candidate_profiles"**

### **Étape 2 : Tester l'application**

Une fois RLS désactivé, testez l'application :
- Les utilisateurs peuvent se connecter ✅
- Les données s'affichent correctement ✅
- Toutes les fonctionnalités marchent ✅

### **Étape 3 : Réactiver RLS proprement**

Une fois que l'application fonctionne, réactivez RLS avec des politiques simples :

1. **Réactivez RLS** pour les tables
2. **Créez des politiques simples** sans récursion :
   - `users` : Lecture pour tous, modification pour soi-même
   - `candidate_profiles` : Lecture pour tous, modification pour soi-même
   - `job_offers` : Lecture pour tous, gestion pour recruteurs
   - `applications` : Lecture/modification selon le rôle

## 🔧 Solution alternative (si vous avez accès SQL)

Si vous avez accès à l'éditeur SQL de Supabase :

```sql
-- Désactiver RLS temporairement
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
-- ... (supprimer toutes les autres politiques)

-- Créer des politiques simples
CREATE POLICY "users_view_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);

-- Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
```

## 📊 État actuel

### ✅ **Ce qui fonctionne :**
- **205 utilisateurs** importés avec succès
- **Connexion** fonctionne pour tous les rôles
- **Authentification** complète
- **Candidatures** accessibles via RPC

### ❌ **Ce qui ne fonctionne pas :**
- **Accès aux tables** `users` et `candidate_profiles` (récursion infinie)
- **Affichage des offres d'emploi** (dépend de `users`)
- **Profils candidats** (dépend de `users`)

## 🎯 Résultat attendu

Une fois RLS corrigé :
- ✅ **Toutes les fonctionnalités** marcheront
- ✅ **Sécurité** maintenue avec des politiques simples
- ✅ **Performance** optimale
- ✅ **Application** entièrement opérationnelle

## 📞 Support

Si vous avez besoin d'aide :
1. **Dashboard Supabase** : Interface graphique pour gérer RLS
2. **Éditeur SQL** : Pour exécuter des commandes SQL directes
3. **Documentation RLS** : https://supabase.com/docs/guides/auth/row-level-security

---

**⚠️ Important :** Cette solution temporaire désactive la sécurité au niveau des lignes. Réactivez RLS dès que possible avec des politiques simples pour maintenir la sécurité de vos données.
