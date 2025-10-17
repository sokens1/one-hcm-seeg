# 🚀 Aide-Mémoire Migration Azure - Tables Modifiées

## Colonnes à Ajouter par Table

### ✅ users
```sql
ADD COLUMN candidate_status TEXT CHECK (candidate_status IN ('interne','externe'));
ADD COLUMN matricule TEXT UNIQUE;
```

### ✅ job_offers
```sql
ADD COLUMN campaign_id INTEGER NOT NULL;  -- ⚠️ CRITIQUE
ADD COLUMN status_offers TEXT CHECK (status_offers IN ('interne','externe'));
```

### ✅ applications
```sql
ADD COLUMN candidature_status TEXT CHECK (candidature_status IN ('interne','externe'));
ADD COLUMN has_been_manager BOOLEAN DEFAULT NULL;
```

### ✅ access_requests
```sql
ADD COLUMN viewed BOOLEAN DEFAULT FALSE NOT NULL;
ADD COLUMN rejection_reason TEXT;
```

### ✅ protocol2_evaluations
```sql
ADD COLUMN simulation_date DATE;
ADD COLUMN simulation_time TIME;
ADD COLUMN simulation_scheduled_at TIMESTAMP WITH TIME ZONE;
```

---

## Index Critiques à Créer

```sql
-- users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_candidate_status ON users(candidate_status);

-- job_offers
CREATE INDEX idx_job_offers_campaign_id ON job_offers(campaign_id);
CREATE INDEX idx_job_offers_status_campaign ON job_offers(status, campaign_id);

-- applications
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_candidate_job ON applications(candidate_id, job_offer_id);

-- protocol1_evaluations & protocol2_evaluations
CREATE INDEX idx_protocol1_application_id ON protocol1_evaluations(application_id);
CREATE INDEX idx_protocol2_application_id ON protocol2_evaluations(application_id);

-- access_requests
CREATE INDEX idx_access_requests_viewed ON access_requests(viewed) WHERE viewed = false;

-- documents
CREATE INDEX idx_documents_application_id ON documents(application_id);
```

---

## Données à Migrer

### Assignation campaign_id (URGENT)
```sql
UPDATE job_offers
SET campaign_id = CASE
    WHEN created_at < '2025-09-11 00:00:00+00' THEN 1
    WHEN created_at <= '2025-10-21 23:59:59+00' THEN 2
    ELSE 3
END
WHERE campaign_id IS NULL;
```

---

## 3 Triggers Essentiels

### 1. Validation interne/externe
```sql
CREATE TRIGGER trg_set_and_validate_candidature_status
BEFORE INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION set_and_validate_candidature_status();
```

### 2. Reset viewed sur nouvelles demandes
```sql
CREATE TRIGGER trigger_reset_viewed_on_new_request
BEFORE INSERT ON access_requests
FOR EACH ROW EXECUTE FUNCTION reset_viewed_on_new_request();
```

### 3. Cascade Delete
```sql
ALTER TABLE application_documents
ADD CONSTRAINT application_documents_application_id_fkey
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
```

---

## Politiques RLS Importantes

```sql
-- Tous les recruteurs voient toutes les candidatures
CREATE POLICY "All recruiters can view all applications" ON applications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id::text = auth.uid()::text
        AND users.role IN ('recruteur', 'admin', 'recruiter')
    )
);
```

---

## Ordre d'Exécution

1. ✅ Ajouter toutes les colonnes
2. ✅ Ajouter toutes les contraintes CHECK
3. ✅ Créer tous les index
4. ✅ Migrer les données (campaign_id)
5. ✅ Créer les fonctions
6. ✅ Créer les triggers
7. ✅ Créer les politiques RLS

---

**Fichier complet:** `DOCUMENTATION_MIGRATION_AZURE.md`

