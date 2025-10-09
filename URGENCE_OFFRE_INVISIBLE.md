# 🆘 URGENCE : Offre invisible - Diagnostic en 2 minutes

## ✅ Mode campagne désactivé

Le mode campagne est maintenant **désactivé**. Toutes les offres devraient être visibles.

---

## 🔍 Diagnostic rapide

### Étape 1 : Rafraîchissez (30 sec)

1. **Ctrl+F5** (hard refresh)
2. **Allez sur `/recruiter`** (dashboard recruteur)
3. **Voyez-vous votre offre maintenant ?**

**✅ OUI** → Problème résolu ! C'était le mode campagne.

**❌ NON** → Passez à l'étape 2

---

### Étape 2 : Vérifiez en base de données (1 min)

**Ouvrez l'éditeur SQL de Supabase et exécutez :**

```sql
-- Voir les offres créées dans les dernières 24 heures
SELECT 
    id,
    title,
    status,
    status_offerts,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_depuis_creation
FROM job_offers
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Résultat attendu :**
- Vous devez voir votre offre dans la liste

**❌ Votre offre n'est PAS dans la liste :**
→ Elle n'a pas été créée en base (erreur lors de la création)
→ Passez à l'étape 3

**✅ Votre offre EST dans la liste :**
→ Vérifiez la colonne `status`
   - Si `status = 'draft'` → L'offre n'est pas publiée
   - Si `status = 'active'` → Passez à l'étape 4

---

### Étape 3 : L'offre n'existe pas en base

**Problème** : L'erreur lors de la création (souvent le problème d'ID)

**Solution** : Vérifiez que cette requête fonctionne :

```sql
-- Vérifier que l'ID peut être généré automatiquement
SELECT gen_random_uuid() as test_id;
```

**Si ça fonctionne, vérifiez la colonne ID :**

```sql
SELECT 
    column_name, 
    column_default
FROM information_schema.columns
WHERE table_name = 'job_offers'
AND column_name = 'id';
```

**Résultat attendu :**
```
column_name | column_default
------------|------------------
id          | gen_random_uuid()
```

**Si `column_default` est NULL :**
→ Exécutez :

```sql
ALTER TABLE job_offers 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

**Puis recréez votre offre**

---

### Étape 4 : L'offre est en "draft" au lieu de "active"

**Solution :**

```sql
-- Remplacez VOTRE_ID par l'ID de votre offre
UPDATE job_offers
SET status = 'active'
WHERE id = 'VOTRE_ID';
```

**Ou recréez l'offre et cliquez sur "Publier" au lieu de "Sauvegarder le brouillon"**

---

### Étape 5 : Vérifier le filtrage Interne/Externe

**Si vous êtes connecté en tant que candidat externe :**

```sql
-- Vérifiez le statut de votre offre
SELECT 
    title,
    status_offerts
FROM job_offers
WHERE title ILIKE '%VOTRE_TITRE%';
```

**Si `status_offerts = 'interne'` et vous êtes candidat externe :**
→ Normal, l'offre est masquée

**Solution :**
- Changez `status_offerts` en 'externe', OU
- Connectez-vous avec un compte recruteur/admin

---

## 🚨 Problèmes courants

### Problème 1 : "null value in column id"

**Solution :**
```sql
ALTER TABLE job_offers 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

### Problème 2 : L'offre est en draft

**Solution :**
- Modifiez l'offre et cliquez "Publier"
- OU exécutez :
```sql
UPDATE job_offers SET status = 'active' WHERE id = 'VOTRE_ID';
```

### Problème 3 : Filtrage Interne/Externe

**Solution temporaire :**
- Désactivez le filtrage en vous connectant comme recruteur
- OU marquez l'offre comme 'externe'

---

## ⚡ Solution ultra-rapide

**Si vous voulez juste voir votre offre MAINTENANT :**

### Option 1 : Désactiver tout filtrage (déjà fait)
✅ Mode campagne désactivé
✅ Rafraîchissez (Ctrl+F5)

### Option 2 : Vérifier en SQL que l'offre existe

```sql
-- Voir TOUTES vos offres
SELECT * FROM job_offers 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📞 Envoyez-moi

**Pour que je puisse vous aider davantage :**

1. **Le résultat de cette requête** :
```sql
SELECT 
    id,
    title,
    status,
    status_offerts,
    created_at
FROM job_offers
ORDER BY created_at DESC
LIMIT 3;
```

2. **La console complète** (F12 → copier tout)

3. **Quel compte utilisez-vous ?** (recruteur, candidat interne, candidat externe)

---

**⏱️ Temps de diagnostic : 2 minutes**
**Mode campagne** : ❌ Désactivé (vous devez voir TOUTES les offres)

