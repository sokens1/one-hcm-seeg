# 📚 Guide de Migration Supabase → Azure SQL Database

## 📦 Fichiers de Migration Fournis

| Fichier | Description | Usage |
|---------|-------------|-------|
| `DOCUMENTATION_MIGRATION_AZURE.md` | Documentation complète des tables et changements | Référence technique détaillée |
| `MIGRATION_AZURE_CHEATSHEET.md` | Aide-mémoire rapide | Consultation rapide |
| `MIGRATION_AZURE_COMPLETE.sql` | Script SQL complet de migration | **Exécuter en premier** |
| `MIGRATION_AZURE_FUNCTIONS.sql` | Fonctions et procédures stockées | Exécuter après le script complet |
| `MIGRATION_AZURE_README.md` | Ce fichier | Guide d'utilisation |

---

## 🚀 Procédure de Migration - Étapes

### Étape 1: Préparation (Azure Portal)

1. **Créer la base de données Azure SQL**
   - Niveau de service recommandé: Standard S2 minimum (pour les performances)
   - Activer "Row-Level Security" si disponible

2. **Configuration du firewall**
   - Autoriser votre IP
   - Configurer les règles d'accès

3. **Obtenir la chaîne de connexion**

### Étape 2: Backup de Sécurité

⚠️ **IMPORTANT:** Avant toute migration, faire un backup complet de la base source.

```bash
# Si vous avez déjà des données dans Azure, faire un backup
```

### Étape 3: Migration du Schéma de Base

Si vous partez de zéro, créez d'abord le schéma de base complet de Supabase avant d'appliquer les migrations.

**Option A:** Export/Import depuis Supabase
```bash
# Exporter depuis Supabase
pg_dump -h your-supabase-host -U postgres -d postgres > supabase_export.sql

# Adapter et importer vers Azure
# (nécessite conversion PostgreSQL → SQL Server)
```

**Option B:** Recréer manuellement les tables de base
- Référez-vous aux migrations dans `supabase/migrations/_backup_all/`

### Étape 4: Exécuter le Script de Migration Principal

```sql
-- Dans Azure Data Studio ou SQL Server Management Studio
-- Ouvrir et exécuter: MIGRATION_AZURE_COMPLETE.sql

-- Ce script va:
-- ✓ Ajouter toutes les colonnes manquantes
-- ✓ Migrer les données (campaign_id)
-- ✓ Créer tous les index de performance
-- ✓ Mettre à jour les contraintes

-- Durée estimée: 5-15 minutes (selon la taille des données)
```

### Étape 5: Exécuter les Fonctions et Procédures

```sql
-- Ouvrir et exécuter: MIGRATION_AZURE_FUNCTIONS.sql

-- Ce script va créer:
-- ✓ Triggers de validation
-- ✓ Procédures stockées pour access_requests
-- ✓ Fonctions utilitaires

-- Durée estimée: 2-5 minutes
```

### Étape 6: Vérifications Post-Migration

```sql
-- 1. Vérifier que toutes les offres ont un campaign_id
SELECT campaign_id, COUNT(*) as total 
FROM job_offers 
GROUP BY campaign_id;
-- ✓ Aucune valeur NULL ne devrait apparaître

-- 2. Vérifier les index créés
SELECT 
    t.name AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name IN ('users', 'job_offers', 'applications', 'access_requests', 
                 'protocol1_evaluations', 'protocol2_evaluations', 'documents')
ORDER BY t.name, i.name;
-- ✓ Vous devriez voir 35+ index

-- 3. Tester une insertion d'application
-- (test validation interne/externe)
```

---

## 🔍 Différences Importantes PostgreSQL → SQL Server

### Types de Données

| PostgreSQL | SQL Server | Notes |
|------------|------------|-------|
| `UUID` | `UNIQUEIDENTIFIER` | Même concept |
| `BOOLEAN` | `BIT` | 0 = false, 1 = true |
| `TEXT` | `NVARCHAR(MAX)` | Texte unicode |
| `TIMESTAMP WITH TIME ZONE` | `DATETIME2` ou `DATETIMEOFFSET` | Préférer DATETIMEOFFSET |
| `TEXT[]` (array) | `NVARCHAR(MAX)` (JSON) | Stocker en JSON |

### Fonctions SQL

| PostgreSQL | SQL Server | Équivalent |
|------------|------------|------------|
| `NOW()` | `GETDATE()` | Date/heure actuelle |
| `CURRENT_TIMESTAMP` | `GETDATE()` | Date/heure actuelle |
| `gen_random_uuid()` | `NEWID()` | Générer GUID |
| `COALESCE()` | `COALESCE()` | ✅ Identique |
| `RAISE EXCEPTION` | `RAISERROR()` ou `THROW` | Lever une erreur |

