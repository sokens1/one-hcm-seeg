# Spécifications Techniques - Système d'Authentification et Gestion des Demandes d'Accès
## OneHCM - SEEG Talent Source

**Date** : 10 Janvier 2025  
**Destinataire** : Développeur Backend Azure  
**Objet** : Modifications de la base de données et logique d'authentification

---

## 🎯 Vue d'Ensemble

Ce document détaille toutes les modifications apportées au système d'authentification et de gestion des utilisateurs depuis la mise en place initiale. Ces modifications doivent être répliquées dans la base de données Azure PostgreSQL et l'API backend.

---

## 📊 Table 1 : `users` - Modifications des Champs

### Nouveaux Champs Ajoutés

| Nom du Champ | Type | Nullable | Défaut | Contrainte | Description |
|--------------|------|----------|--------|------------|-------------|
| `date_of_birth` | DATE | YES | NULL | - | Date de naissance du candidat |
| `sexe` | TEXT | YES | NULL | CHECK (sexe IS NULL OR sexe IN ('M', 'F')) | Sexe du candidat : 'M' (Homme) ou 'F' (Femme) |
| `adresse` | TEXT | YES | NULL | - | Adresse complète du candidat |
| `candidate_status` | TEXT | YES | NULL | CHECK (candidate_status IS NULL OR candidate_status IN ('interne', 'externe')) | Type de candidat : interne (employé SEEG) ou externe |
| `statut` | TEXT | YES | 'actif' | CHECK (statut IS NULL OR statut IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé')) | Statut du compte utilisateur |
| `poste_actuel` | TEXT | YES | NULL | - | Poste actuel du candidat (optionnel) |
| `annees_experience` | INTEGER | YES | NULL | - | Années d'expérience du candidat (optionnel) |
| `no_seeg_email` | BOOLEAN | YES | FALSE | - | Indique si le candidat interne n'a pas d'email @seeg.com |

### Champ Modifié

| Nom du Champ | Avant | Après | Raison |
|--------------|-------|-------|--------|
| `matricule` | NOT NULL | NULL (optionnel) | Les candidats externes n'ont pas de matricule |

### Index à Créer

```sql
CREATE INDEX IF NOT EXISTS idx_users_statut ON users(statut);
CREATE INDEX IF NOT EXISTS idx_users_candidate_status ON users(candidate_status);
CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule) WHERE matricule IS NOT NULL;
```

---

## 📊 Table 2 : `seeg_agents` - Table de Vérification (Déjà Existante)

Cette table contient la liste des agents SEEG avec leurs matricules. Elle est utilisée pour valider les matricules lors de l'inscription des candidats internes.

### Structure Attendue

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `matricule` | TEXT | Matricule de l'agent SEEG |
| `first_name` | TEXT | Prénom de l'agent |
| `last_name` | TEXT | Nom de l'agent |
| `email` | TEXT | Email professionnel (@seeg.com) |
| `active` | BOOLEAN | Statut actif/inactif |

### Fonction RPC pour Vérification

```sql
CREATE OR REPLACE FUNCTION verify_matricule(p_matricule TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM seeg_agents 
    WHERE matricule = p_matricule 
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verify_matricule(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_matricule(TEXT) TO authenticated;
```

---

## 📊 Table 3 : `access_requests` - Nouvelle Table

### Création de la Table

```sql
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  matricule TEXT,
  request_type TEXT DEFAULT 'internal_no_seeg_email',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  viewed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);
```

### Index

```sql
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_viewed ON access_requests(viewed);
CREATE INDEX IF NOT EXISTS idx_access_requests_status_viewed ON access_requests(status, viewed);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests(created_at DESC);
```

### Description des Champs

| Champ | Type | Description | Valeurs Possibles |
|-------|------|-------------|-------------------|
| `id` | UUID | Identifiant unique de la demande | - |
| `user_id` | UUID | Référence vers users.id | - |
| `email` | TEXT | Email du demandeur | - |
| `first_name` | TEXT | Prénom du demandeur | - |
| `last_name` | TEXT | Nom du demandeur | - |
| `phone` | TEXT | Téléphone du demandeur | - |
| `matricule` | TEXT | Matricule SEEG (si interne) | - |
| `request_type` | TEXT | Type de demande | 'internal_no_seeg_email' |
| `status` | TEXT | Statut de la demande | 'pending', 'approved', 'rejected' |
| `rejection_reason` | TEXT | Motif de refus (si rejetée) | - |
| `viewed` | BOOLEAN | Demande vue par un recruteur | TRUE, FALSE |
| `created_at` | TIMESTAMPTZ | Date de création | - |
| `reviewed_at` | TIMESTAMPTZ | Date de traitement | - |
| `reviewed_by` | UUID | Recruteur qui a traité | - |

---

## 🔧 Fonctions PostgreSQL à Créer

### 1. Fonction `approve_access_request`

**But** : Approuver une demande d'accès et activer le compte utilisateur

```sql
CREATE OR REPLACE FUNCTION approve_access_request(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'recruteur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Récupérer les infos de la demande
  SELECT user_id, email, first_name, last_name
  INTO v_user_id, v_email, v_first_name, v_last_name
  FROM access_requests
  WHERE id = request_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Demande non trouvée';
  END IF;

  -- Mettre à jour le statut de l'utilisateur à 'actif'
  UPDATE users
  SET statut = 'actif', updated_at = NOW()
  WHERE id = v_user_id;

  -- Mettre à jour le statut de la demande
  UPDATE access_requests
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = auth.uid()
  WHERE id = request_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION approve_access_request(UUID) TO authenticated;
```

---

### 2. Fonction `reject_access_request`

**But** : Rejeter une demande d'accès et bloquer le compte utilisateur

```sql
CREATE OR REPLACE FUNCTION reject_access_request(
  request_id UUID, 
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'recruteur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Récupérer les infos de la demande
  SELECT user_id, email, first_name, last_name
  INTO v_user_id, v_email, v_first_name, v_last_name
  FROM access_requests
  WHERE id = request_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Demande non trouvée';
  END IF;

  -- Mettre à jour le statut de l'utilisateur à 'bloqué'
  UPDATE users
  SET statut = 'bloqué', updated_at = NOW()
  WHERE id = v_user_id;

  -- Mettre à jour le statut de la demande avec le motif
  UPDATE access_requests
  SET 
    status = 'rejected',
    rejection_reason = p_rejection_reason,
    reviewed_at = NOW(),
    reviewed_by = auth.uid()
  WHERE id = request_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION reject_access_request(UUID, TEXT) TO authenticated;
```

---

### 3. Fonction `mark_access_request_as_viewed`

**But** : Marquer une demande spécifique comme vue

```sql
CREATE OR REPLACE FUNCTION mark_access_request_as_viewed(request_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur/observateur
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'recruteur', 'observateur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Marquer la demande comme vue
  UPDATE access_requests
  SET viewed = TRUE
  WHERE id = request_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_access_request_as_viewed(UUID) TO authenticated;
```

---

### 4. Fonction `mark_all_access_requests_as_viewed`

**But** : Marquer toutes les demandes en attente comme vues

```sql
CREATE OR REPLACE FUNCTION mark_all_access_requests_as_viewed()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur/observateur
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'recruteur', 'observateur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Marquer toutes les demandes en attente comme vues
  UPDATE access_requests
  SET viewed = TRUE
  WHERE status = 'pending' AND viewed = FALSE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_all_access_requests_as_viewed() TO authenticated;
```

---

## 🔔 Triggers PostgreSQL

### 1. Trigger `handle_new_user` - Mise à Jour

**But** : Créer automatiquement un enregistrement dans la table `users` lors de l'inscription et gérer le statut selon le type de candidat

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    matricule,
    date_of_birth,
    sexe,
    adresse,
    candidate_status,
    poste_actuel,
    annees_experience,
    no_seeg_email,
    statut,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidat'),
    NEW.raw_user_meta_data->>'matricule',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    NEW.raw_user_meta_data->>'sexe',
    NEW.raw_user_meta_data->>'adresse',
    NEW.raw_user_meta_data->>'candidate_status',
    NEW.raw_user_meta_data->>'poste_actuel',
    (NEW.raw_user_meta_data->>'annees_experience')::INTEGER,
    COALESCE((NEW.raw_user_meta_data->>'no_seeg_email')::BOOLEAN, FALSE),
    -- Statut selon le type de candidat
    CASE
      WHEN NEW.raw_user_meta_data->>'candidate_status' = 'interne' 
           AND COALESCE((NEW.raw_user_meta_data->>'no_seeg_email')::BOOLEAN, FALSE) = TRUE 
      THEN 'en_attente'
      ELSE 'actif'
    END,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### 2. Trigger `log_access_request`

**But** : Créer automatiquement une demande d'accès pour les candidats internes sans email SEEG

```sql
CREATE OR REPLACE FUNCTION log_access_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une demande d'accès si statut = 'en_attente'
  IF NEW.statut = 'en_attente' AND NEW.candidate_status = 'interne' THEN
    INSERT INTO public.access_requests (
      user_id,
      email,
      first_name,
      last_name,
      phone,
      matricule,
      request_type,
      status,
      viewed,
      created_at
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.first_name,
      NEW.last_name,
      NEW.phone,
      NEW.matricule,
      'internal_no_seeg_email',
      'pending',
      FALSE,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_access_request ON users;
CREATE TRIGGER trigger_log_access_request
  AFTER INSERT ON users
  FOR EACH ROW
  WHEN (NEW.statut = 'en_attente')
  EXECUTE FUNCTION log_access_request();
```

---

### 3. Trigger `reset_viewed_on_new_request`

**But** : S'assurer que les nouvelles demandes sont marquées comme non vues

```sql
CREATE OR REPLACE FUNCTION reset_viewed_on_new_request()
RETURNS TRIGGER AS $$
BEGIN
  NEW.viewed := FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reset_viewed_on_new_request ON access_requests;
CREATE TRIGGER trigger_reset_viewed_on_new_request
  BEFORE INSERT ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION reset_viewed_on_new_request();
```

---

## 📧 Système d'Emails - Spécifications

### Email 1 : Bienvenue (Tous les Nouveaux Inscrits)

**Trigger** : Après création de compte (statut = 'actif')  
**Destinataire** : Nouvel utilisateur  
**Objet** : "Bienvenue sur OneHCM - SEEG Talent Source"

**Variables** :
- `userEmail` : Email du candidat
- `firstName` : Prénom
- `lastName` : Nom
- `sexe` : 'M' ou 'F' (pour "Monsieur"/"Madame")

**Contenu** :
```
[Titre] Bienvenue sur OneHCM - SEEG Talent Source

[Salutation] Monsieur/Madame [Prénom] [Nom],

Bienvenue sur la plateforme OneHCM - SEEG Talent Source !

Votre compte a été créé avec succès. Vous pouvez désormais :
- Consulter les offres d'emploi disponibles
- Postuler aux postes qui vous intéressent
- Suivre l'état de vos candidatures
- Mettre à jour votre profil

Pour vous connecter, rendez-vous sur :
https://www.seeg-talentsource.com

[Encadré Bleu]
📧 Besoin d'aide ?
Contactez-nous : support@seeg-talentsource.com

Cordialement,
L'équipe OneHCM - SEEG Talent Source
https://www.seeg-talentsource.com

[Logo OneHCM]
```

---

### Email 2 : Demande d'Accès en Attente (Candidat Interne sans Email SEEG)

**Trigger** : Après création de compte (statut = 'en_attente')  
**Destinataire** : Candidat interne  
**Objet** : "Demande d'Accès en Cours de Traitement - OneHCM"

**Variables** :
- `userEmail` : Email du candidat
- `firstName` : Prénom
- `lastName` : Nom
- `sexe` : 'M' ou 'F'

**Contenu** :
```
[Titre Orange] Demande d'Accès en Cours de Traitement

[Salutation] Monsieur/Madame [Prénom] [Nom],

Votre demande d'accès à la plateforme OneHCM - SEEG Talent Source a bien été enregistrée.

[Encadré Orange]
⏳ Statut : En attente de validation
Notre équipe va examiner votre demande et vous recevrez un email de confirmation une fois votre accès validé.

Cela peut prendre quelques jours ouvrables.

[Encadré Bleu]
📞 Questions ?
Contact : support@seeg-talentsource.com

Cordialement,
L'équipe OneHCM - SEEG Talent Source
https://www.seeg-talentsource.com

[Logo OneHCM]
```

---

### Email 3 : Notification Admin (Nouvelle Demande d'Accès)

**Trigger** : Après création de demande d'accès  
**Destinataire** : support@seeg-talentsource.com  
**Objet** : "Nouvelle Demande d'Accès - OneHCM"

**Variables** :
- `firstName` : Prénom du candidat
- `lastName` : Nom du candidat
- `email` : Email du candidat
- `phone` : Téléphone
- `matricule` : Matricule SEEG
- `dateOfBirth` : Date de naissance
- `sexe` : Sexe
- `adresse` : Adresse

**Contenu** :
```
[Titre Bleu] Nouvelle Demande d'Accès

Une nouvelle demande d'accès à la plateforme a été enregistrée.

[Encadré Gris - Informations du Candidat]
Nom complet : [Prénom] [Nom]
Email : [Email]
Téléphone : [Téléphone]
Matricule SEEG : [Matricule]
Date de naissance : [Date]
Sexe : [Homme/Femme]
Adresse : [Adresse]

Type de demande : Candidat interne sans email professionnel SEEG
Date de la demande : [Date et Heure]

[Bouton] Accéder au Dashboard Recruteur
https://www.seeg-talentsource.com/recruiter/access-requests

Cordialement,
Système OneHCM - SEEG Talent Source
```

---

### Email 4 : Approbation de Demande d'Accès

**Trigger** : Quand un recruteur approuve une demande  
**Destinataire** : Candidat concerné  
**Objet** : "Accès Approuvé - OneHCM"

**Variables** :
- `userEmail` : Email du candidat
- `firstName` : Prénom
- `lastName` : Nom
- `sexe` : 'M' ou 'F'

**Contenu** :
```
[Titre Vert] Demande d'Accès Approuvée

[Salutation] Monsieur/Madame [Prénom] [Nom],

Bonne nouvelle ! Votre demande d'accès à la plateforme OneHCM - SEEG Talent Source a été approuvée.

[Encadré Vert]
✅ Votre compte est maintenant actif !

Vous pouvez désormais vous connecter et accéder à toutes les fonctionnalités :
- Consulter les offres d'emploi
- Postuler aux postes disponibles
- Suivre vos candidatures
- Gérer votre profil

[Bouton Vert] Se Connecter
https://www.seeg-talentsource.com

[Encadré Bleu]
📧 Besoin d'aide ?
Contact : support@seeg-talentsource.com

Cordialement,
L'équipe OneHCM - SEEG Talent Source
https://www.seeg-talentsource.com

[Logo OneHCM]
```

---

### Email 5 : Refus de Demande d'Accès

**Trigger** : Quand un recruteur refuse une demande  
**Destinataire** : Candidat concerné  
**Objet** : "Demande d'Accès Refusée - OneHCM"

**Variables** :
- `userEmail` : Email du candidat
- `firstName` : Prénom
- `lastName` : Nom
- `sexe` : 'M' ou 'F'
- `reason` : Motif du refus (minimum 20 caractères)

**Contenu** :
```
[Titre Rouge] Demande d'Accès Refusée

[Salutation] Monsieur/Madame [Prénom] [Nom],

Nous vous informons que votre demande d'accès à la plateforme OneHCM - SEEG Talent Source n'a pas pu être validée.

[Encadré Rouge avec Bordure Gauche]
❌ Motif du refus

[Motif du refus saisi par le recruteur]

Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions, n'hésitez pas à contacter notre équipe support.

[Encadré Bleu]
📞 Contact Support
support@seeg-talentsource.com

Cordialement,
L'équipe OneHCM - SEEG Talent Source
https://www.seeg-talentsource.com

[Logo OneHCM]
```

---

## 🔐 Logique d'Authentification

### Inscription (Sign Up)

**Endpoint** : `POST /api/v1/auth/signup`

**Données Reçues** :
```json
{
  "email": "candidate@example.com",
  "password": "SecurePass#123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+24106223344",
  "date_of_birth": "1990-05-15",
  "sexe": "M",
  "adresse": "123 Rue Example, Libreville",
  "candidate_status": "interne" | "externe",
  "matricule": "123456" (si interne),
  "no_seeg_email": true | false (si interne)
}
```

**Logique** :

1. **Validation** :
   - Si `candidate_status = 'interne'` :
     - Si `no_seeg_email = false` : Valider que l'email se termine par `@seeg.com`
     - Si `matricule` fourni : Appeler `verify_matricule(matricule)` pour valider
   
2. **Création du Compte** :
   - Créer l'utilisateur dans `auth.users`
   - Le trigger `handle_new_user` crée automatiquement l'entrée dans `users`
   - Déterminer le `statut` :
     - Si `candidate_status = 'interne'` ET `no_seeg_email = true` → `statut = 'en_attente'`
     - Sinon → `statut = 'actif'`

3. **Création de Demande d'Accès** (si nécessaire) :
   - Si `statut = 'en_attente'`, le trigger `log_access_request` crée automatiquement une entrée dans `access_requests`

4. **Envoi des Emails** :
   - Si `statut = 'actif'` :
     - Envoyer **Email 1 : Bienvenue**
   - Si `statut = 'en_attente'` :
     - Envoyer **Email 2 : Demande d'Accès en Attente** au candidat
     - Envoyer **Email 3 : Notification Admin** à `support@seeg-talentsource.com`

---

### Connexion (Sign In)

**Endpoint** : `POST /api/v1/auth/login`

**Données Reçues** :
```json
{
  "email": "candidate@example.com",
  "password": "SecurePass#123"
}
```

**Logique** :

1. **Authentification** :
   - Vérifier les identifiants

2. **Vérification du Statut** :
   - Récupérer `statut` depuis la table `users`
   - Si `statut != 'actif'` :
     - Refuser la connexion
     - Retourner un message selon le statut :
       - `'en_attente'` : "Votre compte est en attente de validation par notre équipe."
       - `'inactif'` : "Votre compte a été désactivé. Contactez l'administrateur."
       - `'bloqué'` : "Votre compte a été bloqué. Contactez l'administrateur."
       - `'archivé'` : "Votre compte a été archivé. Contactez l'administrateur."

3. **Connexion Réussie** :
   - Si `statut = 'actif'` :
     - Générer le token JWT
     - Retourner les informations utilisateur

---

### Gestion des Demandes d'Accès (Recruteur)

#### Approuver une Demande

**Endpoint** : `POST /api/v1/rpc/approve_access_request`

**Données** :
```json
{
  "request_id": "uuid-de-la-demande"
}
```

**Logique** :
1. Appeler la fonction PostgreSQL `approve_access_request(request_id)`
2. La fonction :
   - Met à jour `users.statut = 'actif'`
   - Met à jour `access_requests.status = 'approved'`
   - Enregistre `reviewed_at` et `reviewed_by`
3. Envoyer **Email 4 : Approbation** au candidat

---

#### Refuser une Demande

**Endpoint** : `POST /api/v1/rpc/reject_access_request`

**Données** :
```json
{
  "request_id": "uuid-de-la-demande",
  "p_rejection_reason": "Motif du refus (minimum 20 caractères)"
}
```

**Logique** :
1. Appeler la fonction PostgreSQL `reject_access_request(request_id, p_rejection_reason)`
2. La fonction :
   - Met à jour `users.statut = 'bloqué'`
   - Met à jour `access_requests.status = 'rejected'`
   - Enregistre le motif dans `rejection_reason`
   - Enregistre `reviewed_at` et `reviewed_by`
3. Envoyer **Email 5 : Refus** au candidat avec le motif

---

## 📋 Endpoints API Requis

### Authentification

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| POST | `/api/v1/auth/signup` | Inscription | Public |
| POST | `/api/v1/auth/login` | Connexion | Public |
| POST | `/api/v1/auth/logout` | Déconnexion | Authenticated |
| GET | `/api/v1/auth/me` | Infos utilisateur | Authenticated |

### Vérification Matricule

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| POST | `/api/v1/rpc/verify_matricule` | Vérifier un matricule | Public |

**Request** :
```json
{
  "p_matricule": "123456"
}
```

**Response** :
```json
{
  "result": true | false
}
```

### Gestion des Demandes d'Accès

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/api/v1/access_requests` | Lister les demandes | Admin, Recruteur, Observateur |
| POST | `/api/v1/rpc/approve_access_request` | Approuver une demande | Admin, Recruteur |
| POST | `/api/v1/rpc/reject_access_request` | Refuser une demande | Admin, Recruteur |
| POST | `/api/v1/rpc/mark_all_access_requests_as_viewed` | Marquer comme vues | Admin, Recruteur, Observateur |

**GET /api/v1/access_requests** :
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "email": "candidate@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "phone": "+24106223344",
      "matricule": "123456",
      "request_type": "internal_no_seeg_email",
      "status": "pending",
      "rejection_reason": null,
      "viewed": false,
      "created_at": "2025-01-10T10:30:00Z",
      "reviewed_at": null,
      "reviewed_by": null,
      "users": {
        "date_of_birth": "1990-05-15",
        "sexe": "M",
        "adresse": "123 Rue Example",
        "statut": "en_attente"
      }
    }
  ]
}
```

---

## 🔒 Permissions et Rôles

### Rôles Utilisateurs

| Rôle | Valeur | Description |
|------|--------|-------------|
| Candidat | `candidat` | Utilisateur standard |
| Recruteur | `recruteur` | Peut gérer les candidatures et demandes d'accès |
| Observateur | `observateur` | Lecture seule sur les candidatures et demandes |
| Admin | `admin` | Accès complet |

### Permissions par Endpoint

| Endpoint | Candidat | Recruteur | Observateur | Admin |
|----------|----------|-----------|-------------|-------|
| `verify_matricule` | ✅ | ✅ | ✅ | ✅ |
| GET `access_requests` | ❌ | ✅ | ✅ | ✅ |
| `approve_access_request` | ❌ | ✅ | ❌ | ✅ |
| `reject_access_request` | ❌ | ✅ | ❌ | ✅ |
| `mark_all_as_viewed` | ❌ | ✅ | ✅ | ✅ |

---

## 📊 Diagramme des Flux

### Flux 1 : Inscription Candidat Externe

```
Candidat remplit le formulaire
  ↓
candidate_status = 'externe'
  ↓
Création compte auth.users
  ↓
Trigger handle_new_user
  ↓
Insertion dans users (statut = 'actif')
  ↓
Email 1 : Bienvenue envoyé
  ↓
Candidat peut se connecter ✅
```

---

### Flux 2 : Inscription Candidat Interne (avec Email SEEG)

```
Candidat remplit le formulaire
  ↓
candidate_status = 'interne'
no_seeg_email = false
email se termine par @seeg.com
  ↓
Création compte auth.users
  ↓
Trigger handle_new_user
  ↓
Insertion dans users (statut = 'actif')
  ↓
Email 1 : Bienvenue envoyé
  ↓
Candidat peut se connecter ✅
```

---

### Flux 3 : Inscription Candidat Interne (sans Email SEEG)

```
Candidat remplit le formulaire
  ↓
candidate_status = 'interne'
no_seeg_email = true
  ↓
Création compte auth.users
  ↓
Trigger handle_new_user
  ↓
Insertion dans users (statut = 'en_attente')
  ↓
Trigger log_access_request
  ↓
Création demande dans access_requests
  ↓
Email 2 : Demande en Attente → Candidat
Email 3 : Notification Admin → support@seeg-talentsource.com
  ↓
Candidat NE PEUT PAS se connecter ❌
  ↓
[Attente validation recruteur]
  ↓
Recruteur approuve → approve_access_request()
  ↓
users.statut = 'actif'
access_requests.status = 'approved'
  ↓
Email 4 : Approbation → Candidat
  ↓
Candidat peut maintenant se connecter ✅
```

---

### Flux 4 : Refus de Demande d'Accès

```
Recruteur clique sur "Refuser"
  ↓
Modal : Saisie du motif (min 20 caractères)
  ↓
Appel reject_access_request(request_id, reason)
  ↓
users.statut = 'bloqué'
access_requests.status = 'rejected'
access_requests.rejection_reason = reason
  ↓
Email 5 : Refus avec motif → Candidat
  ↓
Candidat ne peut pas se connecter ❌
```

---

## 🧪 Tests à Effectuer

### Test 1 : Inscription Candidat Externe
1. Remplir le formulaire (candidate_status = 'externe')
2. Vérifier création dans `users` avec `statut = 'actif'`
3. Vérifier réception Email 1 : Bienvenue
4. Vérifier connexion possible immédiatement

### Test 2 : Inscription Candidat Interne avec Email SEEG
1. Remplir le formulaire (candidate_status = 'interne', email @seeg.com, no_seeg_email = false)
2. Vérifier création dans `users` avec `statut = 'actif'`
3. Vérifier réception Email 1 : Bienvenue
4. Vérifier connexion possible immédiatement

### Test 3 : Inscription Candidat Interne sans Email SEEG
1. Remplir le formulaire (candidate_status = 'interne', no_seeg_email = true)
2. Vérifier création dans `users` avec `statut = 'en_attente'`
3. Vérifier création dans `access_requests` avec `status = 'pending'`
4. Vérifier réception Email 2 par le candidat
5. Vérifier réception Email 3 par support@seeg-talentsource.com
6. Vérifier connexion impossible (message "compte en attente")

### Test 4 : Approbation de Demande
1. Se connecter en tant que recruteur
2. Voir la demande en attente
3. Cliquer sur "Approuver"
4. Vérifier `users.statut = 'actif'`
5. Vérifier `access_requests.status = 'approved'`
6. Vérifier réception Email 4 par le candidat
7. Vérifier que le candidat peut maintenant se connecter

### Test 5 : Refus de Demande
1. Se connecter en tant que recruteur
2. Voir la demande en attente
3. Cliquer sur "Refuser"
4. Saisir motif (min 20 caractères)
5. Confirmer
6. Vérifier `users.statut = 'bloqué'`
7. Vérifier `access_requests.status = 'rejected'`
8. Vérifier `access_requests.rejection_reason` contient le motif
9. Vérifier réception Email 5 avec le motif par le candidat
10. Vérifier que le candidat ne peut pas se connecter (message "compte bloqué")

### Test 6 : Vérification Matricule
1. Appeler `verify_matricule('123456')` avec un matricule valide
2. Vérifier retour `true`
3. Appeler avec un matricule invalide
4. Vérifier retour `false`

### Test 7 : Badge "Demandes d'Accès"
1. Créer 3 nouvelles demandes
2. Badge doit afficher (3)
3. Visiter la page "Demandes d'accès"
4. Fonction `mark_all_as_viewed()` appelée automatiquement
5. Badge passe à (0)
6. Créer une nouvelle demande
7. Badge repasse à (1)

---

## 📝 Notes Importantes

### Statuts Utilisateur vs Statuts Demande

**Table `users` - Champ `statut`** :
- `'actif'` : Compte actif, peut se connecter
- `'en_attente'` : En attente de validation
- `'inactif'` : Compte désactivé temporairement
- `'bloqué'` : Compte bloqué définitivement
- `'archivé'` : Compte archivé (ancien compte)

**Table `access_requests` - Champ `status`** :
- `'pending'` : Demande en attente de traitement
- `'approved'` : Demande approuvée
- `'rejected'` : Demande rejetée

### Correspondance

| Événement | users.statut | access_requests.status |
|-----------|--------------|------------------------|
| Création demande | `'en_attente'` | `'pending'` |
| Approbation | `'actif'` | `'approved'` |
| Refus | `'bloqué'` | `'rejected'` |

### Sécurité

- Toutes les fonctions RPC utilisent `SECURITY DEFINER`
- Vérification du rôle dans chaque fonction
- Les fonctions `approve` et `reject` sont réservées aux admin/recruteur
- La fonction `mark_as_viewed` est accessible aux observateurs
- La fonction `verify_matricule` est publique (nécessaire pour l'inscription)

### Performance

- Index créés sur tous les champs de filtrage et de recherche
- Index composite sur `(status, viewed)` pour les comptages
- Index sur `created_at DESC` pour le tri par date

---

## 📞 Contact

Pour toute question ou clarification sur ces spécifications :

**Email** : support@seeg-talentsource.com  
**Documentation Frontend** : Disponible dans le dossier `/docs` du projet React

---

**Document généré le** : 10 Janvier 2025  
**Version** : 1.0  
**Auteur** : Équipe Développement OneHCM

