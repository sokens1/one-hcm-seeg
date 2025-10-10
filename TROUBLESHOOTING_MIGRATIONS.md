# Guide de Dépannage - Migrations Supabase

## Erreurs Communes et Solutions

### ❌ Erreur : "relation 'public.email_notifications' does not exist"

**Quand** : Lors de l'approbation d'une demande d'accès

**Cause** : La fonction `approve_access_request` essaie d'insérer dans une table qui n'existe pas

**Solution** : Appliquer la migration `20250110000004_fix_approve_reject_functions.sql`

```sql
-- Dans le SQL Editor de Supabase
-- Copier-coller le contenu de:
supabase/migrations/20250110000004_fix_approve_reject_functions.sql
```

---

### ❌ Erreur : "column 'viewed' does not exist" (400 Bad Request)

**Quand** : Au chargement de la page ou dans la sidebar

**Cause** : Le champ `viewed` n'a pas encore été ajouté à la table `access_requests`

**Solution** : Appliquer la migration `20250110000003_add_viewed_to_access_requests.sql`

---

### ❌ Erreur : "function 'mark_all_access_requests_as_viewed' does not exist" (404)

**Quand** : Au chargement de la page des demandes d'accès

**Cause** : La fonction RPC n'a pas encore été créée

**Solution** : Appliquer la migration `20250110000003_add_viewed_to_access_requests.sql`

---

### ❌ Erreur : "Could not embed because more than one relationship" (300)

**Quand** : Au chargement de la liste des demandes

**Cause** : Ambiguïté entre `user_id` et `reviewed_by` dans la relation avec `users`

**Solution** : ✅ Déjà corrigé dans le code avec `users!access_requests_user_id_fkey`

---

### ❌ Erreur : "column 'rejection_reason' does not exist"

**Quand** : Lors du rejet d'une demande

**Cause** : Le champ `rejection_reason` n'existe pas encore

**Solution** : Appliquer la migration `20250110000002_add_rejection_reason.sql`

---

## Ordre d'Application des Migrations

**IMPORTANT** : Appliquer dans cet ordre exact :

1. ✅ `20250110000002_add_rejection_reason.sql`
2. ✅ `20250110000003_add_viewed_to_access_requests.sql`
3. ✅ `20250110000004_fix_approve_reject_functions.sql`

---

## Comment Appliquer une Migration ?

### Via le Dashboard Supabase (Recommandé)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner ton projet
3. Cliquer sur **SQL Editor** dans la sidebar
4. Créer une **nouvelle query**
5. Copier le contenu du fichier de migration
6. Coller dans l'éditeur
7. Cliquer sur **Run** (ou `Ctrl+Enter`)
8. Vérifier qu'il n'y a pas d'erreur ✅

---

## Vérifications Après Migration

### Vérifier que les Champs Existent

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'access_requests'
  AND column_name IN ('rejection_reason', 'viewed')
ORDER BY column_name;
```

**Résultat attendu** :
```
column_name       | data_type | is_nullable
------------------+-----------+-------------
rejection_reason  | text      | YES
viewed            | boolean   | NO
```

---

### Vérifier que les Fonctions Existent

```sql
SELECT 
  proname AS function_name,
  pg_get_function_identity_arguments(oid) AS arguments
FROM pg_proc 
WHERE proname IN (
  'approve_access_request',
  'reject_access_request',
  'mark_all_access_requests_as_viewed',
  'mark_access_request_as_viewed'
)
ORDER BY proname;
```

**Résultat attendu** :
```
function_name                        | arguments
-------------------------------------+------------------
approve_access_request               | request_id uuid
mark_access_request_as_viewed        | request_id uuid
mark_all_access_requests_as_viewed   | 
reject_access_request                | request_id uuid, p_rejection_reason text
```

---

### Vérifier que les Triggers Existent

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'access_requests';
```

**Résultat attendu** :
```
trigger_name                           | event_manipulation | event_object_table
---------------------------------------+--------------------+--------------------
log_access_request                     | INSERT            | access_requests
trigger_reset_viewed_on_new_request    | INSERT            | access_requests
```

---

## Tests Post-Migration

### Test 1 : Badge Fonctionne
```
1. Recharger la page
2. Badge doit afficher le nombre correct
3. Pas d'erreur 400 dans la console
```

### Test 2 : Approuver une Demande
```
1. Aller sur "Demandes d'accès"
2. Cliquer sur "Approuver"
3. Pas d'erreur "email_notifications"
4. Email envoyé ✅
5. Statut utilisateur = 'actif' ✅
```

### Test 3 : Rejeter une Demande
```
1. Cliquer sur "Refuser"
2. Saisir le motif (20+ caractères)
3. Confirmer
4. Pas d'erreur
5. Email avec motif envoyé ✅
6. Statut utilisateur = 'bloqué' ✅
```

### Test 4 : Badge Se Remet à 0
```
1. Badge affiche (N)
2. Visiter la page "Demandes d'accès"
3. Badge passe à (0) ✅
4. Nouvelle demande arrive
5. Badge repasse à (1) ✅
```

---

## Rollback (Annuler les Migrations)

Si tu veux revenir en arrière :

```sql
-- Supprimer les fonctions
DROP FUNCTION IF EXISTS mark_all_access_requests_as_viewed();
DROP FUNCTION IF EXISTS mark_access_request_as_viewed(UUID);
DROP FUNCTION IF EXISTS reset_viewed_on_new_request();
DROP FUNCTION IF EXISTS approve_access_request(UUID);
DROP FUNCTION IF EXISTS reject_access_request(UUID, TEXT);

-- Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_reset_viewed_on_new_request ON access_requests;
DROP TRIGGER IF EXISTS log_access_request ON access_requests;

-- Supprimer les champs
ALTER TABLE access_requests DROP COLUMN IF EXISTS viewed;
ALTER TABLE access_requests DROP COLUMN IF EXISTS rejection_reason;
```

---

## Statut des Migrations

| Migration | Fichier | Statut | Description |
|-----------|---------|--------|-------------|
| 1 | `20250110000001_update_internal_candidate_status.sql` | ✅ Appliquée | Base de données initiale |
| 2 | `20250110000002_add_rejection_reason.sql` | ⏳ À appliquer | Ajoute `rejection_reason` |
| 3 | `20250110000003_add_viewed_to_access_requests.sql` | ⏳ À appliquer | Ajoute système "vu/non vu" |
| 4 | `20250110000004_fix_approve_reject_functions.sql` | ⏳ À appliquer | Corrige fonctions approve/reject |

---

## Erreurs Supabase Communes

### "permission denied for table access_requests"
**Solution** : Vérifier les RLS policies et permissions

### "syntax error at or near..."
**Solution** : Vérifier que tu as copié TOUT le fichier, du début à la fin

### "duplicate key value violates unique constraint"
**Solution** : Normal si tu réexécutes une migration, ignorer ou utiliser `IF NOT EXISTS`

---

## Contact Support

Si les problèmes persistent :

1. Vérifier les logs Supabase (Dashboard → Logs)
2. Vérifier la version PostgreSQL (doit être >= 14)
3. Vérifier les permissions de l'utilisateur
4. Copier l'erreur exacte et chercher dans la doc Supabase

---

🎯 **Une fois toutes les migrations appliquées, tout fonctionnera parfaitement !**

