# 📣 Mode Campagne Amélioré

## ✅ Mode campagne réactivé avec nouvelles règles

**Date d'activation** : 9 octobre 2025

---

## 🎯 Nouvelle logique

### Offres affichées en mode campagne

Le système affiche **deux types d'offres** :

#### 1. 🆕 Offres récentes (TOUJOURS affichées)
- Offres **créées** à partir du **9 octobre 2025**
- Offres **modifiées** à partir du **9 octobre 2025**
- ✅ **Peu importe le titre**, elles s'affichent automatiquement

#### 2. 📋 Offres de campagne (Liste fixe)
- Directeur Juridique, Communication & RSE
- Directeur des Systèmes d'Information
- Directeur Audit & Contrôle interne

---

## 📊 Règles d'affichage complètes

```
Mode Campagne activé
    ↓
Pour chaque offre, vérifier :
    ↓
1. Est-elle créée/modifiée après le 9 oct. 2025 ?
   ├─ OUI → ✅ AFFICHER (offre récente)
   └─ NON → Passer à l'étape 2
    ↓
2. Est-elle dans la liste de campagne ?
   ├─ OUI → ✅ AFFICHER (offre de campagne)
   └─ NON → ❌ MASQUER (ancienne offre hors campagne)
```

---

## 🧪 Exemples concrets

### Exemple 1 : Nouvelle offre créée aujourd'hui
```
Titre : "Test Nouvelle Offre"
Créée le : 9 octobre 2025, 16h30
Résultat : ✅ AFFICHÉE (offre récente)
```

### Exemple 2 : Offre de campagne existante
```
Titre : "Directeur Juridique, Communication & RSE"
Créée le : 15 septembre 2025
Résultat : ✅ AFFICHÉE (offre de campagne)
```

### Exemple 3 : Offre modifiée aujourd'hui
```
Titre : "Directeur Commercial"
Créée le : 1 septembre 2025
Modifiée le : 9 octobre 2025, 16h45
Résultat : ✅ AFFICHÉE (modifiée récemment)
```

### Exemple 4 : Ancienne offre hors campagne
```
Titre : "Chef de Département Support"
Créée le : 20 septembre 2025
Modifiée le : 25 septembre 2025
Résultat : ❌ MASQUÉE (ancienne, hors campagne)
```

---

## 📋 Logs de la console

### Offre récente créée/modifiée
```
🆕 [CAMPAIGN] "Nouvelle Offre Test" - ✅ AFFICHÉE (offre récente créée/modifiée)
```

### Offre de campagne
```
📋 [CAMPAIGN] "Directeur Juridique, Communication & RSE" - ✅ CAMPAGNE
```

### Offre ancienne hors campagne
```
📋 [CAMPAIGN] "Chef de Département Support" - ❌ MASQUÉE (ancienne)
```

### Résumé final
```
✅ [CAMPAIGN] Offres affichées: 5
   - Offres de campagne: 3
   - Offres récentes: 2
```

---

## 🎯 Avantages de cette approche

1. ✅ **Flexibilité** : Les nouvelles offres apparaissent automatiquement
2. ✅ **Pas de configuration** : Pas besoin d'ajouter le titre à CAMPAIGN_JOBS
3. ✅ **Test facile** : Créez/modifiez une offre → elle s'affiche
4. ✅ **Compatibilité** : Les offres de campagne continuent de s'afficher
5. ✅ **Traçabilité** : Logs détaillés pour comprendre pourquoi une offre est affichée

---

## 🔧 Modifier la date seuil

Si vous voulez changer la date à partir de laquelle les offres sont considérées comme "récentes" :

**Fichier** : `src/hooks/useJobOffers.tsx` (ligne ~153)
**Fichier** : `src/hooks/useRecruiterDashboard.tsx` (ligne ~112)

```typescript
const recentThreshold = new Date('2025-10-09T00:00:00'); // Modifiez cette date
```

