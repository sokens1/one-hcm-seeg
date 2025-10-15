# 🗂️ Schéma de Base de Données - Tables Modifiées

**Projet:** Talent Flow Gabon  
**Migration:** Supabase → Azure SQL Database

---

## 📊 Vue d'Ensemble des Relations

```
┌─────────────────────┐
│      CAMPAIGNS      │ (Logique métier - pas de table)
│  1, 2, 3            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐       ┌──────────────────────┐
│    JOB_OFFERS       │       │       USERS          │
│ =================== │       │ ==================== │
│ + campaign_id ★     │       │ + candidate_status ★ │
│ + status_offers ★   │       │ + matricule          │
│   (interne/externe) │       │   (employés internes)│
└──────────┬──────────┘       └──────────┬───────────┘
           │                              │
           │         ┌────────────────────┘
           │         │
           ▼         ▼
    ┌──────────────────────────┐
    │     APPLICATIONS         │
    │ ======================== │
    │ + candidature_status ★   │
    │ + has_been_manager       │
    │   (pour offres internes) │
    └────────┬─────────────────┘
             │
        ┌────┴────┬────────┬──────────┐
        │         │        │          │
        ▼         ▼        ▼          ▼
┌────────────┐ ┌──────┐ ┌────────┐ ┌────────┐
│ PROTOCOL1  │ │ DOC  │ │PROTOC2 │ │INTERV. │
│ ========== │ │ ==== │ │ ====== │ │ ====== │
│ (éval 1)   │ │(docs)│ │+ simu  │ │(slots) │
└────────────┘ └──────┘ │  _date │ └────────┘
                        │+ simu  │
                        │  _time │
                        └────────┘

┌──────────────────────┐
│  ACCESS_REQUESTS     │
│ ==================== │
│ + viewed ★           │
│ + rejection_reason   │
└──────────────────────┘

★ = Colonnes critiques ajoutées
```

---

## 📋 Détail des Tables Modifiées

### 1️⃣ USERS (Utilisateurs)

```sql
┌────────────────────────────────────────┐
│              users                     │
├────────────────────────────────────────┤
│ id                 UUID                │
│ email              TEXT                │
│ role               TEXT                │
│ first_name         TEXT                │
│ last_name          TEXT                │
│ statut             TEXT                │
│                                        │
│ ⭐ NOUVELLES COLONNES:                 │
│ + candidate_status TEXT (interne|ext) │
│ + matricule        TEXT (pour SEEG)   │
├────────────────────────────────────────┤
│ INDEX:                                 │
│ • idx_users_email                      │
│ • idx_users_candidate_status           │
│ • idx_users_matricule                  │
│ • idx_users_created_at                 │
└────────────────────────────────────────┘
```

**Valeurs possibles:**
- `candidate_status`: `'interne'` | `'externe'` | NULL
- `role`: `'candidat'` | `'recruteur'` | `'admin'` | `'observateur'`
- `statut`: `'actif'` | `'bloqué'` | `'en_attente'`

---

### 2️⃣ JOB_OFFERS (Offres d'Emploi)

```sql
┌────────────────────────────────────────┐
│           job_offers                   │
├────────────────────────────────────────┤
│ id                 UUID                │
│ recruiter_id       UUID → users        │
│ title              TEXT                │
│ description        TEXT                │
│ status             TEXT                │
│                                        │
│ ⭐ NOUVELLES COLONNES:                 │
│ + campaign_id      INTEGER ⚠️ CRITIQUE│
│ + status_offers    TEXT (interne|ext) │
├────────────────────────────────────────┤
│ INDEX:                                 │
│ • idx_job_offers_campaign_id           │
│ • idx_job_offers_status_campaign       │
│ • idx_job_offers_created_at            │
└────────────────────────────────────────┘
```

**Règles campaign_id:**
```
created_at < 2025-09-11        → campaign_id = 1
2025-09-11 ≤ created_at ≤ 2025-10-21 → campaign_id = 2
created_at > 2025-10-21        → campaign_id = 3
```

**Valeurs possibles:**
- `status_offers`: `'interne'` | `'externe'` | NULL
- `status`: `'active'` | `'paused'` | `'closed'` | `'draft'`

---

### 3️⃣ APPLICATIONS (Candidatures)

