# 🎯 GUIDE FINAL : Campagnes définies par dates

## 📅 **Définition des campagnes**

Les campagnes sont maintenant définies automatiquement en fonction de la **date de création** des offres :

| Campagne | Période | Visible pour candidats | Visible pour recruteurs |
|----------|---------|------------------------|-------------------------|
| **Campagne 1** | Avant le 11/09/2025 | ❌ NON (Historique) | ✅ OUI |
| **Campagne 2** | Du 11/09/2025 au 21/10/2025 | ❌ NON (Historique) | ✅ OUI |
| **Campagne 3** | Après le 21/10/2025 | ✅ OUI (Active) | ✅ OUI |

---

## 🔧 **Mise en place**

### **Étape 1 : Exécuter le script SQL**

Exécutez `NETTOYER_CAMPAGNES_PAR_DATES.sql` dans Supabase SQL Editor.

Ce script va :
1. ✅ Analyser la répartition actuelle des offres par date
2. ✅ Assigner `campaign_id = 1` aux offres créées **avant le 11/09/2025**
3. ✅ Assigner `campaign_id = 2` aux offres créées **du 11/09/2025 au 21/10/2025**
4. ✅ Assigner `campaign_id = 3` aux offres créées **après le 21/10/2025**
5. ✅ Propager `campaign_id` aux candidatures
6. ✅ Définir `campaign_id = 3` comme défaut pour les nouvelles offres

### **Étape 2 : Vérifier les résultats**

Après avoir exécuté le script, vérifiez :

```sql
SELECT 
  campaign_id,
  COUNT(*) as nombre_offres,
  MIN(created_at) as premiere_offre,
  MAX(created_at) as derniere_offre
FROM job_offers
GROUP BY campaign_id
ORDER BY campaign_id;
```

**Résultat attendu :**

```
campaign_id | nombre_offres | premiere_offre      | derniere_offre
------------|---------------|---------------------|--------------------
1           | 5             | 2025-09-01 10:00:00 | 2025-09-10 23:59:59
2           | 8             | 2025-09-11 00:00:00 | 2025-10-20 23:59:59
3           | 3             | 2025-10-21 00:00:00 | 2025-10-25 15:30:00
```

### **Étape 3 : Rafraîchir l'application**

1. **Rafraîchissez la page** (F5)
2. **Ouvrez la console** (F12)
3. **Vérifiez les logs**

---

## 📊 **Logs attendus dans la console**

### **Pour un candidat :**

```
🔒 [fetchJobOffers] Mode candidat : filtrage status=active

🚫 [CAMPAIGN FILTER] "Offre Campagne 1" (Campagne 1) - Masquée (Campagne historique)
🚫 [CAMPAIGN FILTER] "Offre Campagne 2" (Campagne 2) - Masquée (Campagne historique)
✅ [CAMPAIGN FILTER] "Offre Campagne 3" (Campagne 3) - Visible

📊 [FILTER CAMPAGNE] Offres visibles après filtrage campagne: 3/16

✅ [FINAL] Offres affichées: 3 offres

📊 [useApplications] Candidatures filtrées par campagne: 2/12
```

### **Pour un recruteur :**

```
👔 [fetchJobOffers] Mode recruteur : toutes les offres (actives et inactives)

✅ [FINAL] Offres affichées: 16 offres (toutes campagnes: 1, 2, 3)
```

---

## 🎯 **Comportement attendu**

### **Vue Candidat :**

| Dashboard | Avant | Après |
|-----------|-------|-------|
| Nombre d'offres | 16 offres (toutes campagnes) | 3 offres (Campagne 3 uniquement) |
| Mes candidatures | 12 candidatures (toutes) | 2 candidatures (Campagne 3 uniquement) |

### **Vue Recruteur :**

| Dashboard | Comportement |
|-----------|--------------|
| Nombre d'offres | 16 offres (TOUTES les campagnes) |
| Candidatures | Toutes les candidatures (toutes campagnes) |
| Filtrage | Peut voir et gérer Campagne 1, 2 et 3 |

---

## 🆕 **Créer une nouvelle offre**

Quand vous créez une nouvelle offre aujourd'hui (après le 21/10/2025) :

1. ✅ Le système assigne automatiquement `campaign_id = 3`
2. ✅ L'offre est **visible** pour les candidats
3. ✅ Aucune action manuelle requise

---

## 🔄 **Passer à une Campagne 4 plus tard**

Pour créer une Campagne 4 (par exemple à partir du 01/12/2025) :

### **1. Mettre à jour la configuration**

```typescript
// src/config/campaigns.ts
export const CAMPAIGN_CONFIG = {
  ACTIVE_CAMPAIGN_ID: 4,
  HIDDEN_CAMPAIGNS: [1, 2, 3],  // Masquer les 3 premières campagnes
  ALL_CAMPAIGNS: [1, 2, 3, 4],
};
```

### **2. Exécuter ce SQL**

```sql
-- Mettre à jour le défaut
ALTER TABLE job_offers 
ALTER COLUMN campaign_id SET DEFAULT 4;

-- Assigner les nouvelles offres à la Campagne 4
UPDATE job_offers
SET campaign_id = 4
WHERE created_at >= '2025-12-01 00:00:00+00'::timestamptz;
```

---

## 📋 **Résumé des fichiers**

### **Fichiers créés :**
1. ✅ `NETTOYER_CAMPAGNES_PAR_DATES.sql` - Script SQL de nettoyage
2. ✅ `GUIDE_FINAL_CAMPAGNES_PAR_DATES.md` - Ce guide

### **Fichiers modifiés :**
1. ✅ `src/config/campaigns.ts` - Configuration mise à jour avec Campagne 3
2. ✅ `src/hooks/useJobOffers.tsx` - Filtrage par campagne (déjà fait)
3. ✅ `src/hooks/useApplications.tsx` - Filtrage par campagne (déjà fait)

---

## ✅ **Checklist finale**

- [ ] Exécuter `NETTOYER_CAMPAGNES_PAR_DATES.sql`
- [ ] Vérifier la répartition des offres par campagne
- [ ] Rafraîchir la page de l'application
- [ ] Se connecter avec un compte **candidat externe**
- [ ] Vérifier que seules les offres de **Campagne 3** sont visibles
- [ ] Vérifier que les anciennes candidatures de **Campagne 1 et 2** sont masquées
- [ ] Se connecter avec un compte **recruteur**
- [ ] Vérifier que **toutes les campagnes** (1, 2, 3) sont visibles

---

## 🎉 **Résultat final**

### **Candidats :**
```
Dashboard :
  📊 3 offres disponibles (Campagne 3)
  📝 2 candidatures en cours (Campagne 3)
```

### **Recruteurs :**
```
Dashboard :
  📊 16 offres disponibles (Campagnes 1, 2, 3)
  📝 139 candidatures (toutes campagnes)
```

---

✅ **Système de campagnes par dates opérationnel !**

Les candidats ne verront maintenant **que les offres créées après le 21/10/2025** (Campagne 3), tandis que les recruteurs continuent de voir toutes les campagnes pour gérer l'historique.

