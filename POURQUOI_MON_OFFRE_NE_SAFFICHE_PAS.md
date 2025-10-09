# 🔍 Pourquoi mon offre ne s'affiche pas ?

## 🎯 Diagnostic rapide (2 minutes)

### Étape 1 : Ouvrir la console

1. **Appuyez sur F12** pour ouvrir la console
2. **Rafraîchissez la page** (F5)
3. **Cherchez les logs** pour votre offre

---

## 📋 Logs à chercher

### Pour chaque offre, vous verrez :

```javascript
🔍 [CAMPAIGN DEBUG] "Titre de votre offre": {
  created: "2025-10-09T14:30:00.000Z",  ← Date de création
  updated: "2025-10-09T14:45:00.000Z",  ← Date de dernière modification
  threshold: "2025-10-09T12:45:00.000Z" ← Seuil (maintenant - 24h)
}
```

**Puis :**

#### Si affichée (offre récente) :
```
🆕 [CAMPAIGN] "Titre de votre offre" - ✅ AFFICHÉE (créée récemment)
```

#### Si affichée (offre de campagne) :
```
📋 [CAMPAIGN] "Directeur Juridique, Communication & RSE" - ✅ CAMPAGNE
```

#### Si masquée :
```
❌ [CAMPAIGN] "Titre de votre offre" - MASQUÉE (ancienne, hors campagne)
```

---

## ✅ Cas 1 : Votre offre est récente (moins de 24h)

**Situation :**
- Vous avez créé l'offre il y a moins de 24h
- Elle devrait s'afficher automatiquement

**Vérification dans les logs :**
```
🔍 [CAMPAIGN DEBUG] "Votre offre": {
  created: "2025-10-09T15:00:00.000Z",  ← Aujourd'hui
  threshold: "2025-10-09T14:00:00.000Z" ← Il y a 24h
}
🆕 [CAMPAIGN] "Votre offre" - ✅ AFFICHÉE (créée récemment)
```

**Si vous voyez ça → L'offre DOIT s'afficher**

**Si elle ne s'affiche pas malgré ce log :**
1. Videz le cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Vérifiez que vous êtes sur la bonne page (`/jobs` ou `/recruiter`)

---

## ❌ Cas 2 : Votre offre est ancienne (plus de 24h)

**Situation :**
- L'offre a été créée il y a plus de 24h
- Elle n'est pas dans la liste CAMPAIGN_JOBS

**Logs attendus :**
```
🔍 [CAMPAIGN DEBUG] "Votre offre": {
  created: "2025-09-25T10:00:00.000Z",  ← Il y a 2 semaines
  threshold: "2025-10-09T14:00:00.000Z" ← Il y a 24h
}
❌ [CAMPAIGN] "Votre offre" - MASQUÉE (ancienne, hors campagne)
```

**Solutions :**

### Solution 1 : Modifier l'offre (recommandé)
1. Allez dans le dashboard recruteur
2. Cliquez sur "Modifier" sur votre offre
3. Changez n'importe quel champ (même juste le salaire)
4. Cliquez "Sauvegarder"
5. ✅ L'offre apparaît maintenant (car `updated_at` vient d'être mis à jour)

### Solution 2 : Ajouter le titre à CAMPAIGN_JOBS

**Fichier** : `src/config/campaign.ts`

```typescript
export const CAMPAIGN_JOBS = [
  "Directeur Juridique, Communication & RSE",
  "Directeur des Systèmes d'Information", 
  "Directeur Audit & Contrôle interne",
  "Votre Titre d'Offre"  // ← Ajoutez votre titre ici (EXACT)
];
```

### Solution 3 : Désactiver temporairement le mode campagne

**Fichier** : `src/config/campaign.ts`

```typescript
export const CAMPAIGN_MODE = false; // Temporairement
```

---

## 🔧 Vérifications supplémentaires

### Vérification 1 : L'offre est bien en base

```sql
SELECT 
    id,
    title,
    status,
    created_at,
    updated_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as heures_depuis_creation,
    EXTRACT(EPOCH FROM (NOW() - updated_at))/3600 as heures_depuis_modification
FROM job_offers
WHERE title ILIKE '%VOTRE_TITRE%'
ORDER BY created_at DESC;
```

**Résultat attendu :**
- `status` = 'active' (pas 'draft')
- `heures_depuis_creation` < 24 OU `heures_depuis_modification` < 24

### Vérification 2 : Le statut est bien "active"

```sql
SELECT title, status FROM job_offers WHERE title ILIKE '%VOTRE_TITRE%';
```

**Si `status = 'draft'` :**
→ L'offre n'est pas publiée, elle ne s'affichera jamais aux candidats

**Solution :**
- Modifiez l'offre et publiez-la (changez le statut en 'active')

---

## 📊 Cas particuliers

### Mon offre a plus de 24h

**Options :**

**A. Modifier l'offre** (recommandé)
- Ouvrez l'offre en édition
- Sauvegardez (même sans changement)
- `updated_at` sera mis à jour
- L'offre apparaîtra pendant 24h

**B. Ajouter à CAMPAIGN_JOBS** (permanent)
- Éditez `src/config/campaign.ts`
- Ajoutez le titre exact

**C. Changer le seuil à 7 jours** (pour tous)

**Fichier** : `src/hooks/useJobOffers.tsx` (ligne ~154)
**Fichier** : `src/hooks/useRecruiterDashboard.tsx` (ligne ~113)

```typescript
// Avant (24 heures)
const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

// Après (7 jours)
const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
```

---

## 🆘 L'offre ne s'affiche toujours pas

**Envoyez-moi :**

1. **La console complète** (F12 → tout copier)
2. **Le titre exact de votre offre**
3. **Cette requête SQL** :
```sql
SELECT 
    title,
    status,
    created_at,
    updated_at,
    NOW() as maintenant
FROM job_offers
WHERE title = 'TITRE_EXACT_DE_VOTRE_OFFRE';
```

---

## ✅ Vérification rapide

**Rafraîchissez la page et cherchez dans la console :**

```
🕐 [CAMPAIGN] Détection offres récentes - Seuil: 2025-10-09T12:45:00.000Z
🔍 [CAMPAIGN DEBUG] "Votre offre": {
  created: "...",
  updated: "...",
  threshold: "..."
}
🆕 [CAMPAIGN] "Votre offre" - ✅ AFFICHÉE (créée récemment)
```

**Si vous voyez ✅ AFFICHÉE mais l'offre ne s'affiche pas :**
- Ctrl+Shift+Delete (vider le cache)
- Ctrl+F5 (hard refresh)

---

**Date** : 9 octobre 2025, 17h00
**Seuil actuel** : Dernières 24 heures

