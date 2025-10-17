# 📦 DOCUMENTATION MIGRATION AZURE - PACKAGE COMPLET

**Projet:** Talent Flow Gabon  
**Date:** 15 Octobre 2025  
**Version:** 1.0

---

## 🎯 DÉMARRAGE RAPIDE

### Pour migrer IMMÉDIATEMENT (30 minutes):

1. **Ouvrir:** `MIGRATION_AZURE_README.md`
2. **Exécuter:** `MIGRATION_AZURE_COMPLETE.sql` dans Azure Data Studio
3. **Exécuter:** `MIGRATION_AZURE_FUNCTIONS.sql` dans Azure Data Studio
4. **Valider** avec la checklist dans le README

✅ **C'EST TOUT !**

---

## 📁 FICHIERS CRÉÉS (7 fichiers)

### 📖 Documentation

| # | Fichier | Type | Pages | Objectif |
|---|---------|------|-------|----------|
| 1 | **MIGRATION_AZURE_INDEX.md** | Index | 📄📄 | Point d'entrée, navigation |
| 2 | **MIGRATION_AZURE_README.md** | Guide | 📄📄📄 | Guide complet étape par étape |
| 3 | **DOCUMENTATION_MIGRATION_AZURE.md** | Référence | 📄📄📄📄 | Documentation technique détaillée |
| 4 | **MIGRATION_AZURE_CHEATSHEET.md** | Aide-mémoire | 📄 | Référence rapide |
| 5 | **MIGRATION_AZURE_SCHEMA.md** | Schéma | 📄📄📄 | Structure et relations des tables |

### 💾 Scripts SQL

| # | Fichier | Type | Lignes | Objectif |
|---|---------|------|--------|----------|
| 6 | **MIGRATION_AZURE_COMPLETE.sql** | Script | ~400 | Migration complète automatique |
| 7 | **MIGRATION_AZURE_FUNCTIONS.sql** | Script | ~350 | Fonctions et procédures stockées |

### 📋 Fichiers de Navigation

| # | Fichier | Objectif |
|---|---------|----------|
| 8 | **_LIRE_MOI_MIGRATION_AZURE.md** | Ce fichier - Point d'entrée |

---

## 🗺️ GUIDE D'UTILISATION PAR RÔLE

### 👨‍💼 Chef de Projet / Manager

