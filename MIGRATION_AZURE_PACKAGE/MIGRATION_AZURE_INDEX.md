# 📁 Index - Documentation Migration Azure

**Projet:** Talent Flow Gabon  
**Migration:** Supabase (PostgreSQL) → Azure SQL Database  
**Date:** Octobre 2025

---

## 🎯 Démarrage Rapide

### Pour Commencer MAINTENANT:
1. 📖 Lire **[MIGRATION_AZURE_README.md](MIGRATION_AZURE_README.md)** (5 min)
2. ⚡ Exécuter **[MIGRATION_AZURE_COMPLETE.sql](MIGRATION_AZURE_COMPLETE.sql)** (10 min)
3. ⚡ Exécuter **[MIGRATION_AZURE_FUNCTIONS.sql](MIGRATION_AZURE_FUNCTIONS.sql)** (5 min)
4. ✅ Valider avec la checklist dans le README

---

## 📚 Documentation Complète

### 1. 📖 Documentation Technique Détaillée
**Fichier:** [DOCUMENTATION_MIGRATION_AZURE.md](DOCUMENTATION_MIGRATION_AZURE.md)

**Contenu:**
- Description complète de toutes les tables modifiées
- Liste exhaustive des colonnes ajoutées
- Index de performance (35+)
- Politiques RLS et règles métier
- Points critiques pour la migration
- Scripts de vérification post-migration

**Quand l'utiliser:** 
- Pour comprendre en profondeur les changements
- Référence technique lors du développement
- Documentation pour l'équipe

**Temps de lecture:** 15-20 minutes

---

### 2. ⚡ Aide-Mémoire Rapide
**Fichier:** [MIGRATION_AZURE_CHEATSHEET.md](MIGRATION_AZURE_CHEATSHEET.md)

**Contenu:**
- Résumé des colonnes à ajouter par table
- Index critiques (liste courte)
- Commandes SQL essentielles
- Ordre d'exécution des étapes

**Quand l'utiliser:**
- Consultation rapide pendant la migration
- Rappel des commandes importantes
- Vérification rapide

**Temps de lecture:** 3-5 minutes

---

### 3. 🚀 Guide de Migration Étape par Étape
**Fichier:** [MIGRATION_AZURE_README.md](MIGRATION_AZURE_README.md)

**Contenu:**
- Procédure complète de migration
- Checklist de validation
- Différences PostgreSQL ↔ SQL Server
- Section dépannage
- Support et ressources

**Quand l'utiliser:**
- **À LIRE EN PREMIER**
- Guide principal lors de la migration
- Référence pour le dépannage

**Temps de lecture:** 10-15 minutes

---

## 💾 Scripts SQL

### 4. 🔧 Script de Migration Principal
**Fichier:** [MIGRATION_AZURE_COMPLETE.sql](MIGRATION_AZURE_COMPLETE.sql)

**Contenu:**
- Ajout de toutes les colonnes manquantes
- Migration des données (campaign_id)
- Création de tous les index (35+)
- Mise à jour des contraintes
- Rapport de vérification automatique

**Exécution:**
```sql
-- Dans Azure Data Studio ou SSMS
-- Durée: 5-15 minutes selon taille données
```

**⚠️ IMPORTANT:** Exécuter en PREMIER (après avoir le schéma de base)

---

### 5. 🔧 Script des Fonctions et Procédures
**Fichier:** [MIGRATION_AZURE_FUNCTIONS.sql](MIGRATION_AZURE_FUNCTIONS.sql)

**Contenu:**
- Triggers de validation (interne/externe)
- Procédures stockées (access_requests)
- Fonctions utilitaires
- Notes sur les différences PostgreSQL/SQL Server

**Exécution:**
```sql
-- Après MIGRATION_AZURE_COMPLETE.sql
-- Durée: 2-5 minutes
```

---

## 📊 Tableaux de Référence

### Tables Modifiées (9)

| # | Table | Colonnes ajoutées | Index | Priorité |
|---|-------|-------------------|-------|----------|
| 1 | `users` | 2 | 4 | 🔴 Haute |
| 2 | `job_offers` | 2 | 3 | 🔴 Critique |
| 3 | `applications` | 2 | 5 | 🔴 Critique |
| 4 | `documents` | 0 | 2 | 🟡 Moyenne |
| 5 | `protocol1_evaluations` | 0 | 3 | 🟡 Moyenne |
| 6 | `protocol2_evaluations` | 3 | 4 | 🟡 Moyenne |
| 7 | `access_requests` | 2 | 3 | 🟢 Normale |
| 8 | `interview_slots` | 0 | 3 | 🟢 Normale |
| 9 | `email_logs` | 0 | 3 | 🟢 Normale |

### Colonnes Critiques Ajoutées (11)

