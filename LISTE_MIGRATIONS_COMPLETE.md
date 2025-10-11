# Liste Complète des Migrations - OneHCM SEEG

## 📋 Ordre d'Application EXACT

**⚠️ IMPORTANT** : Appliquer les migrations **EXACTEMENT dans cet ordre** !

---

## Migration 0 : Fonction `verify_matricule` (PRÉREQUIS)

**Fichier** : `supabase/migrations/20241201000000_create_verify_matricule.sql`

**Ce qu'elle fait** :
- ✅ Crée la table `seeg_agents` (si n'existe pas)
- ✅ Crée la fonction `verify_matricule(p_matricule TEXT)` pour valider les matricules
- ✅ Accorde les permissions PUBLIC (nécessaire pour l'inscription)

**Pourquoi en premier ?**
- Cette fonction est utilisée lors de l'inscription des candidats internes
- Elle DOIT exister AVANT que les candidats puissent s'inscrire

**À faire AVANT d'appliquer** :
1. Vérifier si la table `seeg_agents` existe déjà
2. Si oui, commenter la partie `CREATE TABLE` dans la migration
3. Si non, insérer vos vrais matricules après la migration

---

## Migration 1 : Champs Candidat

**Fichier** : `supabase/migrations/20250110000000_add_candidate_fields.sql`

**Ce qu'elle fait** :
- ✅ Rend le champ `matricule` optionnel (NULL)
- ✅ Ajoute 8 nouveaux champs : `date_of_birth`, `sexe`, `adresse`, `candidate_status`, `statut`, `poste_actuel`, `annees_experience`, `no_seeg_email`
- ✅ Nettoie les données existantes invalides
- ✅ Ajoute les contraintes CHECK
- ✅ Crée les index
- ✅ Met à jour le trigger `handle_new_user`
- ✅ Crée les fonctions helper (`get_candidate_profile`, `update_candidate_profile`)

---

## Migration 2 : Système de Demandes d'Accès

**Fichier** : `supabase/migrations/20250110000001_update_internal_candidate_status.sql`

**Ce qu'elle fait** :
- ✅ Réécrit le trigger `handle_new_user` pour gérer le statut automatique
- ✅ Crée la table `access_requests`
- ✅ Crée les politiques RLS pour `access_requests`
- ✅ Crée le trigger `log_access_request` (création auto des demandes)
- ✅ Crée les fonctions `approve_access_request` et `reject_access_request`
- ✅ Crée la vue `pending_access_requests`

---

## Migration 3 : Motif de Refus

**Fichier** : `supabase/migrations/20250110000002_add_rejection_reason.sql`

**Ce qu'elle fait** :
- ✅ Ajoute le champ `rejection_reason` à `access_requests`
- ✅ Met à jour la fonction `reject_access_request` pour accepter le motif

---

## Migration 4 : Système "Vu/Non Vu"

**Fichier** : `supabase/migrations/20250110000003_add_viewed_to_access_requests.sql`

**Ce qu'elle fait** :
- ✅ Ajoute le champ `viewed` (BOOLEAN) à `access_requests`
- ✅ Crée la fonction `mark_access_request_as_viewed(request_id)`
- ✅ Crée la fonction `mark_all_access_requests_as_viewed()`
- ✅ Crée le trigger `reset_viewed_on_new_request`
- ✅ Crée les index pour la performance

---

## Migration 5 : Correction Fonctions

**Fichier** : `supabase/migrations/20250110000004_fix_approve_reject_functions.sql`

**Ce qu'elle fait** :
- ✅ Corrige `approve_access_request` pour ne pas utiliser `email_notifications`
- ✅ Corrige `reject_access_request` pour ne pas utiliser `email_notifications`

---

## 📝 Résumé Visual

```
0️⃣ create_verify_matricule.sql
   ↓ (Fonction verify_matricule)
   
1️⃣ add_candidate_fields.sql
   ↓ (8 nouveaux champs users)
   
2️⃣ update_internal_candidate_status.sql
   ↓ (Table access_requests + triggers)
   
3️⃣ add_rejection_reason.sql
   ↓ (Champ rejection_reason)
   
4️⃣ add_viewed_to_access_requests.sql
   ↓ (Champ viewed + badge)
   
5️⃣ fix_approve_reject_functions.sql
   ✅ (Correction finale)
```

---

## 🚀 Application sur Production

### Étape 1 : Dashboard Supabase Production

1. Aller sur https://supabase.com/dashboard
2. Sélectionner le **projet de PRODUCTION**
3. Cliquer sur **SQL Editor**

### Étape 2 : Appliquer Migration 0 (verify_matricule)

1. Nouvelle query
2. Copier `20241201000000_create_verify_matricule.sql`
3. **IMPORTANT** : Si la table `seeg_agents` existe déjà :
   - Commenter les lignes 6-9 (CREATE TABLE)
   - Garder uniquement la fonction `verify_matricule`
4. Cliquer sur **Run**
5. Vérifier : Aucune erreur

### Étape 3 : Insérer les Matricules Réels (Si Nouvelle Table)

Si tu as créé la table `seeg_agents`, tu dois maintenant y insérer les vrais matricules :

```sql
-- Remplacer par vos VRAIS matricules SEEG
INSERT INTO public.seeg_agents (matricule, first_name, last_name, email, active)
VALUES 
  ('2001', 'Prénom1', 'Nom1', 'agent1@seeg.com', TRUE),
  ('2002', 'Prénom2', 'Nom2', 'agent2@seeg.com', TRUE),
  ('2003', 'Prénom3', 'Nom3', 'agent3@seeg.com', TRUE)
  -- ... Ajouter TOUS les matricules valides
ON CONFLICT (matricule) DO NOTHING;
```

### Étape 4 : Tester la Fonction

```sql
-- Tester avec un matricule valide
SELECT verify_matricule('2001');
-- Doit retourner TRUE

-- Tester avec un matricule invalide
SELECT verify_matricule('99999');
-- Doit retourner FALSE
```

### Étape 5 : Appliquer les Migrations 1 à 5

Appliquer **dans l'ordre** :
1. `20250110000000_add_candidate_fields.sql`
2. `20250110000001_update_internal_candidate_status.sql`
3. `20250110000002_add_rejection_reason.sql`
4. `20250110000003_add_viewed_to_access_requests.sql`
5. `20250110000004_fix_approve_reject_functions.sql`

---

## ⚠️ IMPORTANT : Table `seeg_agents`

### Si la Table Existe Déjà

```sql
-- Vérifier si elle existe
SELECT * FROM public.seeg_agents LIMIT 5;
```

Si elle existe :
- ✅ **Ne PAS créer** la table dans la migration 0
- ✅ Créer **seulement** la fonction `verify_matricule`
- ✅ Vérifier que la table a bien les colonnes :
  - `id` (UUID)
  - `matricule` (TEXT UNIQUE)
  - `active` (BOOLEAN)

### Si la Table N'Existe PAS

```sql
-- La migration va la créer
-- Ensuite, IMPÉRATIF : Insérer tous les matricules valides
INSERT INTO seeg_agents (matricule, first_name, last_name, email, active)
VALUES (...);
```

---

## 🧪 Vérification Post-Migration

### Test 1 : Fonction verify_matricule

```sql
-- Doit retourner TRUE pour un matricule existant
SELECT verify_matricule('2001');

-- Doit retourner FALSE pour un matricule inexistant
SELECT verify_matricule('00000');
```

### Test 2 : Inscription avec Matricule

1. Aller sur le formulaire d'inscription
2. Sélectionner "Candidat interne"
3. Saisir un matricule valide (ex: 2001)
4. Vérifier : ✅ "Matricule vérifié" s'affiche en vert
5. Saisir un matricule invalide (ex: 99999)
6. Vérifier : ❌ "Matricule invalide" s'affiche en rouge

---

## 📊 Structure Finale de la Base de Données

### Tables Créées/Modifiées

| Table | Action | Nouveaux Champs |
|-------|--------|----------------|
| `seeg_agents` | Créée (si n'existe pas) | matricule, first_name, last_name, email, active |
| `users` | Modifiée | 8 nouveaux champs + matricule nullable |
| `access_requests` | Créée | 13 champs pour gérer les demandes |

### Fonctions Créées

| Fonction | Paramètres | Retour | Utilisée Pour |
|----------|-----------|--------|---------------|
| `verify_matricule` | p_matricule TEXT | BOOLEAN | Valider matricule à l'inscription |
| `approve_access_request` | request_id UUID | BOOLEAN | Approuver une demande |
| `reject_access_request` | request_id UUID, p_rejection_reason TEXT | BOOLEAN | Refuser une demande |
| `mark_access_request_as_viewed` | request_id UUID | BOOLEAN | Marquer une demande comme vue |
| `mark_all_access_requests_as_viewed` | - | BOOLEAN | Marquer toutes comme vues |
| `get_candidate_profile` | candidate_id | TABLE | Récupérer un profil |
| `update_candidate_profile` | candidate_id + champs | BOOLEAN | Mettre à jour un profil |

### Triggers Créés

| Trigger | Table | Événement | Fonction |
|---------|-------|-----------|----------|
| `on_auth_user_created` | auth.users | INSERT/UPDATE | handle_new_user |
| `log_access_request_trigger` | users | INSERT | log_access_request |
| `reset_viewed_on_new_request` | access_requests | INSERT | reset_viewed_on_new_request |
| `validate_candidate_email_trigger` | users | INSERT/UPDATE | validate_candidate_email |

---

## 🔧 Solution Rapide pour Prod

**Option 1 : Créer la Fonction Manuellement**

Va sur le SQL Editor de Supabase (PROD) et exécute :

```sql
-- Fonction de vérification matricule
CREATE OR REPLACE FUNCTION public.verify_matricule(p_matricule TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.seeg_agents 
    WHERE matricule = p_matricule 
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO authenticated;
```

**Option 2 : Appliquer la Migration 0**

Appliquer `20241201000000_create_verify_matricule.sql` en premier.

---

## ⚠️ Données de Test pour seeg_agents

Si tu veux tester rapidement, insère ces matricules de test :

```sql
INSERT INTO public.seeg_agents (matricule, first_name, last_name, email, active)
VALUES 
  ('2001', 'Test', 'Agent', 'test@seeg.com', TRUE),
  ('123456', 'Test', 'Agent2', 'test2@seeg.com', TRUE)
ON CONFLICT (matricule) DO NOTHING;
```

---

## 📝 Checklist Complète

- [ ] Migration 0 : `create_verify_matricule.sql` appliquée
- [ ] Table `seeg_agents` créée ou vérifiée
- [ ] Matricules réels insérés dans `seeg_agents`
- [ ] Fonction `verify_matricule` testée et fonctionnelle
- [ ] Migration 1 : `add_candidate_fields.sql` appliquée
- [ ] Migration 2 : `update_internal_candidate_status.sql` appliquée
- [ ] Migration 3 : `add_rejection_reason.sql` appliquée
- [ ] Migration 4 : `add_viewed_to_access_requests.sql` appliquée
- [ ] Migration 5 : `fix_approve_reject_functions.sql` appliquée

---

🎯 **Une fois la migration 0 appliquée, l'erreur 404 sur `verify_matricule` disparaîtra !**

