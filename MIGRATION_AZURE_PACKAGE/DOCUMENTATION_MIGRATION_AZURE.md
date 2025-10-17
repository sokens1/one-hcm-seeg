# Documentation - Migration Base de Données Azure
**Version:** Octobre 2025  
**Cible:** Développeur Backend  
**Source:** Supabase → Azure SQL Database

---

## 📋 Tables Principales et Mises à Jour Récentes

### 1. **users** (Table Utilisateurs)
**Colonnes ajoutées récemment:**
- `candidate_status` TEXT : Statut du candidat (`'interne'` | `'externe'`)
  - Contrainte: `CHECK (candidate_status IN ('interne','externe'))`
  - Migration: `20251008141536_add_internal_external_audience.sql`
- `matricule` TEXT UNIQUE : Pour les employés SEEG internes
- `statut` TEXT : Statut de l'utilisateur (actif, bloqué, etc.)

**Index importants:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_matricule ON users(matricule) WHERE matricule IS NOT NULL;
CREATE INDEX idx_users_candidate_status ON users(candidate_status) WHERE candidate_status IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

### 2. **job_offers** (Offres d'Emploi)
**Colonnes ajoutées récemment:**
- `campaign_id` INTEGER : **CRITIQUE** - Identifiant de campagne de recrutement
  - Migration: `20251012000006_assign_campaign_id_to_existing_jobs.sql`
  - Règles d'assignation :
    - Campagne 1: Avant le 11/09/2025
    - Campagne 2: Du 11/09/2025 au 21/10/2025
    - Campagne 3: Après le 21/10/2025

- `status_offers` TEXT : Audience de l'offre (`'interne'` | `'externe'`)
  - Contrainte: `CHECK (status_offers IN ('interne','externe'))`
  - Migration: `20251008141536_add_internal_external_audience.sql`

**Index importants:**
```sql
CREATE INDEX idx_job_offers_campaign_id ON job_offers(campaign_id);
CREATE INDEX idx_job_offers_created_at ON job_offers(created_at DESC);
CREATE INDEX idx_job_offers_status_campaign ON job_offers(status, campaign_id) WHERE status = 'active';
```

---

### 3. **applications** (Candidatures)
**Colonnes ajoutées récemment:**
- `candidature_status` TEXT : Type de candidature (`'interne'` | `'externe'`)
  - Contrainte: `CHECK (candidature_status IN ('interne','externe'))`
  - Migration: `20251008141536_add_internal_external_audience.sql`

- `has_been_manager` BOOLEAN : Candidat a déjà été chef/manager (pour offres internes)
  - Migration: `20251010000001_add_has_been_manager_to_applications.sql`

**Index importants:**
```sql
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_candidate_job ON applications(candidate_id, job_offer_id);
```

**Trigger important:**
```sql
-- Validation automatique du statut interne/externe lors de l'insertion
CREATE TRIGGER trg_set_and_validate_candidature_status
BEFORE INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION set_and_validate_candidature_status();
```

---

### 4. **documents** (Documents Candidatures)
**Index importants:**
```sql
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(document_type);
```

**Contrainte de clé étrangère:**
```sql
-- Migration: 20251012000010_add_cascade_delete_application_documents.sql
ALTER TABLE application_documents
ADD CONSTRAINT application_documents_application_id_fkey
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
```

---

### 5. **protocol1_evaluations** (Évaluations Protocole 1)
**Structure principale:**
- Évaluation documentaire: CV, lettre de motivation, diplômes
- Évaluation MTP: Métier, Talent, Paradigme
- Entretien: Scores interview + gap de compétence
- Scores calculés: `documentary_score`, `mtp_score`, `interview_score`, `total_score`, `overall_score`
- `status` TEXT, `completed` BOOLEAN

**Index importants:**
```sql
CREATE INDEX idx_protocol1_application_id ON protocol1_evaluations(application_id);
CREATE INDEX idx_protocol1_status ON protocol1_evaluations(status);
CREATE INDEX idx_protocol1_completed ON protocol1_evaluations(completed);
```

---

### 6. **protocol2_evaluations** (Évaluations Protocole 2)
**Colonnes ajoutées récemment:**
- `simulation_date` DATE : Date de simulation
- `simulation_time` TIME : Heure de simulation
- `simulation_scheduled_at` TIMESTAMP : Timestamp de programmation
  - Migration: `20250131000060_add_simulation_fields_to_protocol2.sql`

**Index importants:**
```sql
CREATE INDEX idx_protocol2_application_id ON protocol2_evaluations(application_id);
CREATE INDEX idx_protocol2_status ON protocol2_evaluations(status);
CREATE INDEX idx_protocol2_completed ON protocol2_evaluations(completed);
CREATE INDEX idx_protocol2_evaluations_simulation_date ON protocol2_evaluations(simulation_date);
```

