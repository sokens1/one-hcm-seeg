# Guide de Migration Supabase

## 📋 Vue d'Ensemble

Cette migration ajoute tous les champs nécessaires pour supporter l'inscription complète des candidats avec :
- Type de candidature (interne/externe)
- Informations personnelles complètes
- Validation des emails SEEG pour les internes
- Fonctions helper pour la gestion des profils

---

## 🗂️ Fichier de Migration

**Fichier :** `supabase/migrations/20250110000000_add_candidate_fields.sql`

---

## 🔧 Modifications Apportées

### 1. **Nouvelles Colonnes dans `users`**

| Colonne | Type | Description | Contrainte |
|---------|------|-------------|------------|
| `date_of_birth` | DATE | Date de naissance | - |
| `sexe` | VARCHAR(1) | Sexe (M ou F) | CHECK IN ('M', 'F') |
| `adresse` | TEXT | Adresse complète | - |
| `candidate_status` | VARCHAR(10) | interne ou externe | CHECK IN ('interne', 'externe') |
| `poste_actuel` | TEXT | Poste actuel | - |
| `annees_experience` | INTEGER | Années d'expérience | - |
| `no_seeg_email` | BOOLEAN | Pas d'email SEEG | DEFAULT FALSE |

### 2. **Index pour Performance**
- Index sur `candidate_status`
- Index sur `matricule`

### 3. **Trigger `handle_new_user`**
Mis à jour pour gérer automatiquement tous les nouveaux champs lors de l'inscription.

### 4. **Validation Email SEEG**
Fonction `validate_candidate_email()` qui vérifie :
- Si `candidate_status = 'interne'`
- ET `no_seeg_email = false`
- ALORS email doit finir par `@seeg.com`

### 5. **Politiques RLS (Row Level Security)**
- Les utilisateurs peuvent voir leur propre profil
- Les utilisateurs peuvent modifier leur propre profil
- Les admins/recruteurs peuvent voir tous les profils

### 6. **Fonctions Helper**
- `get_candidate_profile(uuid)` : Récupérer un profil complet
- `update_candidate_profile(...)` : Mettre à jour un profil
- Vue `candidate_statistics` : Statistiques des candidats

---

## 🚀 Application de la Migration

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Accéder à Supabase Dashboard**
   ```
   https://app.supabase.com/project/[votre-projet-id]
   ```

2. **Aller dans SQL Editor**
   - Menu latéral : `SQL Editor`
   - Cliquer sur `+ New query`

3. **Copier-Coller la Migration**
   - Ouvrir `supabase/migrations/20250110000000_add_candidate_fields.sql`
   - Copier tout le contenu
   - Coller dans l'éditeur SQL

4. **Exécuter**
   - Cliquer sur `Run` ou `Ctrl + Enter`
   - Vérifier qu'il n'y a pas d'erreurs

5. **Vérifier**
   - Aller dans `Table Editor` > `users`
   - Vérifier que les nouvelles colonnes sont présentes

### Option 2 : Via Supabase CLI

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# 2. Se connecter à Supabase
supabase login

# 3. Lier au projet
supabase link --project-ref [votre-projet-ref]

# 4. Appliquer la migration
supabase db push

# 5. Vérifier
supabase db diff
```

### Option 3 : Via Script Node.js

```javascript
// apply-migration.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Clé service role !

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = fs.readFileSync(
  './supabase/migrations/20250110000000_add_candidate_fields.sql', 
  'utf8'
);

(async () => {
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  
  if (error) {
    console.error('❌ Erreur migration:', error);
  } else {
    console.log('✅ Migration appliquée avec succès');
  }
})();
```

---

## ✅ Vérification Post-Migration

### 1. Vérifier les Colonnes

```sql
-- Dans SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN (
    'date_of_birth', 
    'sexe', 
    'adresse', 
    'candidate_status',
    'poste_actuel',
    'annees_experience',
    'no_seeg_email'
  );
```

**Résultat attendu :**
```
column_name          | data_type | is_nullable
---------------------+-----------+------------
date_of_birth        | date      | YES
sexe                 | character varying | YES
adresse              | text      | YES
candidate_status     | character varying | YES
poste_actuel         | text      | YES
annees_experience    | integer   | YES
no_seeg_email        | boolean   | YES
```

### 2. Tester le Trigger

```sql
-- Insérer un utilisateur test dans auth.users avec metadata
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test@seeg.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  jsonb_build_object(
    'first_name', 'Jean',
    'last_name', 'Dupont',
    'phone', '+241 01 23 45 67',
    'date_of_birth', '1990-01-15',
    'sexe', 'M',
    'adresse', 'Libreville',
    'candidate_status', 'interne',
    'role', 'candidat'
  )
);