```sql
┌────────────────────────────────────────┐
│          applications                  │
├────────────────────────────────────────┤
│ id                 UUID                │
│ candidate_id       UUID → users        │
│ job_offer_id       UUID → job_offers   │
│ status             TEXT                │
│                                        │
│ ⭐ NOUVELLES COLONNES:                 │
│ + candidature_status TEXT (int|ext)   │
│ + has_been_manager   BOOLEAN          │
├────────────────────────────────────────┤
│ INDEX:                                 │
│ • idx_applications_candidate_id        │
│ • idx_applications_job_offer_id        │
│ • idx_applications_status              │
│ • idx_applications_candidate_job (c+j) │
│ • idx_applications_created_at          │
├────────────────────────────────────────┤
│ TRIGGER:                               │
│ • trg_validate_candidature_status      │
│   → Valide cohérence interne/externe   │
└────────────────────────────────────────┘
```

**Logique de validation:**
```
SI candidature_status = 'interne'
  ALORS users.candidate_status DOIT ÊTRE 'interne'
  ET job_offers.status_offers DOIT ÊTRE 'interne'
  
SI candidature_status = 'externe'
  ALORS cohérence avec offre et candidat
```

**Valeurs possibles:**
- `candidature_status`: `'interne'` | `'externe'` | NULL
- `has_been_manager`: `true` | `false` | NULL (uniquement pour internes)
- `status`: `'pending'` | `'accepted'` | `'rejected'` | `'in_review'`

---

### 4️⃣ ACCESS_REQUESTS (Demandes d'Accès)

```sql
┌────────────────────────────────────────┐
│        access_requests                 │
├────────────────────────────────────────┤
│ id                 UUID                │
│ user_id            UUID → users        │
│ status             TEXT                │
│ reviewed_by        UUID                │
│ reviewed_at        TIMESTAMP           │
│                                        │
│ ⭐ NOUVELLES COLONNES:                 │
│ + viewed           BOOLEAN (def: 0)   │
│ + rejection_reason TEXT               │
├────────────────────────────────────────┤
│ INDEX:                                 │
│ • idx_access_requests_status           │
│ • idx_access_requests_viewed           │
│ • idx_access_requests_created_at       │
├────────────────────────────────────────┤
│ TRIGGER:                               │
│ • trg_reset_viewed_on_new_request      │
│   → viewed = 0 sur INSERT              │
├────────────────────────────────────────┤
│ PROCÉDURES:                            │
│ • sp_mark_as_viewed(id, user_id)       │
│ • sp_mark_all_as_viewed(user_id)       │
│ • sp_reject_request(id, reason, u_id)  │
│ • sp_approve_request(id, user_id)      │
└────────────────────────────────────────┘
```

**Valeurs possibles:**
- `status`: `'pending'` | `'approved'` | `'rejected'`
- `viewed`: `0` (false) | `1` (true)

---

### 5️⃣ PROTOCOL2_EVALUATIONS (Évaluations Protocole 2)

```sql
┌────────────────────────────────────────┐
│    protocol2_evaluations               │
├────────────────────────────────────────┤
│ id                 UUID                │
│ application_id     UUID → applications │
│ evaluator_id       UUID → users        │
│ status             TEXT                │
│ completed          BOOLEAN             │
│ [... autres scores ...]                │
│                                        │
│ ⭐ NOUVELLES COLONNES:                 │
│ + simulation_date        DATE         │
│ + simulation_time        TIME         │
│ + simulation_scheduled_at TIMESTAMP   │
├────────────────────────────────────────┤
│ INDEX:                                 │
│ • idx_protocol2_application_id         │
│ • idx_protocol2_status                 │
│ • idx_protocol2_completed              │
│ • idx_protocol2_simulation_date        │
└────────────────────────────────────────┘
```

**Usage:**
- Planification des simulations pour candidats
- Tracking des dates/heures d'entretiens

---

### 6️⃣ DOCUMENTS (Documents Candidature)

```sql
┌────────────────────────────────────────┐
│            documents                   │
├────────────────────────────────────────┤
│ id                 UUID                │
│ application_id     UUID → applications │
│ document_type      TEXT                │
│ document_url       TEXT                │
├────────────────────────────────────────┤
│ INDEX:                                 │
│ • idx_documents_application_id         │
│ • idx_documents_type                   │
├────────────────────────────────────────┤
│ CONTRAINTE:                            │
│ • FK → applications                    │
│   ON DELETE CASCADE ⚠️                 │
└────────────────────────────────────────┘
```

**Cascade Delete:**
```
Supprimer application
  ↓
Supprime automatiquement tous ses documents
```

---

### 7️⃣ PROTOCOL1_EVALUATIONS (Évaluations Protocole 1)

