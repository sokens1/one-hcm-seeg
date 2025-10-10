# Résumé des Modifications de la Migration

## ✅ Modifications Apportées

### 1. **Matricule Rendu Optionnel**
```sql
ALTER TABLE public.users
ALTER COLUMN matricule DROP NOT NULL;
```

**Pourquoi ?**
- Les candidats externes n'ont pas de matricule SEEG
- Seuls les candidats internes doivent fournir un matricule

---

### 2. **Nouveau Champ : `statut`**

**Définition :**
```sql
statut VARCHAR(20) DEFAULT 'actif' 
CHECK (statut IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé'))
```

**Valeurs Possibles :**
- `actif` - Compte actif (par défaut)
- `inactif` - Compte désactivé temporairement
- `en_attente` - En attente de validation
- `bloqué` - Compte bloqué (violation de règles)
- `archivé` - Compte archivé (historique)

**Utilisation :**
- Gérer l'état des comptes utilisateurs
- Filtrer les candidats actifs/inactifs
- Tracer l'historique des comptes

---

## 📊 Structure Complète de la Table `users`

### Colonnes Existantes (modifiées)
| Colonne | Type | Contrainte | Modification |
|---------|------|------------|--------------|
| `matricule` | TEXT | **NULL autorisé** | ✅ Rendu optionnel |

### Nouvelles Colonnes
| Colonne | Type | Contrainte | Défaut | Description |
|---------|------|------------|--------|-------------|
| `date_of_birth` | DATE | - | - | Date de naissance |
| `sexe` | VARCHAR(1) | IN ('M', 'F') | - | Sexe |
| `adresse` | TEXT | - | - | Adresse complète |
| `candidate_status` | VARCHAR(10) | IN ('interne', 'externe') | - | Type de candidature |
| `statut` | VARCHAR(20) | IN ('actif', 'inactif', ...) | 'actif' | **Statut du compte** |
| `poste_actuel` | TEXT | - | - | Poste actuel |
| `annees_experience` | INTEGER | - | - | Années d'expérience |
| `no_seeg_email` | BOOLEAN | - | FALSE | Pas d'email SEEG |

---

## 🔧 Index Créés

```sql
-- Performance
CREATE INDEX idx_users_candidate_status ON public.users(candidate_status);
CREATE INDEX idx_users_statut ON public.users(statut); -- ✅ Nouveau
CREATE INDEX idx_users_matricule ON public.users(matricule) WHERE matricule IS NOT NULL;
```

---

## 🔄 Trigger Mis à Jour

Le trigger `handle_new_user` a été mis à jour pour gérer :
- ✅ Le champ `statut` (par défaut : 'actif')
- ✅ Le matricule optionnel
- ✅ Tous les autres nouveaux champs

**Lors de l'inscription :**
```sql
INSERT INTO public.users (
  ...,
  candidate_status,
  statut,  -- ✅ Nouveau
  matricule,  -- ✅ Optionnel
  ...
) VALUES (
  ...,
  NEW.raw_user_meta_data->>'candidate_status',
  COALESCE(NEW.raw_user_meta_data->>'statut', 'actif'),  -- ✅ Par défaut 'actif'
  NEW.raw_user_meta_data->>'matricule',  -- ✅ Peut être NULL
  ...
);
```

---

## 📈 Vue Statistiques Mise à Jour

```sql
CREATE OR REPLACE VIEW public.candidate_statistics AS
SELECT 
  candidate_status,
  statut,  -- ✅ Nouveau
  sexe,
  COUNT(*) as count,
  AVG(annees_experience) as avg_experience
FROM public.users
WHERE role = 'candidat'
GROUP BY candidate_status, statut, sexe;
```

**Requête exemple :**
```sql
-- Voir les candidats actifs par type
SELECT candidate_status, statut, count 
FROM candidate_statistics 
WHERE statut = 'actif';
```

---

## 🛠️ Fonctions Helper Mises à Jour

### `get_candidate_profile(uuid)`
Retourne maintenant le champ `statut` :
```sql
SELECT * FROM get_candidate_profile('user-id');

-- Résultat inclut:
-- - statut: 'actif'
-- - matricule: '1234' ou NULL
-- - ... tous les autres champs
```

### `update_candidate_profile(...)`
Permet maintenant de mettre à jour le statut :
```sql
-- Seuls les admins/recruteurs peuvent changer le statut
SELECT update_candidate_profile(
  'user-id'::UUID,
  p_statut := 'inactif'
);
```

