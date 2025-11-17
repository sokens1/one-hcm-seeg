# Système de Cache des Évaluations IA

## 📋 Description

Ce système permet d'économiser des crédits en évitant les appels répétés à l'API d'analyse IA coûteuse. Les résultats d'évaluation sont sauvegardés en base de données Supabase et réutilisés pour les consultations suivantes.

## 🏗️ Architecture

### 1. Table Supabase : `candidate_ai_evaluations`

Structure de la table :
- `id` : UUID (clé primaire)
- `candidate_id` : TEXT (ID du candidat)
- `job_id` : TEXT (ID du poste/offre)
- `evaluation_data` : JSONB (résultats complets de l'évaluation)
- `threshold_pct` : INTEGER (seuil d'acceptation utilisé)
- `hold_threshold_pct` : INTEGER (seuil de mise en attente utilisé)
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

**Contrainte unique** : Un seul résultat par combinaison `(candidate_id, job_id)`

### 2. Service de Cache : `candidateEvaluationCache.ts`

Fonctions principales :
- `getCachedEvaluation(candidateId, jobId)` : Récupère une évaluation en cache
- `saveCachedEvaluation(candidateId, jobId, evaluationData, ...)` : Sauvegarde une évaluation

### 3. Modification de `evaluateCandidate()`

Le flux est maintenant :
1. **Vérification en base** : Cherche d'abord si une évaluation existe déjà
2. **Si trouvé** : Retourne les données de la base (économie de crédits ✅)
3. **Si non trouvé** : Appelle l'API d'analyse IA (logique originale conservée)
4. **Sauvegarde** : Enregistre automatiquement le résultat en base pour les prochaines fois

## 🚀 Installation

### Étape 1 : Créer la table dans Supabase

Exécutez le script SQL dans votre dashboard Supabase :

```sql
-- Voir le fichier : supabase/migrations/create_candidate_ai_evaluations_table.sql
```

Ou via l'éditeur SQL de Supabase :
1. Allez dans votre projet Supabase
2. Ouvrez l'éditeur SQL
3. Copiez-collez le contenu du fichier SQL
4. Exécutez le script

### Étape 2 : Vérifier les variables d'environnement

Assurez-vous que ces variables sont configurées :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Étape 3 : C'est tout !

Le système fonctionne automatiquement. Aucune modification du front-end n'est nécessaire.

## 📊 Fonctionnement

### Premier appel (pas de cache)
```
Candidat A + Poste X
  ↓
Vérification en base → ❌ Non trouvé
  ↓
Appel API d'analyse IA → 💰 Coûte des crédits
  ↓
Sauvegarde en base → 💾
  ↓
Retour des résultats
```

### Appels suivants (avec cache)
```
Candidat A + Poste X
  ↓
Vérification en base → ✅ Trouvé !
  ↓
Retour des résultats depuis la base → 💰 Économie de crédits !
```

## 🔧 Configuration

### Forcer un nouvel appel API (ignorer le cache)

Si vous devez forcer un nouvel appel API (par exemple, si les données du candidat ont changé), vous pouvez :

1. **Supprimer manuellement** l'entrée dans Supabase :
```sql
DELETE FROM candidate_ai_evaluations 
WHERE candidate_id = 'candidate_id' AND job_id = 'job_id';
```

2. **Modifier le code** pour ajouter un paramètre `forceRefresh` (non implémenté actuellement)

## 📝 Notes importantes

- ✅ **Format de réponse identique** : Le front-end n'a besoin d'aucune modification
- ✅ **Logique API conservée** : Le code d'appel API est toujours présent (commenté si besoin)
- ✅ **Non bloquant** : Si la sauvegarde en base échoue, l'évaluation fonctionne quand même
- ✅ **Performance** : Les index sur `candidate_id` et `job_id` assurent des recherches rapides

## 🐛 Dépannage

### Le cache ne fonctionne pas

1. Vérifiez que la table existe dans Supabase
2. Vérifiez les variables d'environnement Supabase
3. Consultez les logs de la console pour voir les messages `[Evaluation Cache]`

### Erreur "PGRST116"

C'est normal ! Cela signifie "no rows found" - le candidat n'a pas encore été évalué pour ce poste.

### Les résultats ne sont pas sauvegardés

- Vérifiez que `job_id` n'est pas vide
- Vérifiez les permissions RLS (Row Level Security) dans Supabase
- Consultez les logs pour voir les erreurs de sauvegarde

## 💡 Améliorations futures possibles

- [ ] Ajouter un paramètre `forceRefresh` pour forcer un nouvel appel API
- [ ] Ajouter une expiration automatique des caches (ex: après 30 jours)
- [ ] Interface admin pour gérer le cache
- [ ] Statistiques d'économie de crédits

