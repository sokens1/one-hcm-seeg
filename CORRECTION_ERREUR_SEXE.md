# Correction Erreur Contrainte `sexe`

## 🐛 Erreur Rencontrée

### Message d'Erreur
```
ERROR: new row for relation "users" violates check constraint "users_sexe_check" (SQLSTATE 23514)
```

### Contexte
Lors de l'inscription d'un candidat avec les données :
```json
{
  "sexe": "M",
  "first_name": "Arthur",
  "last_name": "CROWN",
  "email": "kevin@cnx4-0.com",
  // ...
}
```

---

## 🔍 Cause du Problème

### Problème 1 : Contrainte Existante
La colonne `sexe` **existait déjà** dans la table avec une contrainte CHECK différente ou incompatible.

### Problème 2 : Conflit de Contraintes
L'ajout d'une contrainte `CHECK` inline lors du `ADD COLUMN` peut créer un conflit si :
- La colonne existe déjà
- Une contrainte avec le même nom existe déjà
- Des données existantes ne respectent pas la nouvelle contrainte

---

## ✅ Solution Appliquée

### Étape 1 : Supprimer les Anciennes Contraintes
```sql
DO $$ 
BEGIN
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_sexe_check;
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_candidate_status_check;
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_statut_check;
EXCEPTION 
  WHEN undefined_object THEN NULL;
END $$;
```

### Étape 2 : Ajouter les Colonnes SANS Contraintes
```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS sexe VARCHAR(1),  -- Pas de CHECK ici
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS candidate_status VARCHAR(10),  -- Pas de CHECK ici
ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'actif';  -- Pas de CHECK ici
```

### Étape 3 : Ajouter les Contraintes Séparément
```sql
-- Contraintes qui acceptent NULL pour compatibilité avec données existantes
ALTER TABLE public.users
ADD CONSTRAINT users_sexe_check 
CHECK (sexe IS NULL OR sexe IN ('M', 'F'));

ALTER TABLE public.users
ADD CONSTRAINT users_candidate_status_check 
CHECK (candidate_status IS NULL OR candidate_status IN ('interne', 'externe'));

ALTER TABLE public.users
ADD CONSTRAINT users_statut_check 
CHECK (statut IS NULL OR statut IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé'));
```

**Clé :** Ajout de `sexe IS NULL OR` pour permettre les valeurs NULL (compatibilité avec données existantes).

---

## 🧪 Vérification

### Test 1 : Vérifier les Contraintes
```sql
SELECT 
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
  AND conname LIKE '%sexe%' OR conname LIKE '%candidate_status%' OR conname LIKE '%statut%';
```

**Résultat attendu :**
```
conname                          | definition
---------------------------------|--------------------------------------------
users_sexe_check                 | CHECK ((sexe IS NULL) OR (sexe IN ('M', 'F')))
users_candidate_status_check     | CHECK ((candidate_status IS NULL) OR ...)
users_statut_check               | CHECK ((statut IS NULL) OR ...)
```

### Test 2 : Tester l'Insertion
```sql
-- Ceci devrait RÉUSSIR maintenant
INSERT INTO public.users (
  id, email, first_name, last_name, role, sexe, candidate_status
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test',
  'User',
  'candidat',
  'M',  -- ✅ Devrait passer
  'externe'
);
```

### Test 3 : Tester avec NULL
```sql
-- Ceci devrait AUSSI réussir
INSERT INTO public.users (
  id, email, first_name, last_name, role, sexe
) VALUES (
  gen_random_uuid(),
  'test2@example.com',
  'Test2',
  'User2',
  'candidat',
  NULL  -- ✅ NULL autorisé
);
```

---

## 🔄 Migration Corrigée

### Ordre d'Exécution
1. ✅ Rendre `matricule` nullable
2. ✅ Ajouter les colonnes **sans contraintes inline**
3. ✅ Supprimer les contraintes existantes (si présentes)
4. ✅ Ajouter les nouvelles contraintes **séparément**
5. ✅ Créer les index
6. ✅ Créer/mettre à jour les triggers
7. ✅ Ajouter les fonctions helper

### Avantages de cette Approche
- ✅ **Idempotente** : Peut être exécutée plusieurs fois sans erreur
- ✅ **Sûre** : Gère les colonnes/contraintes existantes
- ✅ **Compatible** : Accepte NULL pour les anciennes données
- ✅ **Flexible** : Peut être rollbackée facilement

