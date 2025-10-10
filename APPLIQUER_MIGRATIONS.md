# Comment Appliquer les Migrations Supabase

## Erreurs Actuelles (Avant Migration)

Tu vois ces erreurs car les migrations ne sont pas encore appliquées :
- ❌ **400 Bad Request** : Le champ `viewed` n'existe pas encore
- ❌ **404 Not Found** : La fonction `mark_all_access_requests_as_viewed` n'existe pas
- ❌ **300 Multiple Choices** : Ambiguïté dans la relation `users` (CORRIGÉ dans le code)

## Migrations à Appliquer

### Migration 1 : `20250110000002_add_rejection_reason.sql`
Ajoute le champ `rejection_reason` à la table `access_requests`

### Migration 2 : `20250110000003_add_viewed_to_access_requests.sql`
Ajoute le système "vu/non vu" avec le champ `viewed`

---

## Méthode 1 : Via le Dashboard Supabase (Recommandé)

### Étape 1 : Accéder au SQL Editor
1. Aller sur https://supabase.com/dashboard
2. Sélectionner ton projet
3. Cliquer sur "SQL Editor" dans la sidebar

### Étape 2 : Appliquer Migration 1
1. Créer une nouvelle query
2. Copier **tout le contenu** de `supabase/migrations/20250110000002_add_rejection_reason.sql`
3. Coller dans l'éditeur
4. Cliquer sur "Run" (ou `Ctrl+Enter`)
5. Vérifier qu'il n'y a pas d'erreur

### Étape 3 : Appliquer Migration 2
1. Créer une nouvelle query
2. Copier **tout le contenu** de `supabase/migrations/20250110000003_add_viewed_to_access_requests.sql`
3. Coller dans l'éditeur
4. Cliquer sur "Run"
5. Vérifier qu'il n'y a pas d'erreur

### Étape 4 : Vérifier
```sql
-- Vérifier que le champ 'viewed' existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'access_requests' 
  AND column_name IN ('rejection_reason', 'viewed');

-- Vérifier que les fonctions existent
SELECT proname 
FROM pg_proc 
WHERE proname IN (
  'mark_all_access_requests_as_viewed', 
  'mark_access_request_as_viewed'
);
```

---

## Méthode 2 : Via Supabase CLI (Si installé)

```bash
# Depuis le répertoire du projet
cd c:\Users\hp\Desktop\CNX\Application\one-hcm-seeg

# Lier le projet (si pas déjà fait)
supabase link --project-ref fyiitzndlqcnyluwkpqp

# Appliquer toutes les migrations
supabase db push

# Ou appliquer manuellement
supabase db execute --file supabase/migrations/20250110000002_add_rejection_reason.sql
supabase db execute --file supabase/migrations/20250110000003_add_viewed_to_access_requests.sql
```

---

## Après l'Application des Migrations

### ✅ Comportement Attendu

1. **Badge "Demandes d'accès"**
   - Affiche le nombre de demandes non vues
   - Se remet à 0 quand tu visites la page
   - Remonte quand une nouvelle demande arrive

2. **Page AccessRequests**
   - Charge sans erreur
   - Affiche toutes les demandes avec leurs informations
   - Permet d'approuver/rejeter

3. **Console**
   - Plus d'erreurs 400 ou 404
   - Message : "Migration 20250110000003 pas encore appliquée" disparaît

---

## Vérification Rapide

Après les migrations, recharge la page et vérifie :

```bash
# Dans la console du navigateur, tu devrais voir :
✅ Pas d'erreur 400 sur 'viewed'
✅ Pas d'erreur 404 sur 'mark_all_access_requests_as_viewed'
✅ Page se charge correctement
✅ Badge fonctionne
```

---

## Contenu des Migrations

### Migration 2 : `20250110000002_add_rejection_reason.sql`
```sql
-- Ajoute le champ rejection_reason
ALTER TABLE access_requests ADD COLUMN rejection_reason TEXT;

-- Met à jour la fonction reject_access_request
CREATE OR REPLACE FUNCTION reject_access_request(
  request_id UUID, 
  p_rejection_reason TEXT
)...
```

### Migration 3 : `20250110000003_add_viewed_to_access_requests.sql`
```sql
-- Ajoute le champ viewed
ALTER TABLE access_requests ADD COLUMN viewed BOOLEAN DEFAULT FALSE;

-- Crée les fonctions
- mark_access_request_as_viewed(request_id)
- mark_all_access_requests_as_viewed()

-- Crée un trigger pour réinitialiser viewed sur les nouvelles demandes
```

---

## Rollback (Si Problème)

Si tu veux annuler les migrations :

```sql
-- Retirer le champ rejection_reason
ALTER TABLE access_requests DROP COLUMN IF EXISTS rejection_reason;

-- Retirer le champ viewed
ALTER TABLE access_requests DROP COLUMN IF EXISTS viewed;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS mark_all_access_requests_as_viewed();
DROP FUNCTION IF EXISTS mark_access_request_as_viewed(UUID);
DROP FUNCTION IF EXISTS reset_viewed_on_new_request();

-- Supprimer le trigger
DROP TRIGGER IF EXISTS trigger_reset_viewed_on_new_request ON access_requests;
```

---

## Code Compatible Avant/Après Migration

Le code a été mis à jour pour fonctionner dans les deux cas :

- ✅ **Avant migration** : Badge affiche toutes les demandes `pending`
- ✅ **Après migration** : Badge affiche seulement les demandes non vues

Pas besoin de changer le code après la migration ! Tout fonctionnera automatiquement.

---

## Notes Importantes

1. **Ordre des Migrations** ⚠️
   - Appliquer d'abord `20250110000002_add_rejection_reason.sql`
   - Puis `20250110000003_add_viewed_to_access_requests.sql`

2. **Idempotence** ✅
   - Les migrations utilisent `IF NOT EXISTS`
   - Tu peux les réexécuter sans problème

3. **Données Existantes** ✅
   - Les demandes existantes seront marquées `viewed = TRUE` par défaut
   - Seules les nouvelles demandes seront `viewed = FALSE`

4. **Permissions** ✅
   - Les fonctions vérifient le rôle (admin/recruteur/observateur)
   - RLS policies restent inchangées

---

## Aide

Si tu rencontres des problèmes :

1. **Erreur de syntaxe** : Vérifie que tu as copié tout le fichier
2. **Permission denied** : Tu dois être admin du projet Supabase
3. **Fonction existe déjà** : Normal, tu peux ignorer ou utiliser `OR REPLACE`

---

🎯 **Une fois les migrations appliquées, tout fonctionnera parfaitement !**

