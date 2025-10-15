# 📦 PACKAGE DE MIGRATION AZURE SQL DATABASE

**Projet:** Talent Flow Gabon  
**Version:** 1.0  
**Date:** 15 Octobre 2025

---

## 🎯 CONTENU DU PACKAGE

Ce package contient **tous les fichiers nécessaires** pour migrer la base de données Supabase (PostgreSQL) vers Azure SQL Database.

### 📁 8 Fichiers Inclus

| # | Fichier | Type | Taille | Description |
|---|---------|------|--------|-------------|
| 1 | `_LIRE_MOI_MIGRATION_AZURE.md` | Doc | 12 KB | **⭐ POINT D'ENTRÉE** - Commencer par ce fichier |
| 2 | `MIGRATION_AZURE_README.md` | Doc | 8 KB | **Guide principal** - Procédure étape par étape |
| 3 | `MIGRATION_AZURE_INDEX.md` | Doc | 8 KB | Navigation et index complet |
| 4 | `DOCUMENTATION_MIGRATION_AZURE.md` | Doc | 10 KB | Documentation technique détaillée |
| 5 | `MIGRATION_AZURE_CHEATSHEET.md` | Doc | 4 KB | Aide-mémoire rapide |
| 6 | `MIGRATION_AZURE_SCHEMA.md` | Doc | 17 KB | Schéma et relations des tables |
| 7 | `MIGRATION_AZURE_COMPLETE.sql` | SQL | 15 KB | **Script principal de migration** ⚠️ |
| 8 | `MIGRATION_AZURE_FUNCTIONS.sql` | SQL | 13 KB | Fonctions et procédures stockées |

**Taille totale:** ~87 KB (~25 KB compressé)

---

## 🚀 DÉMARRAGE RAPIDE (30 MINUTES)

### Étape 1️⃣ : Lire la Documentation
```
Ouvrir : _LIRE_MOI_MIGRATION_AZURE.md
Temps  : 5-10 minutes
```

### Étape 2️⃣ : Suivre le Guide Principal
```
Ouvrir : MIGRATION_AZURE_README.md
Temps  : 10 minutes
```

### Étape 3️⃣ : Exécuter les Scripts SQL
```
1. Ouvrir Azure Data Studio ou SQL Server Management Studio
2. Exécuter : MIGRATION_AZURE_COMPLETE.sql
   Durée   : 5-15 minutes
3. Exécuter : MIGRATION_AZURE_FUNCTIONS.sql
   Durée   : 2-5 minutes
```

### Étape 4️⃣ : Valider
```
Suivre la checklist de validation dans le README
Temps : 5-10 minutes
```

---

## 📊 CE QUI SERA MIGRÉ

### Tables Modifiées : 9
- `users` (statut candidat interne/externe)
- `job_offers` (campaign_id + audience)
- `applications` (validation + manager)
- `access_requests` (système viewed + rejection)
- `protocol2_evaluations` (dates simulation)
- Et 4 autres...

### Éléments Ajoutés
- ✅ **11 nouvelles colonnes** (dont campaign_id ⚠️ CRITIQUE)
- ✅ **35+ index** de performance
- ✅ **2 triggers** de validation
- ✅ **4 procédures stockées**
- ✅ **5 contraintes CHECK**

---

## ⚠️ PRÉREQUIS

Avant de commencer :
- [ ] Accès administrateur à Azure SQL Database
- [ ] Azure Data Studio ou SSMS installé
- [ ] Backup de la base de données Supabase effectué
- [ ] Backup d'Azure (si données existantes)
- [ ] 1-2 heures disponibles pour la migration

---

## 🗺️ PARCOURS RECOMMANDÉS

### Pour un Développeur Backend (Exécutant)
1. Lire `_LIRE_MOI_MIGRATION_AZURE.md` (5 min)
2. Lire `MIGRATION_AZURE_README.md` (10 min)
3. Avoir `MIGRATION_AZURE_CHEATSHEET.md` ouvert (référence)
4. Exécuter les 2 scripts SQL (15-20 min)
5. Valider avec la checklist (10 min)

**Durée totale : 40-50 minutes**

### Pour un Architecte/Lead Dev (Revue)
1. Lire `DOCUMENTATION_MIGRATION_AZURE.md` (20 min)
2. Lire `MIGRATION_AZURE_SCHEMA.md` (15 min)
3. Analyser `MIGRATION_AZURE_COMPLETE.sql` (20 min)
4. Analyser `MIGRATION_AZURE_FUNCTIONS.sql` (15 min)
5. Valider l'approche technique

**Durée totale : 1h10-1h30**

---

## 🎯 POINTS CRITIQUES À NE PAS MANQUER

### 🔴 CRITIQUE
- **Campaign ID** : Toutes les offres DOIVENT avoir un `campaign_id` (1, 2 ou 3)
- **Backup** : TOUJOURS faire un backup avant d'exécuter les scripts
- **Index** : Les 35+ index DOIVENT être créés pour les performances

### 🟡 IMPORTANT
- Validation interne/externe (trigger automatique)
- Cascade delete sur documents
- Procédures access_requests

### 🟢 RECOMMANDÉ
- Tester en dev avant prod
- Monitorer les performances
- Documenter les problèmes

---

## 📞 SUPPORT

### En Cas de Problème
1. Consulter section **Dépannage** dans `MIGRATION_AZURE_README.md`
2. Vérifier la cohérence avec `MIGRATION_AZURE_SCHEMA.md`
3. Consulter les migrations sources dans le projet principal :
   ```
   supabase/migrations/
   ```

### Migrations Sources Importantes
- `20251012000006_assign_campaign_id_to_existing_jobs.sql`
- `20251014000001_optimize_database_indexes.sql`
- `20251013000002_fix_recruiter_access_all_applications.sql`
- `20251008141536_add_internal_external_audience.sql`

---

## ✅ CHECKLIST FINALE

### Avant Migration
- [ ] Documentation lue
- [ ] Backup effectué
- [ ] Permissions vérifiées
- [ ] Outils installés

### Après Migration
- [ ] Aucune erreur dans les logs
- [ ] Toutes les offres ont un campaign_id
- [ ] 35+ index créés
- [ ] Triggers fonctionnels
- [ ] Procédures accessibles
- [ ] Tests d'intégration passent

---

## 📈 RÉSULTATS ATTENDUS

Après une migration réussie :
- ⏱️ Temps de requête : < 200ms (liste applications)
- 📊 Offres sans campaign_id : 0
- 🔍 Index créés : 35+
- ✅ Tests d'intégration : 100% passent
- 🚫 Erreurs logs : 0

---

## 🎉 PRÊT À COMMENCER ?

**Première action :** Ouvrir `_LIRE_MOI_MIGRATION_AZURE.md`

**Bon courage avec la migration ! 🚀**

---

**Package créé le :** 15 Octobre 2025  
**Pour :** Développeur Backend - Migration Azure  
**Projet :** Talent Flow Gabon - One HCM  
**Contact :** Voir documentation interne du projet

