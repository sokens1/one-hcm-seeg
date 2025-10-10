# ✅ Correction : Erreur "Invalid time value"

## ❌ Problème
Erreur dans le dashboard recruteur : `Invalid time value`

---

## ✅ Cause
Des dates `null` ou mal formatées dans certaines offres causaient une erreur lors de la conversion avec `new Date()`.

---

## ✅ Correction effectuée

### Fichiers modifiés :
1. `src/hooks/useRecruiterDashboard.tsx`
2. `src/hooks/useJobOffers.tsx`

### Améliorations :

**Avant :**
```typescript
const createdAt = new Date(job.created_at); // ❌ Crash si null
const updatedAt = new Date(job.updated_at); // ❌ Crash si null
```

**Maintenant :**
```typescript
try {
  const createdAt = job.created_at ? new Date(job.created_at) : null;
  const updatedAt = job.updated_at ? new Date(job.updated_at) : null;
  
  // Vérifier que les dates sont valides
  const isValidCreated = createdAt && !isNaN(createdAt.getTime());
  const isValidUpdated = updatedAt && !isNaN(updatedAt.getTime());
  
  // Utiliser seulement si valides
  if (isValidCreated || isValidUpdated) {
    // ... logique de filtrage
  }
} catch (error) {
  console.error('Erreur de date:', error);
  // Continue sans crash
}
```

---

## ✅ Avantages

1. ✅ **Robustesse** : Pas de crash si date invalide
2. ✅ **Logs d'erreur** : Affiche quelle offre pose problème
3. ✅ **Graceful fallback** : Continue avec les autres offres
4. ✅ **Validation stricte** : Vérifie avec `isNaN(date.getTime())`

---

## 🧪 Test maintenant

**Rafraîchissez le dashboard recruteur** (Ctrl+F5)

**Résultat attendu :**
- ✅ Pas d'erreur "Invalid time value"
- ✅ Le dashboard se charge correctement
- ✅ Toutes les offres valides s'affichent

**Si une offre a une date invalide :**
```
⚠️ [CAMPAIGN DASHBOARD] Erreur de date pour "Titre de l'offre": Error...
```

---

## 🔍 Vérification en base

Si vous voyez des erreurs de date dans la console, vérifiez en base :

```sql
SELECT 
    id,
    title,
    created_at,
    updated_at,
    created_at IS NULL as created_null,
    updated_at IS NULL as updated_null
FROM job_offers
WHERE created_at IS NULL OR updated_at IS NULL;
```

**Si des offres ont des dates NULL :**

```sql
-- Fixer les dates manquantes
UPDATE job_offers
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;
```

---

## ✅ Statut

**Mode campagne** : ❌ Désactivé (toutes les offres visibles)
**Erreur de dates** : ✅ Corrigée avec validation
**Filtrage Interne/Externe** : ✅ Opérationnel

---

**Rafraîchissez maintenant et vérifiez que l'erreur a disparu !** 🔍