**Exemples :**
- `'2025-10-09T00:00:00'` → Afficher les offres du 9 octobre et après
- `'2025-10-01T00:00:00'` → Afficher les offres du 1er octobre et après
- `'2025-09-25T00:00:00'` → Afficher les offres du 25 septembre et après

---

## 🧪 Test complet (5 minutes)

### Test 1 : Créer une nouvelle offre

1. **Connectez-vous en recruteur**
2. **Créez une offre** :
   - Titre : "Nouvelle Offre Test"
   - Statut : Externe
   - Ajoutez les questions MTP
3. **Publiez**
4. **Vérifiez** :
   - Dashboard recruteur → ✅ Visible
   - Page candidat `/jobs` → ✅ Visible
   - Console : `🆕 [CAMPAIGN] "Nouvelle Offre Test" - ✅ AFFICHÉE`

### Test 2 : Modifier une offre existante

1. **Modifiez une ancienne offre** (hors campagne)
2. **Changez juste le salaire** ou un autre champ
3. **Sauvegardez**
4. **Vérifiez** :
   - Elle apparaît maintenant car `updated_at` a changé
   - Console : `🆕 [CAMPAIGN] "..." - ✅ AFFICHÉE (offre récente créée/modifiée)`

### Test 3 : Vérifier les offres de campagne

1. **Allez sur `/jobs`**
2. **Console** : Vérifiez que les 3 offres de campagne s'affichent
3. **Log attendu** :
   ```
   📋 [CAMPAIGN] "Directeur Juridique, Communication & RSE" - ✅ CAMPAGNE
   📋 [CAMPAIGN] "Directeur des Systèmes d'Information" - ✅ CAMPAGNE
   📋 [CAMPAIGN] "Directeur Audit & Contrôle interne" - ✅ CAMPAGNE
   ```

---

## 📊 Statistiques

### Voir quelles offres seront affichées

```sql
SELECT 
    title,
    status,
    status_offerts,
    created_at,
    updated_at,
    CASE 
        WHEN created_at >= '2025-10-09T00:00:00' THEN '🆕 Récente (créée)'
        WHEN updated_at >= '2025-10-09T00:00:00' THEN '🆕 Récente (modifiée)'
        WHEN title IN (
            'Directeur Juridique, Communication & RSE',
            'Directeur des Systèmes d''Information',
            'Directeur Audit & Contrôle interne'
        ) THEN '📋 Campagne'
        ELSE '❌ Masquée'
    END as visibilite_campagne
FROM job_offers
WHERE status = 'active'
ORDER BY created_at DESC;
```

---

## ⚙️ Configuration actuelle

**Fichier** : `src/config/campaign.ts`

```typescript
export const CAMPAIGN_MODE = true; // ✅ ACTIVÉ

export const CAMPAIGN_JOBS = [
  "Directeur Juridique, Communication & RSE",
  "Directeur des Systèmes d'Information", 
  "Directeur Audit & Contrôle interne"
];
```

**Seuil des offres récentes** : 9 octobre 2025, 00h00

---

## 🎉 Résultat

Maintenant vous pouvez :

1. ✅ **Créer de nouvelles offres** → Elles s'affichent automatiquement
2. ✅ **Modifier des offres** → Elles s'affichent automatiquement
3. ✅ **Mode campagne actif** → Les 3 offres principales sont visibles
4. ✅ **Offres récentes prioritaires** → Toujours visibles même hors campagne
5. ✅ **Logs détaillés** → Comprendre pourquoi une offre s'affiche ou non

---

## 🔮 Évolutions futures

Si besoin, vous pouvez :

- Changer la date seuil (afficher depuis une autre date)
- Ajouter des titres à CAMPAIGN_JOBS
- Désactiver le mode campagne (`CAMPAIGN_MODE = false`)
- Combiner avec le filtrage Interne/Externe

---

**Date de mise à jour** : 9 octobre 2025, 16h45
**Statut** : ✅ Mode campagne réactivé avec support des offres récentes

