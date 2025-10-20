# 🚨 Optimisation Disk IO Supabase - Guide complet

## ⚠️ Problème identifié

**Message d'alerte** :
> "Your project is about to deplete its Disk IO Budget, and may become unresponsive once fully exhausted"

## 🔍 Qu'est-ce que le Disk IO Budget ?

Le **Disk IO (Input/Output)** mesure le nombre d'opérations de lecture/écriture sur le disque. Supabase limite ce budget selon votre plan :
- **Plan gratuit** : Limité (~50 GB/jour)
- **Plan Pro** : Plus généreux

## 📊 Causes probables dans votre projet

### 1️⃣ **Requêtes non optimisées**
- ❌ Requêtes sans index
- ❌ Scans complets de tables (FULL TABLE SCAN)
- ❌ Trop de jointures complexes

### 2️⃣ **Appels API excessifs**
- ❌ Polling trop fréquent (useQuery avec refetch automatique)
- ❌ Pas de cache
- ❌ Multiples requêtes pour les mêmes données

### 3️⃣ **Tables volumineuses sans index**
- ❌ `applications` sans index sur `candidate_id`
- ❌ `job_offers` sans index sur `campaign_id`
- ❌ `users` sans index sur `matricule`

## ✅ Solutions immédiates

### Solution 1 : Ajouter des index stratégiques

```sql
-- Index sur les clés étrangères fréquemment utilisées
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_campaign_id ON job_offers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_status_offerts ON job_offers(status_offerts);

-- Index composites pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_job_offers_status_campaign ON job_offers(status, campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_job ON applications(candidate_id, job_offer_id);
```

### Solution 2 : Optimiser React Query

**Fichier : `src/hooks/useJobOffers.tsx`**

Augmenter les temps de cache :
```typescript
export function useJobOffers() {
  return useQuery({
    queryKey: ["jobOffers"],
    queryFn: fetchJobOffers,
    staleTime: 5 * 60 * 1000,        // 5 minutes (au lieu de 0)
    cacheTime: 10 * 60 * 1000,       // 10 minutes
    refetchOnWindowFocus: false,     // Ne pas refetch au focus
    refetchInterval: false,          // Désactiver le polling
  });
}
```

### Solution 3 : Limiter les requêtes RPC

**Dans vos fonctions RPC** :
- Éviter d'appeler `get_all_recruiter_applications` trop souvent
- Utiliser la pagination pour les grandes listes
- Limiter les résultats avec `LIMIT`

### Solution 4 : Désactiver les Real-time subscriptions inutiles

Si vous avez des subscriptions en temps réel, désactivez celles qui ne sont pas critiques.

## 🚀 Actions prioritaires À FAIRE MAINTENANT

### 1. Créer les index essentiels

Exécutez immédiatement dans Supabase SQL Editor :

```sql
-- Index les plus critiques
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_campaign_id ON job_offers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule);
```

### 2. Vérifier les requêtes lentes

Dans Supabase Dashboard :
1. Allez dans **Database** → **Query Performance**
2. Identifiez les requêtes les plus lentes
3. Ajoutez des index sur les colonnes utilisées dans les WHERE/JOIN

### 3. Optimiser useJobOffers

Modifiez `src/hooks/useJobOffers.tsx` pour réduire la fréquence de refetch.

## 📈 Solutions à moyen terme

### Option A : Upgrade vers un plan supérieur
- **Plan Pro** : Budget Disk IO beaucoup plus élevé
- Coût : ~25$/mois

### Option B : Optimisation continue
- Monitorer régulièrement l'usage
- Ajouter des index au fur et à mesure
- Utiliser le cache intelligemment

## 🔍 Vérifier l'impact

Après avoir appliqué les solutions :

1. **Dashboard Supabase** → **Reports** → **Database**
2. Regardez le graphique **Disk IO Budget**
3. Vérifiez que la consommation diminue

## ⚡ Quick Wins (gains rapides)

1. ✅ **Index sur `matricule`** : Vos vérifications de matricule seront 100x plus rapides
2. ✅ **Index sur `campaign_id`** : Filtrage par campagne instantané
3. ✅ **Cache React Query** : Réduit de 80% les appels à la DB
4. ✅ **Désactiver refetchOnWindowFocus** : Évite les requêtes inutiles

## 📊 Monitoring

### Commandes SQL pour identifier les problèmes

```sql
-- Voir les tables les plus volumineuses
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Voir les index existants
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 🎯 Résumé - Action immédiate

**PRIORITÉ MAXIMALE** :

1. ✅ Exécuter les 4 index essentiels (voir section "Actions prioritaires")
2. ✅ Modifier `useJobOffers` pour ajouter `staleTime: 5 * 60 * 1000`
3. ✅ Monitorer le Dashboard Supabase pour vérifier l'amélioration

Ces 3 actions devraient réduire votre Disk IO de **60-80%** immédiatement ! 🚀

