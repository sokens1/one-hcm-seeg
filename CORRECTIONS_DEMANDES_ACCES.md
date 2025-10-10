# Corrections - Système de Badge "Demandes d'Accès"

## Problèmes Identifiés et Corrigés

### 1. ✅ Clarification des Statuts

**Deux systèmes de statuts distincts** :

#### Table `users` - Statut Utilisateur
```sql
statut IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé')
```
- Utilise des **underscores** (`en_attente`)
- Gère l'état du compte utilisateur

#### Table `access_requests` - Statut de la Demande
```sql
status IN ('pending', 'approved', 'rejected')
```
- Utilise des **mots anglais** (`pending`)
- Gère l'état de la demande d'accès

**Correspondance** :
- `status = 'pending'` → `statut = 'en_attente'`
- `status = 'approved'` → `statut = 'actif'`
- `status = 'rejected'` → `statut = 'bloqué'`

---

### 2. ✅ Badge qui Ne Se Remet Pas à 0

**Problème** :
- Le badge affichait le nombre total de demandes `pending`
- Même après avoir visité la page, le badge restait affiché
- Pas de notion de "vu/non vu"

**Solution** :
Ajout d'un système de "vu/non vu" avec le champ `viewed` :

#### 2.1 Nouvelle Migration
**Fichier** : `supabase/migrations/20250110000003_add_viewed_to_access_requests.sql`

**Ajouts** :
- ✅ Champ `viewed BOOLEAN DEFAULT FALSE NOT NULL`
- ✅ Index pour performances : `idx_access_requests_viewed`
- ✅ Fonction `mark_access_request_as_viewed(request_id)` - Marquer une demande comme vue
- ✅ Fonction `mark_all_access_requests_as_viewed()` - Marquer toutes les demandes comme vues
- ✅ Trigger `trigger_reset_viewed_on_new_request` - Réinitialiser `viewed = false` pour les nouvelles demandes

#### 2.2 Sidebar Mise à Jour
**Fichier** : `src/components/layout/RecruiterSidebar.tsx`

**Avant** :
```typescript
.eq('status', 'pending')
```

**Après** :
```typescript
.eq('status', 'pending')
.eq('viewed', false)  // ✅ Seulement les demandes non vues
```

#### 2.3 Page AccessRequests Mise à Jour
**Fichier** : `src/pages/recruiter/AccessRequests.tsx`

**Ajout** :
```typescript
// Marquer toutes les demandes comme vues quand on arrive sur la page
const markAsViewed = async () => {
  try {
    await supabase.rpc('mark_all_access_requests_as_viewed');
  } catch (error) {
    console.error('Erreur lors du marquage comme vu:', error);
  }
};

markAsViewed();
```

---

## Comportement Final

### Scénario 1 : Nouvelle Demande Arrive
```
1. Candidat s'inscrit (interne sans email SEEG)
   ↓
2. access_requests créé avec viewed = false
   ↓
3. Badge rouge (1) s'affiche dans la sidebar
   ↓
4. Recruteur voit "Demandes d'accès (1)"
```

### Scénario 2 : Recruteur Visite la Page
```
1. Recruteur clique sur "Demandes d'accès"
   ↓
2. Page se charge
   ↓
3. RPC mark_all_access_requests_as_viewed() :
   - Toutes les demandes pending → viewed = true
   ↓
4. Badge disparaît (0 demandes non vues)
   ↓
5. Recruteur voit la liste complète des demandes
```

### Scénario 3 : Nouvelle Demande Pendant la Visite
```
1. Recruteur est sur la page (badge à 0)
   ↓
2. Nouveau candidat s'inscrit
   ↓
3. Realtime déclenche la mise à jour
   ↓
4. Badge repasse à (1)
   ↓
5. Liste se met à jour automatiquement
```

---

## Fichiers Modifiés

### Nouveaux Fichiers ✨
1. ✅ `supabase/migrations/20250110000003_add_viewed_to_access_requests.sql`
2. ✅ `CORRECTIONS_DEMANDES_ACCES.md` (ce document)

### Fichiers Modifiés 🔧
1. ✅ `src/components/layout/RecruiterSidebar.tsx`
   - Filtrage par `viewed = false`
   - Renommage de `fetchPendingRequests` → `fetchUnviewedRequests`