---

### 7. **access_requests** (Demandes d'Accès)
**Colonnes ajoutées récemment:**
- `viewed` BOOLEAN DEFAULT FALSE : Demande vue/non vue par admin
  - Migration: `20250110000003_add_viewed_to_access_requests.sql`

- `rejection_reason` TEXT : Motif de rejet
  - Migration: `20250110000002_add_rejection_reason.sql`

**Index importants:**
```sql
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_created_at ON access_requests(created_at DESC);
CREATE INDEX idx_access_requests_viewed ON access_requests(viewed) WHERE viewed = false;
```

**Fonctions RPC associées:**
```sql
-- Marquer comme vue
public.mark_access_request_as_viewed(request_id UUID)
-- Marquer toutes comme vues
public.mark_all_access_requests_as_viewed()
-- Rejeter avec motif
public.reject_access_request(request_id UUID, p_rejection_reason TEXT)
```

---

### 8. **interview_slots** (Créneaux d'Entretien)
**Index importants:**
```sql
CREATE INDEX idx_interview_slots_date ON interview_slots(date);
CREATE INDEX idx_interview_slots_time ON interview_slots(time);
CREATE INDEX idx_interview_slots_available ON interview_slots(is_available) WHERE is_available = true;
```

---

### 9. **email_logs** (Journaux d'Emails - Optionnel)
**Index importants:**
```sql
CREATE INDEX idx_email_logs_recipient_id ON email_logs(recipient_id);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
```

---

## 🔒 Politiques RLS (Row Level Security)

### Applications - Accès Recruteurs
**Migration:** `20251013000002_fix_recruiter_access_all_applications.sql`

```sql
-- TOUS les recruteurs peuvent voir TOUTES les candidatures
CREATE POLICY "All recruiters can view all applications" ON applications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id::text = auth.uid()::text
        AND users.role IN ('recruteur', 'admin', 'recruiter')
    )
);

-- TOUS les recruteurs peuvent modifier TOUTES les candidatures
CREATE POLICY "All recruiters can update applications" ON applications
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id::text = auth.uid()::text
        AND users.role IN ('recruteur', 'admin', 'recruiter')
    )
);
```

---

## ⚡ Points Critiques pour la Migration

### 1. **Campaign_id (URGENT)**
- Toutes les offres doivent avoir un `campaign_id`
- Utiliser la logique de dates pour assigner automatiquement:
```sql
UPDATE job_offers SET campaign_id = CASE
    WHEN created_at < '2025-09-11 00:00:00+00' THEN 1
    WHEN created_at BETWEEN '2025-09-11 00:00:00+00' AND '2025-10-21 23:59:59+00' THEN 2
    ELSE 3
END WHERE campaign_id IS NULL;
```

### 2. **Validation Interne/Externe**
- Trigger sur `applications` pour valider la cohérence interne/externe
- Fonction: `set_and_validate_candidature_status()`

### 3. **Cascade Delete**
- `application_documents` → `applications` : ON DELETE CASCADE
- Important pour l'intégrité référentielle

### 4. **Index de Performance**
- **TOUS** les index listés ci-dessus doivent être créés
- Migration complète: `20251014000001_optimize_database_indexes.sql`

### 5. **Fonctions RPC**
- `mark_access_request_as_viewed()`
- `mark_all_access_requests_as_viewed()`
- `reject_access_request()`
- Toutes avec `SECURITY DEFINER`

---

## 📦 Scripts de Migration Recommandés

### Ordre d'exécution:
1. **Colonnes de base** → `campaign_id`, `candidate_status`, `status_offers`, `candidature_status`
2. **Contraintes** → Toutes les contraintes CHECK
3. **Index** → Tous les index listés ci-dessus
4. **Triggers** → Validation interne/externe, viewed sur access_requests
5. **Fonctions RPC** → access_requests, reject_access_request
6. **Politiques RLS** → Accès recruteurs aux candidatures
7. **Données** → Assignation campaign_id aux offres existantes

---

## 🔍 Vérifications Post-Migration

```sql
-- 1. Vérifier les campaign_id
SELECT campaign_id, COUNT(*) FROM job_offers GROUP BY campaign_id;

-- 2. Vérifier les index
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';

-- 3. Vérifier les politiques RLS
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- 4. Vérifier les contraintes
SELECT conname, contype FROM pg_constraint WHERE connamespace = 'public'::regnamespace;
```

---

## 📞 Contact
Pour toute question sur cette migration, référer aux fichiers de migration dans `supabase/migrations/` dossier du projet.

**Dernière mise à jour:** 14 Octobre 2025