**Fichiers à consulter:**
1. `_LIRE_MOI_MIGRATION_AZURE.md` (ce fichier)
2. `MIGRATION_AZURE_INDEX.md` (vue d'ensemble)

**Temps requis:** 10 minutes

**Informations obtenues:**
- Vue d'ensemble de la migration
- Temps estimés
- Ressources nécessaires
- Risques et points critiques

---

### 👨‍💻 Développeur Backend (Exécutant)

**Fichiers à consulter dans l'ordre:**
1. `MIGRATION_AZURE_README.md` ⭐ **COMMENCER ICI**
2. `MIGRATION_AZURE_CHEATSHEET.md` (référence rapide)
3. `DOCUMENTATION_MIGRATION_AZURE.md` (en cas de doute)

**Scripts à exécuter dans l'ordre:**
1. `MIGRATION_AZURE_COMPLETE.sql` ⚠️ **CRITIQUE**
2. `MIGRATION_AZURE_FUNCTIONS.sql`

**Temps requis:** 45-60 minutes

---

### 🔍 Architecte / Lead Dev (Revue)

**Fichiers à consulter:**
1. `DOCUMENTATION_MIGRATION_AZURE.md` (détails techniques)
2. `MIGRATION_AZURE_SCHEMA.md` (structure BDD)
3. `MIGRATION_AZURE_COMPLETE.sql` (revue code)
4. `MIGRATION_AZURE_FUNCTIONS.sql` (revue code)

**Temps requis:** 1h30-2h

**Objectifs:**
- Valider l'approche technique
- Vérifier la cohérence architecturale
- Identifier les risques potentiels

---

## 📊 CONTENU DÉTAILLÉ PAR FICHIER

### 1. MIGRATION_AZURE_INDEX.md
**Type:** Point d'entrée + navigation  
**Contenu:**
- Table des matières interactive
- Parcours recommandés selon profil
- Tableaux de référence rapide
- Checklist complète

**Quand l'utiliser:** Premier fichier à consulter pour s'orienter

---

### 2. MIGRATION_AZURE_README.md ⭐
**Type:** Guide principal  
**Contenu:**
- Procédure de migration étape par étape
- Différences PostgreSQL ↔ SQL Server
- Section dépannage détaillée
- Checklist de validation
- Exemples d'utilisation

**Quand l'utiliser:** Guide principal lors de la migration

---

### 3. DOCUMENTATION_MIGRATION_AZURE.md
**Type:** Documentation technique complète  
**Contenu:**
- Description de chaque table modifiée
- Liste exhaustive des colonnes ajoutées
- Tous les index (35+) avec justification
- Politiques RLS et règles métier
- Scripts de vérification SQL

**Quand l'utiliser:** 
- Référence durant le développement
- Documentation pour l'équipe
- Maintenance future

---

### 4. MIGRATION_AZURE_CHEATSHEET.md
**Type:** Aide-mémoire rapide  
**Contenu:**
- Résumé colonnes par table
- Index critiques uniquement
- Commandes SQL essentielles
- Ordre d'exécution

**Quand l'utiliser:**
- Consultation rapide pendant migration
- Rappel commandes
- Vérification post-migration

---

### 5. MIGRATION_AZURE_SCHEMA.md
**Type:** Schéma de base de données  
**Contenu:**
- Diagrammes ASCII des tables
- Relations entre tables
- Flux de données
- Contraintes de cohérence
- Requêtes utiles

**Quand l'utiliser:**
- Comprendre la structure globale
- Visualiser les relations
- Planifier requêtes complexes

---

### 6. MIGRATION_AZURE_COMPLETE.sql ⚠️
**Type:** Script SQL principal  
**Contenu:**
- Ajout de 11 colonnes
- Migration données (campaign_id)
- Création de 35+ index
- Mise à jour contraintes
- Rapport automatique

**Exécution:** 
- **PREMIER** script à exécuter
- Durée: 5-15 minutes
- Transaction sécurisée (rollback si erreur)

---

### 7. MIGRATION_AZURE_FUNCTIONS.sql
**Type:** Script SQL fonctions  
**Contenu:**
- 2 triggers (validation, viewed)
- 4 procédures stockées
- 1 fonction utilitaire
- Notes adaptations PostgreSQL → SQL Server

**Exécution:**
- **APRÈS** MIGRATION_AZURE_COMPLETE.sql
- Durée: 2-5 minutes

---

## 🎯 RÉSUMÉ DE LA MIGRATION

### Modifications Apportées

#### Tables Modifiées: 9
1. `users` - Statut candidat (interne/externe)
2. `job_offers` - Campaign ID + audience
3. `applications` - Validation + manager
4. `documents` - Cascade delete
5. `protocol1_evaluations` - Index
6. `protocol2_evaluations` - Dates simulation
7. `access_requests` - Système viewed + rejection
8. `interview_slots` - Index
9. `email_logs` - Index

#### Colonnes Ajoutées: 11
- `users.candidate_status` (interne|externe)
- `users.matricule` (employés internes)
- `job_offers.campaign_id` ⚠️ **CRITIQUE**
- `job_offers.status_offers` (interne|externe)
- `applications.candidature_status` (interne|externe)
- `applications.has_been_manager` (boolean)
- `access_requests.viewed` (boolean)
- `access_requests.rejection_reason` (text)
- `protocol2_evaluations.simulation_date` (date)
- `protocol2_evaluations.simulation_time` (time)
- `protocol2_evaluations.simulation_scheduled_at` (timestamp)

#### Index Créés: 35+
Répartis sur 9 tables pour optimisation des performances

#### Fonctions Créées: 7
- 2 triggers (validation, auto-viewed)
- 4 procédures stockées (access_requests)
- 1 fonction utilitaire (statistiques)

---

## ⏱️ TEMPS ESTIMÉS

| Phase | Temps |
|-------|-------|
| Lecture documentation | 30-45 min |
| Backup BDD | 10-15 min |
| Exécution scripts | 15-25 min |
| Validation | 10-15 min |
| Tests | 20-30 min |
| **TOTAL** | **1h30-2h** |

---

## ⚠️ POINTS CRITIQUES

### 🔴 CRITIQUE - Ne PAS oublier

1. **Backup de la BDD** avant toute exécution
2. **Campaign_id** - Toutes les offres DOIVENT en avoir un
3. **Index** - Les 35+ index DOIVENT être créés
4. **Triggers** - Valider qu'ils fonctionnent (test insertion)

### 🟡 IMPORTANT - À vérifier

1. Cohérence interne/externe (trigger validation)
2. Cascade delete sur documents
3. Procédures access_requests accessibles
4. Performances après migration (temps requête)

### 🟢 RECOMMANDÉ - Bonnes pratiques

1. Tester en environnement dev avant prod
2. Monitorer les performances
3. Vérifier les logs régulièrement
4. Documenter les problèmes rencontrés

---

## ✅ CHECKLIST ULTIME

### Avant de Commencer
- [ ] J'ai lu `MIGRATION_AZURE_README.md`
- [ ] J'ai fait un backup de Supabase
- [ ] J'ai fait un backup d'Azure (si données existantes)
- [ ] J'ai les permissions nécessaires sur Azure
- [ ] J'ai Azure Data Studio ou SSMS installé

### Pendant la Migration
- [ ] Exécution de `MIGRATION_AZURE_COMPLETE.sql` réussie
- [ ] Rapport de migration affiché sans erreur
- [ ] Exécution de `MIGRATION_AZURE_FUNCTIONS.sql` réussie
- [ ] Aucune erreur dans les logs

### Après la Migration
- [ ] Toutes les offres ont un campaign_id (query de vérif)
- [ ] 35+ index visibles dans la BDD
- [ ] Test insertion application (validation interne/externe)
- [ ] Test procédures (sp_mark_as_viewed, sp_reject_request)
- [ ] Performances des requêtes acceptables
- [ ] Tests d'intégration passent

---

## 🆘 EN CAS DE PROBLÈME

### Erreur pendant l'exécution
1. Consulter section **Dépannage** dans `MIGRATION_AZURE_README.md`
2. Vérifier les logs de transaction SQL Server
3. Consulter la migration source correspondante dans `supabase/migrations/`

### Problème de performance
1. Vérifier que TOUS les index sont créés
2. Exécuter `UPDATE STATISTICS` sur toutes les tables
3. Analyser les plans d'exécution

### Incohérence de données
1. Exécuter les requêtes de vérification dans `MIGRATION_AZURE_SCHEMA.md`
2. Vérifier la section "Points Critiques de Cohérence"

---

## 📞 SUPPORT

### Documentation Interne
- Migrations sources: `supabase/migrations/`
- Configuration: `src/config/campaigns.ts`

### Documentation Externe
- [Azure SQL Documentation](https://docs.microsoft.com/azure/sql-database/)
- [PostgreSQL to SQL Server Migration](https://docs.microsoft.com/sql/ssma/postgresql/)

---

## 🎉 APRÈS LA MIGRATION RÉUSSIE

1. ✅ Documenter les problèmes rencontrés (pour prod)
2. ✅ Créer des tests d'intégration
3. ✅ Monitorer les performances pendant 48h
4. ✅ Valider avec l'équipe frontend
5. ✅ Planifier la migration de production

---

## 📈 MÉTRIQUES DE SUCCÈS

Une migration réussie signifie:
- ✅ 0 offres sans campaign_id
- ✅ 35+ index créés et utilisés
- ✅ Temps de requête < 200ms (applications list)
- ✅ Triggers fonctionnels (validation OK)
- ✅ Procédures accessibles
- ✅ 0 erreur dans les logs
- ✅ Tests d'intégration passent à 100%

---

## 🚀 PRÊT À MIGRER ?

### Checklist Finale Avant Lancement
1. [ ] Backup effectué ✅
2. [ ] Documentation lue ✅
3. [ ] Environnement de test prêt ✅
4. [ ] Scripts SQL téléchargés ✅
5. [ ] Permissions vérifiées ✅
6. [ ] Équipe prévenue ✅

### Commencer la Migration

**Étape 1:** Ouvrir `MIGRATION_AZURE_README.md`  
**Étape 2:** Suivre la procédure pas à pas  
**Étape 3:** Exécuter `MIGRATION_AZURE_COMPLETE.sql`  
**Étape 4:** Exécuter `MIGRATION_AZURE_FUNCTIONS.sql`  
**Étape 5:** Valider avec la checklist  

---

## 📝 NOTES IMPORTANTES

### Différences PostgreSQL → SQL Server
- UUID → UNIQUEIDENTIFIER
- BOOLEAN → BIT (0/1)
- TEXT → NVARCHAR(MAX)
- Triggers BEFORE → INSTEAD OF
- auth.uid() → Système d'auth custom

### Adaptations Nécessaires
- Remplacer `auth.uid()` par votre mécanisme d'authentification
- Adapter les procédures pour accepter `@user_id` en paramètre
- Implémenter Row-Level Security (RLS) équivalent

---

**BON COURAGE AVEC LA MIGRATION ! 🚀**

*Package de documentation créé le 15 Octobre 2025*  
*Version: 1.0*  
*Projet: Talent Flow Gabon - One HCM*

---

## 📂 STRUCTURE DES FICHIERS

```
talent-flow-gabon-87/
│
├── _LIRE_MOI_MIGRATION_AZURE.md          ← VOUS ÊTES ICI
├── MIGRATION_AZURE_INDEX.md              ← Navigation
├── MIGRATION_AZURE_README.md             ← Guide principal ⭐
├── DOCUMENTATION_MIGRATION_AZURE.md      ← Documentation technique
├── MIGRATION_AZURE_CHEATSHEET.md         ← Aide-mémoire
├── MIGRATION_AZURE_SCHEMA.md             ← Schéma BDD
├── MIGRATION_AZURE_COMPLETE.sql          ← Script principal ⚠️
└── MIGRATION_AZURE_FUNCTIONS.sql         ← Script fonctions
```

**Commencer par:** `MIGRATION_AZURE_README.md` ⭐

