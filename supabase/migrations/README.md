# Scripts de Migration Supabase

## 📋 Scripts disponibles

### 1. `create_candidate_ai_evaluations_table_simple.sql` ✅ **OBLIGATOIRE**
**À exécuter en premier !**

Ce script crée la table et les index nécessaires pour le cache des évaluations IA.

**Exécution :**
1. Ouvrez votre dashboard Supabase
2. Allez dans l'éditeur SQL
3. Copiez-collez le contenu de ce fichier
4. Exécutez le script

**Ce qui est créé :**
- Table `candidate_ai_evaluations`
- Index sur `candidate_id`, `job_id`, et `created_at`
- Contrainte unique sur `(candidate_id, job_id)`

---

### 2. `add_trigger_updated_at.sql` ⚠️ **OPTIONNEL**
**Peut être ignoré si timeout**

Ce script ajoute un trigger pour mettre à jour automatiquement `updated_at` lors des modifications.

**⚠️ IMPORTANT :** Ce script est **vraiment optionnel** ! Le code TypeScript met déjà à jour `updated_at` manuellement. Si ce script cause un timeout, **ignorez-le complètement** - tout fonctionnera quand même.

**Si vous voulez quand même l'exécuter :**
1. Exécutez-le après le script simple
2. Si timeout, pas de problème - ignorez-le

---

## ✅ Vérification

Après avoir exécuté le script simple, vérifiez que la table existe :

```sql
SELECT * FROM candidate_ai_evaluations LIMIT 1;
```

Si cette requête fonctionne, tout est bon ! 🎉

---

## 🐛 Problèmes courants

### Timeout sur le script simple
- Vérifiez votre connexion
- Essayez d'exécuter les commandes une par une dans l'éditeur SQL

### Timeout sur le script trigger
- **Pas grave !** Le trigger est optionnel
- Le code fonctionne sans lui
- Ignorez simplement ce script

### Erreur "relation already exists"
- La table existe déjà
- C'est normal, vous pouvez continuer

