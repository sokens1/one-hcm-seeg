# Export CSV - Base de Données Talent Flow Gabon

## 📊 Résumé de l'Extraction

Cette extraction a été réalisée à partir de la sauvegarde PostgreSQL : `db_cluster-02-09-2025@22-16-06.backup`

### 📁 Fichiers CSV Créés

| Table | Fichier CSV | Nombre de Lignes | Description |
|-------|-------------|------------------|-------------|
| **public.users** | `public.users.csv` | 206 | Utilisateurs du système (candidats, recruteurs, observateurs) |
| **public.seeg_agents** | `public.seeg_agents.csv` | 2,533 | Agents SEEG avec matricules |
| **public.job_offers** | `public.job_offers.csv` | 17 | Offres d'emploi publiées |
| **public.candidate_profiles** | `public.candidate_profiles.csv` | 150 | Profils détaillés des candidats |
| **public.applications** | `public.applications.csv` | 176 | Candidatures soumises |
| **public.application_drafts** | `public.application_drafts.csv` | 83 | Brouillons de candidatures |
| **public.application_documents** | `public.application_documents.csv` | 945 | Documents joints aux candidatures |
| **public.application_history** | `public.application_history.csv` | 0 | Historique des changements de statut |
| **public.documents** | `public.documents.csv` | 0 | Documents généraux |
| **public.interview_slots** | `public.interview_slots.csv` | 11 | Créneaux d'entretien |
| **public.notifications** | `public.notifications.csv` | 866 | Notifications utilisateurs |
| **public.protocol1_evaluations** | `public.protocol1_evaluations.csv` | 27 | Évaluations Protocole 1 |
| **public.protocol2_evaluations** | `public.protocol2_evaluations.csv` | 1 | Évaluations Protocole 2 |

### 📋 Ordre de Création des Tables

L'ordre correct de création des tables respecte les dépendances (clés étrangères) :

1. **public.users** - Table de base pour tous les utilisateurs
2. **public.seeg_agents** - Agents SEEG (peut référencer users)
3. **public.job_offers** - Offres d'emploi (peut référencer users pour recruiter_id)
4. **public.candidate_profiles** - Profils candidats (référence users)
5. **public.applications** - Candidatures (référence users et job_offers)
6. **public.application_drafts** - Brouillons (référence users et job_offers)
7. **public.application_documents** - Documents candidature (référence applications)
8. **public.application_history** - Historique (référence applications)
9. **public.documents** - Documents généraux (référence applications)
10. **public.interview_slots** - Créneaux entretien (référence applications et users)
11. **public.notifications** - Notifications (référence users et applications)
12. **public.protocol1_evaluations** - Évaluations Protocole 1 (référence applications)
13. **public.protocol2_evaluations** - Évaluations Protocole 2 (référence applications)

### 🔗 Dépendances Principales

- **applications** → users (candidate_id), job_offers (job_offer_id)
- **candidate_profiles** → users (user_id)
- **application_documents** → applications (application_id)
- **application_history** → applications (application_id)
- **documents** → applications (application_id)
- **interview_slots** → applications (application_id), users (candidate_id, recruiter_id)
- **notifications** → users (user_id), applications (related_application_id)
- **protocol1_evaluations** → applications (application_id)
- **protocol2_evaluations** → applications (application_id)

### ⚠️ Notes Importantes

- Les tables **auth.*** sont gérées automatiquement par Supabase
- Les tables **storage.*** sont gérées automatiquement par Supabase Storage
- Les tables **realtime.*** sont gérées automatiquement par Supabase Realtime
- Les tables **supabase_migrations.*** sont gérées automatiquement par Supabase

### 📝 Format des Fichiers CSV

- **Encodage** : UTF-8
- **Séparateur** : Virgule (,)
- **Première ligne** : En-têtes des colonnes
- **Valeurs NULL** : Représentées par `\N`
- **Données JSON** : Stockées en format JSON dans les colonnes appropriées

### 🚀 Utilisation

Ces fichiers CSV peuvent être utilisés pour :
- **Import dans une nouvelle base de données**
- **Analyse des données**
- **Sauvegarde des données**
- **Migration vers un autre système**

### 📅 Date d'Extraction

Extraction réalisée le : **3 septembre 2025**

### 🔧 Script Utilisé

Script PowerShell : `extract-tables-minimal.ps1`