---

## 📋 Données Frontend → Supabase

### Envoyé par le Frontend
```json
{
  "email": "kevin@cnx4-0.com",
  "password": "12345678",
  "data": {
    "role": "candidat",
    "first_name": "Arthur",
    "last_name": "CROWN",
    "phone": "+241 08 78 85 46",
    "matricule": null,
    "date_of_birth": "2025-10-10",
    "sexe": "M",  // ← VARCHAR(1) valide
    "adresse": "OWENDO",
    "candidate_status": "externe",
    "no_seeg_email": false
  }
}
```

### Stocké dans `auth.users`
```
raw_user_meta_data = {
  "role": "candidat",
  "first_name": "Arthur",
  "sexe": "M",
  ...
}
```

### Copié vers `public.users` (via trigger)
```sql
INSERT INTO public.users (
  id, email, role, first_name, ..., sexe, ...
) VALUES (
  '...', 'kevin@cnx4-0.com', 'candidat', 'Arthur', ..., 'M', ...
);
```

### Validation de la Contrainte
```sql
CHECK (sexe IS NULL OR sexe IN ('M', 'F'))
-- 'M' ∈ {'M', 'F'} ✅ PASSE
```

---

## ⚠️ Si l'Erreur Persiste

### Cause Possible : Données Existantes Invalides
Si la table contient déjà des données avec `sexe` différent de 'M' ou 'F' :

```sql
-- Vérifier les données existantes
SELECT DISTINCT sexe FROM public.users WHERE sexe IS NOT NULL;
```

**Si vous voyez d'autres valeurs** (ex: 'Homme', 'Femme', 'H', 'F', etc.) :

```sql
-- Nettoyer les données AVANT d'ajouter la contrainte
UPDATE public.users 
SET sexe = CASE 
  WHEN sexe IN ('Homme', 'H', 'M', 'm') THEN 'M'
  WHEN sexe IN ('Femme', 'F', 'f') THEN 'F'
  ELSE NULL
END
WHERE sexe IS NOT NULL;

-- Puis réappliquer la migration
```

### Cause Possible 2 : Conflit de Nom de Contrainte
Si une contrainte `users_sexe_check` existe déjà avec une autre définition :

```sql
-- Vérifier les contraintes existantes
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- Supprimer manuellement si conflit
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_sexe_check CASCADE;
```

---

## 🚀 Réappliquer la Migration

### Option 1 : Via Dashboard
1. Supprimer l'ancienne migration (si appliquée partiellement)
2. Appliquer la nouvelle version corrigée

### Option 2 : Script de Nettoyage
```sql
-- Script de nettoyage complet
BEGIN;

-- 1. Supprimer toutes les contraintes potentiellement problématiques
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_sexe_check CASCADE;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_candidate_status_check CASCADE;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_statut_check CASCADE;

-- 2. Nettoyer les données existantes si nécessaire
UPDATE public.users 
SET sexe = CASE 
  WHEN UPPER(sexe) = 'M' OR sexe IN ('Homme', 'H') THEN 'M'
  WHEN UPPER(sexe) = 'F' OR sexe IN ('Femme') THEN 'F'
  ELSE NULL
END
WHERE sexe IS NOT NULL AND sexe NOT IN ('M', 'F');

-- 3. Appliquer la migration complète
-- (Copier-coller le contenu de 20250110000000_add_candidate_fields.sql)

COMMIT;
```

---

## ✅ Checklist Post-Migration

- [ ] Migration appliquée sans erreur
- [ ] Colonnes créées : `date_of_birth`, `sexe`, `adresse`, etc.
- [ ] Contraintes actives : `users_sexe_check`, etc.
- [ ] Trigger `handle_new_user` mis à jour
- [ ] Test d'inscription réussi (interne et externe)
- [ ] Données correctement stockées dans `public.users`
- [ ] Pas d'erreur dans les logs Supabase

---

## 🎯 Test Final

Après avoir réappliqué la migration :

```bash
# Frontend
1. Redémarrer : npm run dev
2. Tester inscription externe
3. Tester inscription interne
4. Vérifier dans Supabase Table Editor
```

**La migration devrait maintenant passer sans erreur !** 🚀✨
