# 🚀 Guide d'Import Complet - Toutes les Tables

## ✅ Tous les Fichiers CSV Corrigés

Tous les fichiers CSV ont été corrigés avec succès et sont prêts pour l'import dans Supabase :

### 🔧 Corrections Appliquées
1. **Séparateurs** : Remplacement des tabulations par des virgules
2. **En-têtes** : Suppression des espaces dans les noms de colonnes
3. **Valeurs NULL** : Remplacement de `\N` par des cellules vides
4. **Format standard** : Conformité avec le format CSV standard

## 📋 Ordre d'Import (OBLIGATOIRE)

**⚠️ IMPORTANT** : Respectez cet ordre exact pour éviter les erreurs de clés étrangères :

### 1. **public.users** ✅ (Déjà importé avec succès)
- **Fichier** : `public.users.csv`
- **Lignes** : 208
- **Colonnes** : 11
- **Statut** : ✅ Importé avec succès

### 2. **public.seeg_agents**
- **Fichier** : `public.seeg_agents.csv`
- **Lignes** : 2,535
- **Colonnes** : 4
- **Structure SQL** :
```sql
CREATE TABLE public.seeg_agents (
    matricule text PRIMARY KEY,
    nom text NOT NULL,
    prenom text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
```

### 3. **public.job_offers**
- **Fichier** : `public.job_offers.csv`
- **Lignes** : 19
- **Colonnes** : 24
- **Structure SQL** :
```sql
CREATE TABLE public.job_offers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id uuid REFERENCES public.users(id),
    title text NOT NULL,
    description text,
    location text,
    contract_type text,
    department text,
    salary_min integer,
    salary_max integer,
    requirements text,
    benefits text,
    status text DEFAULT 'active',
    application_deadline date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    profile text,
    categorie_metier text,
    date_limite date,
    reporting_line text,
    job_grade text,
    salary_note text,
    start_date date,
    responsibilities text
);
```

### 4. **public.candidate_profiles**
- **Fichier** : `public.candidate_profiles.csv`
- **Lignes** : 152
- **Colonnes** : 19
- **Structure SQL** :
```sql
CREATE TABLE public.candidate_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    current_position text,
    current_department text,
    years_experience integer,
    education text,
    availability text,
    expected_salary_min integer,
    expected_salary_max integer,
    skills text,
    cv_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    gender text,
    birth_date date,
    linkedin_url text,
    portfolio_url text,
    address text
);
```

### 5. **public.applications**
- **Fichier** : `public.applications.csv`
- **Lignes** : 178
- **Colonnes** : 24
- **Structure SQL** :
```sql
CREATE TABLE public.applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    job_offer_id uuid REFERENCES public.job_offers(id) ON DELETE CASCADE,
    cover_letter text,
    status text DEFAULT 'submitted',
    motivation text,
    availability_start date,
    reference_contacts text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    url_lettre_integrite text,
    url_idee_projet text,
    mtp_metier_q1 text,
    mtp_metier_q2 text,
    mtp_metier_q3 text,
    mtp_talent_q1 text,
    mtp_talent_q2 text,
    mtp_talent_q3 text,
    mtp_paradigme_q1 text,
    mtp_paradigme_q2 text,
    mtp_paradigme_q3 text,
    mtp_answers jsonb,
    interview_date timestamp with time zone
);
```

### 6. **public.application_drafts**
- **Fichier** : `public.application_drafts.csv`
- **Lignes** : 85
- **Colonnes** : 5
- **Structure SQL** :
```sql
CREATE TABLE public.application_drafts (
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    job_offer_id uuid REFERENCES public.job_offers(id) ON DELETE CASCADE,
    form_data jsonb,
    ui_state jsonb,
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id, job_offer_id)
);
```

### 7. **public.application_documents**
- **Fichier** : `public.application_documents.csv`
- **Lignes** : 947
- **Colonnes** : 7
- **Structure SQL** :
```sql
CREATE TABLE public.application_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    uploaded_at timestamp with time zone DEFAULT now()
);
```

### 8. **public.application_history**
- **Fichier** : `public.application_history.csv`
- **Lignes** : 2
- **Colonnes** : 7
- **Structure SQL** :
```sql
CREATE TABLE public.application_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
    previous_status text,
    new_status text NOT NULL,
    changed_by uuid REFERENCES public.users(id),
    notes text,
    changed_at timestamp with time zone DEFAULT now()
);
```

### 9. **public.documents**
- **Fichier** : `public.documents.csv`
- **Lignes** : 2
- **Colonnes** : 7
- **Structure SQL** :
```sql
CREATE TABLE public.documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    uploaded_at timestamp with time zone DEFAULT now()
);
```