```sql
┌────────────────────────────────────────┐
│    protocol1_evaluations               │
├────────────────────────────────────────┤
│ id                 UUID                │
│ application_id     UUID → applications │
│ evaluator_id       UUID → users        │
│                                        │
│ Sections d'évaluation:                 │
│ • CV (score + commentaires)            │
│ • Lettre motivation                    │
│ • Diplômes/certificats                 │
│ • MTP (Métier, Talent, Paradigme)      │
│ • Entretien (scores interview)         │
│                                        │
│ Scores calculés:                       │
│ • documentary_score                    │
│ • mtp_score                            │
│ • interview_score                      │
│ • total_score                          │
│ • overall_score                        │
├────────────────────────────────────────┤
│ INDEX:                                 │
│ • idx_protocol1_application_id         │
│ • idx_protocol1_status                 │
│ • idx_protocol1_completed              │
└────────────────────────────────────────┘
```

---

## 🔗 Relations Principales

### Flux de Candidature

```
1. USER (candidat) crée compte
   ↓ candidate_status = 'interne' ou 'externe'
   
2. USER voit JOB_OFFER
   ↓ Filtre par status_offers compatible
   
3. USER crée APPLICATION
   ↓ Trigger valide cohérence interne/externe
   ↓ candidature_status auto-assigné
   
4. DOCUMENTS uploadés
   ↓ FK avec CASCADE
   
5. PROTOCOL1_EVALUATION créé
   ↓ Évaluation documentaire + MTP
   
6. PROTOCOL2_EVALUATION créé
   ↓ Simulation planifiée (date/heure)
   
7. Décision finale sur APPLICATION
   ↓ status = 'accepted' ou 'rejected'
```

### Flux d'Accès

```
1. Nouvel utilisateur s'inscrit
   ↓ statut = 'en_attente'
   
2. ACCESS_REQUEST créé
   ↓ viewed = 0 (trigger auto)
   ↓ status = 'pending'
   
3. Admin/Recruteur voit notification
   ↓ sp_mark_as_viewed()
   
4a. Approbation
    ↓ sp_approve_request()
    ↓ users.statut = 'actif'
    
4b. Rejet
    ↓ sp_reject_request(reason)
    ↓ users.statut = 'bloqué'
    ↓ rejection_reason enregistré
```

---

## 🎯 Points Critiques de Cohérence

### 1. Cohérence Interne/Externe ⚠️

```
applications.candidature_status
    ↕️ DOIT MATCHER
users.candidate_status
    ↕️ DOIT MATCHER
job_offers.status_offers
```

**Validé par:** Trigger `trg_validate_candidature_status`

### 2. Campaign ID ⚠️

```
TOUTES les offres DOIVENT avoir un campaign_id
NULL n'est PAS autorisé en production
```

### 3. Cascade Delete ⚠️

```
Supprimer application
  ↓ CASCADE
  ↓ Supprime documents
  ↓ Supprime protocol1_evaluations
  ↓ Supprime protocol2_evaluations
```

---

## 📊 Statistiques Attendues

Après migration complète:

| Métrique | Valeur |
|----------|--------|
| Tables avec colonnes ajoutées | 5 |
| Tables avec index ajoutés | 9 |
| Total colonnes ajoutées | 11 |
| Total index créés | 35+ |
| Triggers créés | 2 |
| Procédures stockées | 4 |
| Contraintes CHECK | 5 |

---

## 🔍 Requêtes Utiles Post-Migration

### Vérifier Campaign Distribution
```sql
SELECT campaign_id, COUNT(*) as offers, 
       COUNT(DISTINCT a.id) as applications
FROM job_offers jo
LEFT JOIN applications a ON jo.id = a.job_offer_id
GROUP BY campaign_id
ORDER BY campaign_id;
```

### Vérifier Cohérence Interne/Externe
```sql
SELECT 
    a.candidature_status as app_status,
    u.candidate_status as user_status,
    jo.status_offers as offer_status,
    COUNT(*) as total
FROM applications a
INNER JOIN users u ON a.candidate_id = u.id
INNER JOIN job_offers jo ON a.job_offer_id = jo.id
WHERE a.candidature_status IS NOT NULL
GROUP BY a.candidature_status, u.candidate_status, jo.status_offers;
```

### Demandes d'Accès Non Vues
```sql
SELECT COUNT(*) as non_vues
FROM access_requests
WHERE viewed = 0 AND status = 'pending';
```

---

**Fichier de référence pour comprendre la structure complète de la base de données**

*Dernière mise à jour: 15 Octobre 2025*

