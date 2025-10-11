# 🎯 GUIDE : Gestion des Campagnes Multiples

## 📊 **Vue d'ensemble**

Le système gère maintenant plusieurs campagnes de recrutement :

- **Campagne 1** : Masquée pour les candidats et la vue publique (historique)
- **Campagne 2** : Active et visible pour tous (campagne actuelle)
- **Recruteurs** : Voient toutes les campagnes (1, 2, 3, etc.)

---

## 🗄️ **Structure de la base de données**

### **1. Colonne `campaign_id` ajoutée aux tables :**

- `job_offers.campaign_id` : INTEGER (identifie la campagne d'une offre)
- `applications.campaign_id` : INTEGER (hérité de l'offre)

### **2. Valeurs par défaut :**

- **Campagne 1** : Toutes les offres créées avant 2025-01-01 OU les 3 offres ciblées
- **Campagne 2** : Toutes les nouvelles offres (par défaut)

---

## ⚙️ **Configuration**

### **Fichier : `src/config/campaigns.ts`**

```typescript
export const CAMPAIGN_CONFIG = {
  // Campagne actuellement active pour les candidats
  ACTIVE_CAMPAIGN_ID: 2,
  
  // Campagnes masquées pour les candidats (historique)
  HIDDEN_CAMPAIGNS: [1],
  
  // Toutes les campagnes existantes
  ALL_CAMPAIGNS: [1, 2],
};
```

**Pour ajouter une nouvelle campagne (Campagne 3) :**

```typescript
export const CAMPAIGN_CONFIG = {
  ACTIVE_CAMPAIGN_ID: 3,  // ✅ Nouvelle campagne active
  HIDDEN_CAMPAIGNS: [1, 2],  // ✅ Masquer Campagne 1 et 2
  ALL_CAMPAIGNS: [1, 2, 3],  // ✅ Ajouter 3 à la liste
};
```

---

## 🔧 **Étapes pour mettre en place le système**

### **Étape 1 : Exécuter le script SQL**

Exécutez `GESTION_CAMPAGNES_MULTIPLES.sql` dans Supabase SQL Editor :

```sql
-- 1. Ajouter les colonnes campaign_id
ALTER TABLE job_offers ADD COLUMN campaign_id INTEGER DEFAULT 2;
ALTER TABLE applications ADD COLUMN campaign_id INTEGER;

-- 2. Marquer les offres de la Campagne 1
UPDATE job_offers
SET campaign_id = 1
WHERE created_at < '2025-01-01 00:00:00+00'::timestamptz
   OR title IN (
      'Directeur Audit & Contrôle interne',
      'Directeur des Systèmes d''Information', 
      'Directeur Juridique, Communication & RSE'
   );

-- 3. Marquer les nouvelles offres comme Campagne 2
UPDATE job_offers
SET campaign_id = 2
WHERE campaign_id IS NULL OR campaign_id != 1;

-- 4. Propager le campaign_id aux candidatures
UPDATE applications a
SET campaign_id = jo.campaign_id
FROM job_offers jo
WHERE a.job_offer_id = jo.id;

-- 5. Créer les index
CREATE INDEX IF NOT EXISTS idx_job_offers_campaign_id ON job_offers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON applications(campaign_id);
```

### **Étape 2 : Vérifier la répartition**

```sql
-- Voir les offres par campagne
SELECT 
  campaign_id,
  COUNT(*) as nombre_offres,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as offres_actives
FROM job_offers
GROUP BY campaign_id;

-- Voir les candidatures par campagne
SELECT 
  campaign_id,
  COUNT(*) as nombre_candidatures
FROM applications
GROUP BY campaign_id;
```

### **Étape 3 : Rafraîchir l'application**

1. **Rafraîchissez la page** (F5)
2. **Ouvrez la console** (F12)
3. **Vérifiez les logs** :

---

## 📊 **Logs attendus dans la console**

### **Pour un candidat :**

```
🔒 [fetchJobOffers] Mode candidat : filtrage status=active
📊 [FILTER CANDIDAT] Offres visibles: 15/16 (Statut: externe)

✅ [CAMPAIGN FILTER] "Nouvelle Offre Campagne 2" (Campagne 2) - Visible
🚫 [CAMPAIGN FILTER] "Ancienne Offre Campagne 1" (Campagne 1) - Masquée (Campagne historique)
📊 [FILTER CAMPAGNE] Offres visibles après filtrage campagne: 8/15

✅ [FINAL] Offres affichées: 8 offres

📊 [useApplications] Candidatures filtrées par campagne: 5/12
```

### **Pour un recruteur :**

```
👔 [fetchJobOffers] Mode recruteur : toutes les offres (actives et inactives)
📊 [FILTER NON-CANDIDAT] Toutes les offres visibles: 16 offres

✅ [FINAL] Offres affichées: 16 offres (toutes campagnes)
```

---

## 🎯 **Comportement attendu**

### **Candidats :**
- ✅ Voient **uniquement** les offres de la **Campagne 2**
- ❌ Ne voient **pas** les offres de la **Campagne 1**
- ✅ Voient uniquement leurs candidatures liées aux offres de **Campagne 2**

### **Recruteurs / Admins :**
- ✅ Voient **toutes** les offres (Campagne 1 + Campagne 2)
- ✅ Voient **toutes** les candidatures (toutes campagnes)
- ✅ Peuvent gérer les offres de toutes les campagnes

---

## 🔄 **Créer une nouvelle offre pour la Campagne 2**

Quand vous créez une nouvelle offre :

1. **Le système attribue automatiquement `campaign_id = 2`** (défaut)
2. L'offre sera **visible** pour les candidats
3. Aucune action supplémentaire requise

---

## 📝 **Fichiers créés/modifiés**

### **Nouveaux fichiers :**
1. `src/config/campaigns.ts` : Configuration des campagnes
2. `GESTION_CAMPAGNES_MULTIPLES.sql` : Script SQL pour la mise en place
3. `GUIDE_CAMPAGNES_MULTIPLES.md` : Ce guide

### **Fichiers modifiés :**
1. `src/hooks/useJobOffers.tsx` : Filtrage par campagne pour les offres
2. `src/hooks/useApplications.tsx` : Filtrage par campagne pour les candidatures

---

## 🚀 **Pour ajouter une Campagne 3 plus tard**

### **1. Modifier la configuration :**

```typescript
// src/config/campaigns.ts
export const CAMPAIGN_CONFIG = {
  ACTIVE_CAMPAIGN_ID: 3,
  HIDDEN_CAMPAIGNS: [1, 2],
  ALL_CAMPAIGNS: [1, 2, 3],
};
```

### **2. Mettre à jour les nouvelles offres :**

```sql
-- Mettre à jour le défaut pour les nouvelles offres
ALTER TABLE job_offers 
ALTER COLUMN campaign_id SET DEFAULT 3;

-- Marquer une offre existante comme Campagne 3
UPDATE job_offers
SET campaign_id = 3
WHERE id = 'uuid-de-l-offre';
```

### **3. Rafraîchir l'application**

Les candidats verront maintenant uniquement les offres de **Campagne 3** !

---

## ❓ **FAQ**

**Q : Que se passe-t-il si une offre n'a pas de `campaign_id` ?**  
R : Elle est visible par défaut pour tous les candidats.

**Q : Les recruteurs peuvent-ils voir les candidatures de la Campagne 1 ?**  
R : Oui, les recruteurs voient toutes les campagnes.

**Q : Comment identifier rapidement les offres par campagne ?**  
R : Dans le dashboard recruteur, vous pouvez ajouter un badge affichant le numéro de campagne.

---

✅ **Système de campagnes multiples opérationnel !**

