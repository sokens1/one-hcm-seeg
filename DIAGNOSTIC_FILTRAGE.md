# 🔍 Diagnostic du filtrage Interne/Externe

## 🎯 Ce qui doit se passer

### Recruteurs / Admins / Observateurs
✅ Voient **TOUTES** les offres (internes + externes)

### Candidats avec `candidate_status = 'interne'`
✅ Voient **TOUTES** les offres (internes + externes)

### Candidats avec `candidate_status = 'externe'` ou `NULL`
✅ Voient **SEULEMENT** les offres externes
🚫 Ne voient **PAS** les offres internes

---

## 🔍 Étape 1 : Vérifier dans la console

### Pour TOUS les utilisateurs

1. **Ouvrez la console** (F12)
2. **Allez sur la page des offres** (`/jobs` ou `/recruiter`)
3. **Cherchez ces logs** :

#### Si vous êtes RECRUTEUR :
```
🔍 [useAuth] User data loaded: {
  userId: "...",
  role: "recruteur",
  candidateStatus: null
}

🔍 [useJobOffers] Auth info: {
  isCandidate: false,
  candidateStatus: null,
  statusForFiltering: null,
  userId: "..."
}

📊 [FILTER NON-CANDIDAT] Toutes les offres visibles: 16 offres
```

#### Si vous êtes CANDIDAT INTERNE :
```
🔍 [useAuth] User data loaded: {
  userId: "...",
  role: "candidat",
  candidateStatus: "interne"
}

🔍 [useJobOffers] Auth info: {
  isCandidate: true,
  candidateStatus: "interne",
  statusForFiltering: "interne",
  userId: "..."
}

🔒 [FILTER] Offre interne "..." - Visible (candidat interne)
📊 [FILTER CANDIDAT] Offres visibles: 16/16 (Statut: interne)
```

#### Si vous êtes CANDIDAT EXTERNE :
```
🔍 [useAuth] User data loaded: {
  userId: "...",
  role: "candidat",
  candidateStatus: "externe"
}

🔍 [useJobOffers] Auth info: {
  isCandidate: true,
  candidateStatus: "externe",
  statusForFiltering: "externe",
  userId: "..."
}

🚫 [FILTER] Offre interne "..." - Masquée (candidat externe)
📊 [FILTER CANDIDAT] Offres visibles: 12/16 (Statut: externe)
```

#### Si vous êtes CANDIDAT SANS STATUT :
```
🔍 [useAuth] User data loaded: {
  userId: "...",
  role: "candidat",
  candidateStatus: null
}

🔍 [useJobOffers] Auth info: {
  isCandidate: true,
  candidateStatus: null,
  statusForFiltering: null,
  userId: "..."
}

🚫 [FILTER] Offre interne "..." - Masquée (candidat sans statut)
📊 [FILTER CANDIDAT] Offres visibles: 12/16 (Statut: non défini)
```

---

## 🔍 Étape 2 : Vérifier en base de données

### Vérifier le statut du candidat

```sql
-- Remplacez par l'email du candidat avec qui vous êtes connecté
SELECT 
    id,
    email,
    role,
    candidate_status
FROM users
WHERE email = 'VOTRE_EMAIL@example.com';
```

**Résultat attendu pour un candidat externe :**
```
id     | email              | role     | candidate_status
-------|-------------------|----------|------------------
abc123 | externe@test.com  | candidat | externe
```

**Si `candidate_status` est NULL :**
→ Le candidat est traité comme externe (ne voit pas les offres internes)

### Vérifier les offres

```sql
SELECT 
    title,
    status_offerts,
    status
FROM job_offers
WHERE status = 'active'
ORDER BY title;
```

**Résultat attendu :**
```
title                    | status_offerts | status
-------------------------|----------------|--------
Offre Test Externe       | externe        | active
Offre Test Interne       | interne        | active
```

---

## 🔧 Solutions selon le problème

### Problème 1 : Le candidat externe voit les offres internes

**Diagnostic :**
1. Regardez la console : Le log `candidateStatus` affiche quoi ?

**Si `candidateStatus: null` :**
→ Le candidat n'a pas de statut en base

**Solution :**
```sql
UPDATE users
SET candidate_status = 'externe'
WHERE email = 'VOTRE_EMAIL@example.com';
```

**Si `candidateStatus: "interne"` alors qu'il devrait être externe :**
→ Le candidat est marqué comme interne en base

**Solution :**
```sql
UPDATE users
SET candidate_status = 'externe'
WHERE email = 'VOTRE_EMAIL@example.com';
```

### Problème 2 : Le recruteur ne voit pas toutes les offres

**Diagnostic :**
1. Console : `isCandidate` doit être `false`

**Si `isCandidate: true` :**
→ Le recruteur est marqué comme candidat en base

**Solution :**
```sql
UPDATE users
SET role = 'recruteur'
WHERE email = 'VOTRE_EMAIL_RECRUTEUR@example.com';
```

### Problème 3 : Les logs ne s'affichent pas

**Solution :**
1. Videz le cache (Ctrl+Shift+Delete)
2. Rafraîchissez (Ctrl+F5)
3. Redémarrez le serveur (Ctrl+C puis `npm run dev`)

---

## ✅ Checklist de vérification

### Pour un candidat externe

- [ ] Console : `isCandidate: true`
- [ ] Console : `candidateStatus: "externe"` ou `null`
- [ ] Console : `🚫 [FILTER] Offre interne "..." - Masquée`
- [ ] Interface : Les offres internes ne s'affichent PAS
- [ ] Interface : Les offres externes s'affichent

### Pour un candidat interne

- [ ] Console : `isCandidate: true`
- [ ] Console : `candidateStatus: "interne"`
- [ ] Console : `🔒 [FILTER] Offre interne "..." - Visible`
- [ ] Interface : Les offres internes s'affichent
- [ ] Interface : Les offres externes s'affichent

### Pour un recruteur

- [ ] Console : `isCandidate: false`
- [ ] Console : `📊 [FILTER NON-CANDIDAT] Toutes les offres visibles`
- [ ] Interface : Toutes les offres s'affichent (internes + externes)

---

## 🆘 Si ça ne fonctionne toujours pas

**Envoyez-moi :**

1. **La console complète** (F12 → copier tout)
2. **Le résultat de cette requête SQL** :
```sql
SELECT 
    id,
    email,
    role,
    candidate_status
FROM users
WHERE email = 'VOTRE_EMAIL_PROBLEME@example.com';
```
3. **Une capture d'écran** de la page des offres

---

## 🎯 Actions immédiates

### 1. Marquez vos candidats (si pas encore fait)

```sql
-- Candidats EXTERNES (par défaut)
UPDATE users
SET candidate_status = 'externe'
WHERE role = 'candidat'
AND candidate_status IS NULL;

-- Candidats INTERNES (employés SEEG)
UPDATE users
SET candidate_status = 'interne'
WHERE email IN (
    'employe1@seeg.ga',
    'employe2@seeg.ga'
);
```

### 2. Rafraîchissez

1. **Ctrl+F5** (hard refresh)
2. **Reconnectez-vous**
3. **Vérifiez les logs console**

---

**Date** : 9 octobre 2025, 16h40
**Statut** : ✅ Filtrage corrigé et amélioré avec logs détaillés