**Permissions :**
- Les candidats peuvent modifier leur profil **sauf le statut**
- Les admins/recruteurs peuvent tout modifier **y compris le statut**

---

## 🎯 Cas d'Usage du Champ `statut`

### 1. Désactiver un Compte
```sql
UPDATE users 
SET statut = 'inactif' 
WHERE id = 'user-id';
```

### 2. Bloquer un Candidat
```sql
UPDATE users 
SET statut = 'bloqué' 
WHERE id = 'user-id';
```

### 3. Archiver les Anciens Comptes
```sql
UPDATE users 
SET statut = 'archivé' 
WHERE created_at < NOW() - INTERVAL '2 years'
  AND statut = 'inactif';
```

### 4. Filtrer les Candidats Actifs
```sql
SELECT * FROM users 
WHERE role = 'candidat' 
  AND statut = 'actif';
```

### 5. Mettre en Attente Après Inscription
```sql
-- Si validation manuelle requise
UPDATE users 
SET statut = 'en_attente' 
WHERE id = 'new-user-id';
```

---

## 📋 Checklist de Vérification

### Après Application de la Migration

- [ ] Colonne `matricule` est nullable
```sql
SELECT is_nullable FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'matricule';
-- Résultat attendu: YES
```

- [ ] Colonne `statut` existe avec contrainte CHECK
```sql
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'statut';
-- Résultat attendu: statut | 'actif'::character varying
```

- [ ] Index créé sur `statut`
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'users' AND indexname = 'idx_users_statut';
```

- [ ] Trigger fonctionne avec le nouveau champ
```sql
-- Tester inscription
INSERT INTO auth.users (id, email, raw_user_meta_data) 
VALUES (gen_random_uuid(), 'test@seeg.com', '{"candidate_status": "interne"}'::jsonb);

-- Vérifier dans public.users
SELECT statut FROM users WHERE email = 'test@seeg.com';
-- Résultat attendu: 'actif'
```

---

## 🔄 Mapping Frontend → Backend

### Données d'Inscription
```typescript
// Frontend
{
  candidateStatus: "interne",
  matricule: "1234",  // Optionnel pour externes
  // ... autres champs
}

// Supabase metadata
{
  candidate_status: "interne",
  matricule: "1234",
  statut: "actif"  // Automatique par défaut
}

// Table users
{
  candidate_status: "interne",
  matricule: "1234",
  statut: "actif"
}
```

### Candidat Externe (sans matricule)
```typescript
// Frontend
{
  candidateStatus: "externe",
  matricule: "",  // Vide
  // ...
}

// Table users
{
  candidate_status: "externe",
  matricule: NULL,  // ✅ Accepté
  statut: "actif"
}
```

---

## ⚠️ Points d'Attention

### 1. Matricule Optionnel
- ✅ Pas obligatoire pour les externes
- ⚠️ Obligatoire pour les internes (validation frontend)
- ⚠️ Vérification toujours active via `verify_matricule` RPC

### 2. Statut par Défaut
- ✅ Tous les nouveaux comptes : `statut = 'actif'`
- ⚠️ Si besoin de validation manuelle, changer en `'en_attente'` après inscription

### 3. Modification du Statut
- ✅ Admins/recruteurs : peuvent modifier
- ❌ Candidats : ne peuvent PAS modifier leur propre statut

### 4. Contraintes
```sql
-- Valeurs autorisées pour statut
CHECK (statut IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé'))

-- Si vous essayez une valeur non autorisée:
UPDATE users SET statut = 'autre';
-- Erreur: new row for relation "users" violates check constraint
```

---

## 🚀 Prochaines Étapes

1. **Appliquer la migration** via Supabase Dashboard
2. **Tester** avec un utilisateur test (interne et externe)
3. **Vérifier** que le matricule est bien optionnel
4. **Vérifier** que le statut est bien 'actif' par défaut
5. **Mettre à jour** le frontend si nécessaire (affichage du statut)
6. **Documenter** les workflows de gestion des statuts

---

## ✅ Résumé des Avantages

| Fonctionnalité | Avant | Après |
|----------------|-------|-------|
| Matricule | Obligatoire | ✅ Optionnel |
| Gestion des comptes | Basique | ✅ Avec statut |
| Filtrage | Limité | ✅ Par statut |
| Administration | Basique | ✅ Désactivation/blocage |
| Historique | Non | ✅ Archivage possible |

**La migration est maintenant complète avec matricule optionnel et champ statut !** 🎯✨