### Authentification

⚠️ **CRITIQUE:** Supabase utilise `auth.uid()` pour l'utilisateur connecté.

Dans Azure, vous devez:
- Implémenter votre propre système d'auth (JWT, sessions, Azure AD)
- Modifier les procédures stockées pour accepter `@user_id` en paramètre
- Gérer l'authentification au niveau de l'application

### Row-Level Security (RLS)

**Supabase (PostgreSQL):**
```sql
CREATE POLICY "recruiters_can_view" ON applications
FOR SELECT USING (...)
```

**Azure SQL (2 options):**

**Option 1:** Utiliser les prédicats de sécurité SQL Server 2016+
```sql
CREATE SECURITY POLICY ApplicationAccessPolicy
ADD FILTER PREDICATE dbo.fn_securitypredicate(user_id)
ON dbo.applications;
```

**Option 2:** Utiliser des vues avec filtres
```sql
CREATE VIEW v_applications_for_user AS
SELECT * FROM applications
WHERE [conditions selon rôle utilisateur]
```

---

## 🎯 Points Critiques à Valider

### ✅ Checklist Post-Migration

- [ ] Toutes les offres ont un `campaign_id` (1, 2 ou 3)
- [ ] Les index de performance sont créés (35+)
- [ ] Les contraintes CHECK fonctionnent (`interne`/`externe`)
- [ ] Le trigger de validation interne/externe fonctionne
- [ ] Les procédures `sp_reject_access_request` et `sp_approve_access_request` fonctionnent
- [ ] Le trigger `viewed = 0` sur nouvelles demandes fonctionne
- [ ] La contrainte CASCADE sur `application_documents` fonctionne
- [ ] Les performances des requêtes sont satisfaisantes
- [ ] L'authentification/autorisation est implémentée côté application
- [ ] Les tests d'insertion/mise à jour passent

---

## 🔧 Dépannage

### Problème: "Invalid object name 'table_name'"
**Solution:** La table n'existe pas. Vérifiez que le schéma de base est créé.

### Problème: "The INSERT statement conflicted with the CHECK constraint"
**Solution:** Vérifiez que les valeurs sont bien `'interne'` ou `'externe'` (en minuscules).

### Problème: Index déjà existant
**Solution:** Les scripts utilisent `IF NOT EXISTS`. Si l'erreur persiste, commentez la ligne d'index.

### Problème: Performance lente
**Solution:** 
1. Exécutez `UPDATE STATISTICS` sur toutes les tables
2. Vérifiez que tous les index sont créés
3. Analysez les plans d'exécution des requêtes lentes

### Problème: Les triggers ne fonctionnent pas
**Solution:** SQL Server utilise `INSTEAD OF` au lieu de `BEFORE`. Vérifiez le script des triggers.

---

## 📞 Support et Questions

### Documentation Complète
Consultez `DOCUMENTATION_MIGRATION_AZURE.md` pour:
- Description détaillée de chaque table
- Liste complète des colonnes ajoutées
- Règles métier
- Index et contraintes

### Aide-Mémoire Rapide
Consultez `MIGRATION_AZURE_CHEATSHEET.md` pour:
- Commandes SQL rapides
- Liste des colonnes à ajouter
- Index essentiels

### Fichiers Sources
Les migrations Supabase originales sont dans:
```
supabase/migrations/
```

Migrations les plus importantes:
- `20251012000006_assign_campaign_id_to_existing_jobs.sql`
- `20251014000001_optimize_database_indexes.sql`
- `20251013000002_fix_recruiter_access_all_applications.sql`
- `20251008141536_add_internal_external_audience.sql`
- `20250110000003_add_viewed_to_access_requests.sql`

---

## 🎉 Après la Migration

Une fois la migration réussie:

1. **Tester en développement** pendant quelques jours
2. **Monitorer les performances** (temps de requête, utilisation disque)
3. **Vérifier les logs** pour détecter toute erreur
4. **Ajuster les index** si nécessaire selon les patterns d'utilisation
5. **Planifier la migration en production**

---

## 📊 Statistiques Attendues

Après migration complète, vous devriez avoir:

| Élément | Quantité |
|---------|----------|
| Tables modifiées | 9+ |
| Colonnes ajoutées | 11+ |
| Index créés | 35+ |
| Triggers | 2 |
| Procédures stockées | 4 |
| Contraintes CHECK | 5 |

---

**Bon courage avec la migration ! 🚀**

*Dernière mise à jour: Octobre 2025*