| Colonne | Table | Type | Obligatoire | Impact |
|---------|-------|------|-------------|--------|
| `campaign_id` | job_offers | INTEGER | ✅ Oui | 🔴 Critique |
| `candidate_status` | users | TEXT | ❌ Non | 🔴 Important |
| `status_offers` | job_offers | TEXT | ❌ Non | 🔴 Important |
| `candidature_status` | applications | TEXT | ❌ Non | 🔴 Important |
| `has_been_manager` | applications | BOOLEAN | ❌ Non | 🟡 Moyen |
| `viewed` | access_requests | BOOLEAN | ✅ Oui | 🟡 Moyen |
| `rejection_reason` | access_requests | TEXT | ❌ Non | 🟡 Moyen |
| `simulation_date` | protocol2_evaluations | DATE | ❌ Non | 🟢 Normal |
| `simulation_time` | protocol2_evaluations | TIME | ❌ Non | 🟢 Normal |
| `simulation_scheduled_at` | protocol2_evaluations | TIMESTAMP | ❌ Non | 🟢 Normal |
| `matricule` | users | TEXT | ❌ Non | 🟢 Normal |

---

## 🎯 Parcours Recommandés

### Parcours 1: "Je veux migrer MAINTENANT"
1. ✅ Lire **README** (section démarrage rapide)
2. ✅ Exécuter **COMPLETE.sql**
3. ✅ Exécuter **FUNCTIONS.sql**
4. ✅ Valider avec la checklist
5. ✅ Consulter **CHEATSHEET** pour vérifications

**Temps total:** ~30-45 minutes

---

### Parcours 2: "Je veux comprendre avant de migrer"
1. ✅ Lire **DOCUMENTATION** complète
2. ✅ Lire **README** entièrement
3. ✅ Consulter **CHEATSHEET**
4. ✅ Analyser **COMPLETE.sql** (ne pas exécuter encore)
5. ✅ Analyser **FUNCTIONS.sql**
6. ✅ Faire un backup de la BDD
7. ✅ Exécuter les scripts
8. ✅ Valider

**Temps total:** ~1h30-2h

---

### Parcours 3: "J'ai un problème après migration"
1. ✅ Consulter section **Dépannage** dans README
2. ✅ Vérifier checklist de validation
3. ✅ Consulter **DOCUMENTATION** pour la table concernée
4. ✅ Vérifier les logs de transaction SQL
5. ✅ Consulter les migrations sources dans `supabase/migrations/`

---

## 📞 Ressources Supplémentaires

### Migrations Supabase Sources
```
supabase/migrations/20251012000006_assign_campaign_id_to_existing_jobs.sql
supabase/migrations/20251014000001_optimize_database_indexes.sql
supabase/migrations/20251013000002_fix_recruiter_access_all_applications.sql
supabase/migrations/20251008141536_add_internal_external_audience.sql
supabase/migrations/20250110000003_add_viewed_to_access_requests.sql
```

### Documentation Externe
- [Azure SQL Database Documentation](https://docs.microsoft.com/azure/sql-database/)
- [PostgreSQL to SQL Server Migration Guide](https://docs.microsoft.com/sql/ssma/postgresql/)

---

## 📈 Statistiques de Migration

### Éléments à Migrer
- ✅ 9 tables modifiées
- ✅ 11 colonnes ajoutées
- ✅ 35+ index créés
- ✅ 2 triggers créés
- ✅ 4 procédures stockées
- ✅ 5 contraintes CHECK

### Temps Estimés
- Lecture documentation: 30-45 min
- Exécution scripts: 15-25 min
- Validation: 10-15 min
- **Total: 1h-1h30**

---

## ✅ Checklist Finale

### Avant Migration
- [ ] Backup de la BDD source (Supabase)
- [ ] Backup de la BDD cible (Azure) si elle contient des données
- [ ] Connexion Azure SQL fonctionnelle
- [ ] Permissions suffisantes (CREATE TABLE, CREATE INDEX, etc.)
- [ ] Lecture du README complet

### Pendant Migration
- [ ] Exécution MIGRATION_AZURE_COMPLETE.sql réussie
- [ ] Exécution MIGRATION_AZURE_FUNCTIONS.sql réussie
- [ ] Aucune erreur dans les logs
- [ ] Rapport de migration affiché correctement

### Après Migration
- [ ] Toutes les offres ont un campaign_id
- [ ] 35+ index créés et visibles
- [ ] Triggers fonctionnels (test insertion)
- [ ] Procédures stockées accessibles
- [ ] Tests d'intégration passent
- [ ] Performances acceptables

---

## 🎉 Conclusion

Vous disposez maintenant de:
- 📚 Documentation complète et professionnelle
- ⚡ Scripts SQL prêts à l'emploi
- 🔧 Procédures et fonctions adaptées
- 📖 Guides étape par étape
- 🆘 Section dépannage

**Bonne migration ! 🚀**

---

**Dernière mise à jour:** 15 Octobre 2025  
**Version:** 1.0  
**Auteur:** Documentation générée pour le projet Talent Flow Gabon

