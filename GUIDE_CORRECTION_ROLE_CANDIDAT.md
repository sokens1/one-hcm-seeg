# 🔧 GUIDE : Correction du rôle candidat et nombre d'offres

## 🎯 Problème identifié

Le système considère votre compte comme **recruteur** au lieu de **candidat externe**, ce qui affiche toutes les 16 offres au lieu de filtrer uniquement les offres externes.

### Logs qui le confirment :
```
👔 [fetchJobOffers] Mode recruteur : toutes les offres (actives et inactives)
📊 [FILTER NON-CANDIDAT] Toutes les offres visibles: 16 offres
```

---

## 🔍 Cause du problème

L'erreur vient de `useAuth.tsx` qui ne peut pas récupérer le rôle depuis la table `public.users` :
```
Failed to fetch user role: Cannot coerce the result to a single JSON object
```

Cela signifie que **l'utilisateur n'existe pas dans la table `public.users`**, seulement dans `auth.users`.

---

## ✅ SOLUTION : Étapes à suivre

### **Étape 1 : Vérifier si l'utilisateur existe dans public.users**

Exécutez cette requête dans Supabase SQL Editor :

```sql
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  candidate_status,
  created_at
FROM users
WHERE id = 'f64bb4ab-23d4-4384-94c3-0562cf047f85';
```

**Résultats possibles :**
- ✅ **L'utilisateur existe** → Passez à l'Étape 2
- ❌ **Aucun résultat (0 rows)** → Passez à l'Étape 3

---

### **Étape 2 : L'utilisateur existe mais a un mauvais rôle**

Si l'utilisateur existe mais que `role` n'est pas `'candidat'` ou que `candidate_status` n'est pas `'externe'` :

```sql
UPDATE users
SET 
  role = 'candidat',
  candidate_status = 'externe',
  updated_at = now()
WHERE id = 'f64bb4ab-23d4-4384-94c3-0562cf047f85';

-- Vérifier la mise à jour
SELECT id, email, role, candidate_status
FROM users
WHERE id = 'f64bb4ab-23d4-4384-94c3-0562cf047f85';
```

---

### **Étape 3 : L'utilisateur n'existe pas dans public.users**

Si la requête de l'Étape 1 ne retourne aucun résultat, l'utilisateur doit être créé.

#### **Option A : Utiliser la fonction automatique (RECOMMANDÉ)**

```sql
-- Cette fonction devrait créer automatiquement l'utilisateur
SELECT ensure_user_exists();
```

#### **Option B : Créer manuellement l'utilisateur**

Si l'Option A ne fonctionne pas, créez l'utilisateur manuellement :

```sql
-- ⚠️ REMPLACEZ email, first_name, last_name par les vraies valeurs
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  candidate_status,
  created_at,
  updated_at
)
VALUES (
  'f64bb4ab-23d4-4384-94c3-0562cf047f85',
  'votre-email@example.com',  -- À REMPLACER
  'Votre-Prénom',              -- À REMPLACER
  'Votre-Nom',                 -- À REMPLACER
  'candidat',
  'externe',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'candidat',
  candidate_status = 'externe',
  updated_at = now();
```

---

### **Étape 4 : Vérifier dans la console du navigateur**

1. **Rafraîchissez la page** (F5)
2. **Ouvrez la console** (F12)
3. **Cherchez ce log** :

```
🔍 [useAuth] Role detection: { dbRole, metadataRole, roleValue, userId }
```

**Vous devriez maintenant voir :**
```javascript
🔍 [useAuth] Role detection: { 
  dbRole: 'candidat',           // ✅ Devrait être 'candidat'
  metadataRole: '...',
  roleValue: 'candidat',         // ✅ Devrait être 'candidat'
  userId: 'f64bb4ab-23d4-4384-94c3-0562cf047f85'
}
```

4. **Cherchez aussi ces logs** :

```
🔒 [fetchJobOffers] Mode candidat : filtrage status=active
📊 [FILTER CANDIDAT] Offres visibles: X/16 (Statut: externe)
🔍 [DashboardMain] Nombre d'offres reçues: X
```

---

## 🎯 Résultat attendu

Après correction, vous devriez voir dans la console :

```
🔍 [useAuth] Role detection: { 
  dbRole: 'candidat', 
  roleValue: 'candidat' 
}

🔒 [fetchJobOffers] Mode candidat : filtrage status=active
✅ [FILTER] "Offre Externe 1" (externe) - Visible (candidat externe)
✅ [FILTER] "Offre Externe 2" (externe) - Visible (candidat externe)
🚫 [FILTER] "Offre Interne 1" (interne) - Masquée (candidat externe ne voit que externe)
📊 [FILTER CANDIDAT] Offres visibles: 8/16 (Statut: externe)

🔍 [DashboardMain] Nombre d'offres reçues: 8
```

Et dans le dashboard :
- **8 offres disponibles** (au lieu de 16)
- Uniquement les offres **externes**

---

## 📝 Fichiers créés pour vous aider

1. **`CORRIGER_UTILISATEUR_MANQUANT.sql`** : Script SQL prêt à l'emploi
2. **`DEFINIR_CANDIDATE_STATUS_PAR_DEFAUT.sql`** : Pour mettre à jour tous les candidats
3. **`VERIFIER_CANDIDATE_STATUS.sql`** : Pour vérifier l'état actuel

---

## ❓ Besoin d'aide ?

Partagez-moi :
1. Le résultat de la requête de l'Étape 1
2. Les logs de la console après avoir rafraîchi la page

Je pourrai vous donner les commandes SQL exactes à exécuter ! 🚀