-- Vérifier que l'utilisateur a été créé dans public.users
SELECT * FROM public.users WHERE email = 'test@seeg.com';
```

### 3. Tester la Validation Email

```sql
-- Ceci devrait échouer (email invalide pour interne)
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  candidate_status,
  no_seeg_email,
  role
) VALUES (
  gen_random_uuid(),
  'test@gmail.com', -- Email non SEEG
  'Jean',
  'Test',
  'interne',
  FALSE, -- Pas d'exception
  'candidat'
);
-- Erreur attendue: "Les candidats internes doivent avoir un email @seeg.com..."

-- Ceci devrait réussir (exception cochée)
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  candidate_status,
  no_seeg_email,
  role
) VALUES (
  gen_random_uuid(),
  'test2@gmail.com',
  'Jean',
  'Test2',
  'interne',
  TRUE, -- Exception cochée
  'candidat'
);
-- Devrait réussir
```

### 4. Tester les Fonctions Helper

```sql
-- Récupérer un profil
SELECT * FROM get_candidate_profile('id-utilisateur-test');

-- Mettre à jour un profil
SELECT update_candidate_profile(
  'id-utilisateur-test'::UUID,
  p_phone := '+241 99 88 77 66',
  p_adresse := 'Nouvelle adresse'
);
```

---

## 🔄 Rollback (Annuler la Migration)

Si besoin de revenir en arrière :

```sql
-- 1. Supprimer les triggers
DROP TRIGGER IF EXISTS validate_candidate_email_trigger ON public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Supprimer les fonctions
DROP FUNCTION IF EXISTS public.validate_candidate_email();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_candidate_profile(UUID);
DROP FUNCTION IF EXISTS public.update_candidate_profile;

-- 3. Supprimer la vue
DROP VIEW IF EXISTS public.candidate_statistics;

-- 4. Supprimer les colonnes
ALTER TABLE public.users
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS sexe,
DROP COLUMN IF EXISTS adresse,
DROP COLUMN IF EXISTS candidate_status,
DROP COLUMN IF EXISTS poste_actuel,
DROP COLUMN IF EXISTS annees_experience,
DROP COLUMN IF EXISTS no_seeg_email;

-- 5. Supprimer les index
DROP INDEX IF EXISTS idx_users_candidate_status;
DROP INDEX IF EXISTS idx_users_matricule;
```

---

## 📊 Mapping Frontend → Backend

### Données d'Inscription Frontend
```typescript
{
  email: "jean.dupont@seeg.com",
  password: "Password123!",
  firstName: "Jean",
  lastName: "Dupont",
  phone: "+241 01 23 45 67",
  matricule: "1234",
  dateOfBirth: "1990-01-15",
  sexe: "M",
  adresse: "Libreville, Gabon",
  candidateStatus: "interne",
  noSeegEmail: false
}
```

### Metadata Supabase
```typescript
{
  role: "candidat",
  first_name: "Jean",
  last_name: "Dupont",
  phone: "+241 01 23 45 67",
  matricule: "1234",
  date_of_birth: "1990-01-15",
  sexe: "M",
  adresse: "Libreville, Gabon",
  candidate_status: "interne",
  no_seeg_email: false
}
```

### Code Frontend (useAuth)
```typescript
await signUp(email, password, {
  role: "candidat",
  first_name: signUpData.firstName,
  last_name: signUpData.lastName,
  phone: signUpData.phone,
  matricule: signUpData.matricule,
  date_of_birth: signUpData.dateOfBirth,
  sexe: signUpData.sexe,
  adresse: signUpData.adresse,
  candidate_status: signUpData.candidateStatus,
  no_seeg_email: signUpData.noSeegEmail
});
```

---

## ⚠️ Points d'Attention

### 1. Service Role Key
Pour exécuter certaines commandes, vous aurez besoin de la **Service Role Key** (pas l'Anon Key).

### 2. Données Existantes
Si vous avez déjà des utilisateurs, cette migration ajoute les colonnes avec valeurs NULL. Vous devrez peut-être faire un script de migration de données.

### 3. Validation Email
La validation email peut bloquer des inscriptions si mal configurée. Testez bien !

### 4. Performance
Les index sont créés automatiquement. Pour des milliers d'utilisateurs, cela peut prendre quelques minutes.

---

## 📞 Support

En cas de problème :

1. **Vérifier les logs Supabase** : Dashboard > Logs
2. **Consulter la documentation** : https://supabase.com/docs/guides/database/migrations
3. **Forum Supabase** : https://github.com/supabase/supabase/discussions

---

## ✅ Checklist de Déploiement

- [ ] Backup de la base de données avant migration
- [ ] Migration appliquée sans erreur
- [ ] Colonnes vérifiées dans Table Editor
- [ ] Trigger testé avec un utilisateur de test
- [ ] Validation email testée (cas valide et invalide)
- [ ] Fonctions helper testées
- [ ] Frontend mis à jour pour envoyer les nouvelles données
- [ ] Test d'inscription complet (interne et externe)
- [ ] Rollback plan préparé si besoin