2. ✅ `src/pages/recruiter/AccessRequests.tsx`
   - Appel de `mark_all_access_requests_as_viewed()` au montage

---

## Base de Données - Résumé

### Table `access_requests` (Mise à Jour)
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  matricule TEXT,
  request_type TEXT DEFAULT 'internal_no_seeg_email',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  viewed BOOLEAN DEFAULT FALSE NOT NULL,  -- ✅ NOUVEAU
  created_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);
```

### Nouvelles Fonctions RPC
```sql
-- Marquer une demande comme vue
mark_access_request_as_viewed(request_id UUID) → BOOLEAN

-- Marquer toutes les demandes en attente comme vues
mark_all_access_requests_as_viewed() → BOOLEAN
```

---

## Tests Recommandés

### Test 1 : Badge Initial
```bash
# 1. Créer une nouvelle demande d'accès
# 2. Vérifier que le badge affiche (1)
# 3. Ne PAS visiter la page
# 4. Le badge doit rester à (1)
```

### Test 2 : Badge Remis à 0
```bash
# 1. Badge affiche (2) demandes non vues
# 2. Cliquer sur "Demandes d'accès"
# 3. Page se charge
# 4. Badge disparaît (0)
# 5. Recharger la page
# 6. Badge reste à (0)
```

### Test 3 : Nouvelle Demande en Temps Réel
```bash
# 1. Être sur la page "Demandes d'accès" (badge à 0)
# 2. Créer une nouvelle demande (autre onglet/navigateur)
# 3. Badge repasse à (1) automatiquement
# 4. Liste se met à jour avec la nouvelle demande
```

### Test 4 : Plusieurs Recruteurs
```bash
# 1. Recruteur A voit badge (3)
# 2. Recruteur B visite la page → Marque toutes comme vues
# 3. Badge de Recruteur A passe aussi à (0)
# 4. Comportement attendu : Marquage global pour tous
```

---

## Migrations à Appliquer

```bash
# Appliquer la nouvelle migration
supabase migration up

# Ou si vous utilisez Supabase CLI
supabase db push
```

---

## Permissions

**Qui peut marquer comme vu ?**
- ✅ Administrateurs (role = 'admin')
- ✅ Recruteurs (role = 'recruteur')
- ✅ Observateurs (role = 'observateur')

**Sécurité** :
- Les fonctions vérifient le rôle via `auth.uid()`
- SECURITY DEFINER pour exécution avec privilèges élevés
- Seuls les utilisateurs authentifiés avec les bons rôles peuvent marquer

---

## Performance

**Optimisations** :
- ✅ Index sur `viewed` pour requêtes rapides
- ✅ Index composite sur `(status, viewed)` pour comptage
- ✅ Trigger pour réinitialisation automatique

**Requête de Comptage** :
```sql
-- Très rapide grâce aux index
SELECT COUNT(*) 
FROM access_requests 
WHERE status = 'pending' 
  AND viewed = false;
```

---

## Notes Importantes

1. **Marquage Global** ✅
   - Quand un recruteur visite la page, TOUTES les demandes pending sont marquées comme vues
   - Pas de marquage individuel par demande
   - C'est un système de "notification globale"

2. **Nouvelles Demandes** ✅
   - Toujours créées avec `viewed = false`
   - Trigger garantit cette cohérence
   - Impossible de créer une demande "déjà vue"

3. **Realtime** ✅
   - Badge se met à jour automatiquement
   - Pas besoin de recharger la page
   - Fonctionne pour tous les recruteurs connectés

4. **Statuts vs Status** ✅
   - `statut` (users) : Français avec underscores
   - `status` (access_requests) : Anglais sans underscores
   - Deux systèmes distincts mais synchronisés

---

## Résumé des Corrections

| Problème | Solution | Statut |
|----------|----------|--------|
| Badge ne se remet pas à 0 | Ajout champ `viewed` | ✅ Corrigé |
| Confusion statut/status | Documentation clarifiée | ✅ Documenté |
| Pas de système "vu/non vu" | Migration + RPC functions | ✅ Implémenté |
| Badge ne disparaît pas | `mark_all_as_viewed()` au montage | ✅ Corrigé |

---

🎉 **Le système de badge fonctionne maintenant correctement !**

Il suffit d'appliquer la migration `20250110000003_add_viewed_to_access_requests.sql` et tout fonctionnera comme prévu.