### 10. **public.interview_slots**
- **Fichier** : `public.interview_slots.csv`
- **Lignes** : 13
- **Colonnes** : 13
- **Structure SQL** :
```sql
CREATE TABLE public.interview_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    "time" time NOT NULL,
    application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
    candidate_name text,
    job_title text,
    status text DEFAULT 'available',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_available boolean DEFAULT true,
    recruiter_id uuid REFERENCES public.users(id),
    candidate_id uuid REFERENCES public.users(id),
    notes text
);
```

### 11. **public.notifications**
- **Fichier** : `public.notifications.csv`
- **Lignes** : 868
- **Colonnes** : 9
- **Structure SQL** :
```sql
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    read boolean DEFAULT false,
    related_application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    link text
);
```

### 12. **public.protocol1_evaluations**
- **Fichier** : `public.protocol1_evaluations.csv`
- **Lignes** : 29
- **Colonnes** : 45
- **Structure SQL** :
```sql
CREATE TABLE public.protocol1_evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
    evaluator_id uuid REFERENCES public.users(id),
    documents_verified boolean DEFAULT false,
    adherence_metier boolean DEFAULT false,
    adherence_talent boolean DEFAULT false,
    adherence_paradigme boolean DEFAULT false,
    metier_notes text,
    talent_notes text,
    paradigme_notes text,
    overall_score numeric(5,2),
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    cv_score numeric(5,2),
    cv_comments text,
    lettre_motivation_score numeric(5,2),
    lettre_motivation_comments text,
    diplomes_certificats_score numeric(5,2),
    diplomes_certificats_comments text,
    metier_score numeric(5,2),
    metier_comments text,
    talent_score numeric(5,2),
    talent_comments text,
    paradigme_score numeric(5,2),
    paradigme_comments text,
    interview_date timestamp with time zone,
    interview_metier_score numeric(5,2),
    interview_metier_comments text,
    interview_talent_score numeric(5,2),
    interview_talent_comments text,
    interview_paradigme_score numeric(5,2),
    interview_paradigme_comments text,
    gap_competence_score numeric(5,2),
    gap_competence_comments text,
    general_summary text,
    documentary_score numeric(5,2),
    mtp_score numeric(5,2),
    interview_score numeric(5,2),
    total_score numeric(5,2),
    status text DEFAULT 'pending',
    documentary_score_exact numeric(5,2),
    mtp_score_exact numeric(5,2),
    interview_score_exact numeric(5,2),
    total_score_exact numeric(5,2),
    overall_score_exact numeric(5,2)
);
```

### 13. **public.protocol2_evaluations**
- **Fichier** : `public.protocol2_evaluations.csv`
- **Lignes** : 3
- **Colonnes** : 18
- **Structure SQL** :
```sql
CREATE TABLE public.protocol2_evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
    evaluator_id uuid REFERENCES public.users(id),
    physical_visit boolean DEFAULT false,
    interview_completed boolean DEFAULT false,
    qcm_role_completed boolean DEFAULT false,
    qcm_codir_completed boolean DEFAULT false,
    job_sheet_created boolean DEFAULT false,
    skills_gap_assessed boolean DEFAULT false,
    interview_notes text,
    visit_notes text,
    qcm_role_score numeric(5,2),
    qcm_codir_score numeric(5,2),
    skills_gap_notes text,
    overall_score numeric(5,2),
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

## 🚀 Instructions d'Import

### Pour chaque table :

1. **Créer la table** avec la structure SQL fournie
2. **Aller** dans l'onglet "Table Editor" de Supabase
3. **Cliquer** sur "Import data from CSV"
4. **Sélectionner** le fichier CSV correspondant
5. **Vérifier** la prévisualisation (nombre de colonnes correct)
6. **Confirmer** l'import

## 🎯 Résultat Final Attendu

Après l'import de toutes les tables :

- ✅ **13 tables** créées avec succès
- ✅ **4,000+ lignes** de données importées
- ✅ **Toutes les relations** correctement établies
- ✅ **Base de données** complètement restaurée

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez** l'ordre d'import (OBLIGATOIRE)
2. **Vérifiez** que les tables précédentes sont bien créées
3. **Vérifiez** que les contraintes de clés étrangères sont satisfaites
4. **Vérifiez** que les types de données correspondent

---

**Date de correction** : 3 septembre 2025  
**Fichiers corrigés** : Tous les fichiers CSV du dossier `csv_exports/`  
**Statut** : ✅ Prêts pour l'import complet
