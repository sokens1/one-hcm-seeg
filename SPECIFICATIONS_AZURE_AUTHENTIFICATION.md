# Spécifications Techniques - Système d'Authentification et Gestion des Demandes d'Accès
## OneHCM - SEEG Talent Source

**Date** : 10 Janvier 2025  
**Destinataire** : Développeur Backend Azure  
**Objet** : Modifications de la base de données et logique d'authentification

---

## 🎯 Vue d'Ensemble

Ce document détaille toutes les modifications apportées au système d'authentification et de gestion des utilisateurs depuis la mise en place initiale. Ces modifications doivent être répliquées dans la base de données Azure PostgreSQL et l'API backend.

---

## 📊 Table 1 : `users` - Modifications Détaillées

### Vue d'Ensemble

La table `users` stocke tous les utilisateurs de la plateforme (candidats, recruteurs, observateurs, admins). Les modifications suivantes permettent de gérer les profils candidats avec toutes les informations nécessaires et de contrôler l'accès selon leur statut.

---

### Nouveaux Champs Ajoutés avec Cas d'Usage

#### 1️⃣ `date_of_birth` (DATE)

**Type** : DATE  
**Nullable** : YES  
**Défaut** : NULL  

**Quand est-elle renseignée ?**
- ✅ Lors de l'inscription d'un candidat (externe ou interne)
- ✅ Remplie automatiquement via le trigger `handle_new_user` depuis `raw_user_meta_data->>'date_of_birth'`

**Utilisée pour** :
- Calcul de l'âge du candidat
- Statistiques RH (pyramide des âges)
- Affichage dans le profil candidat
- Affichage dans les demandes d'accès

**Exemple** :
```sql
-- Inscription d'un candidat né le 15 mai 1990
date_of_birth = '1990-05-15'
```

---

#### 2️⃣ `sexe` (TEXT)

**Type** : TEXT (VARCHAR 1)  
**Nullable** : YES  
**Défaut** : NULL  
**Contrainte** : CHECK (sexe IS NULL OR sexe IN ('M', 'F'))

**Valeurs possibles** :
- `'M'` = Homme (Masculin)
- `'F'` = Femme (Féminin)
- `NULL` = Non renseigné

**Quand est-elle renseignée ?**
- ✅ Lors de l'inscription d'un candidat
- ✅ Remplie automatiquement via le trigger `handle_new_user`

**Utilisée pour** :
- **Emails personnalisés** : Détermine si on écrit "Monsieur" ou "Madame"
  - Si `sexe = 'M'` → "Monsieur [Prénom] [Nom]"
  - Si `sexe = 'F'` → "Madame [Prénom] [Nom]"
- Statistiques RH (répartition hommes/femmes)
- Affichage dans le profil et les demandes d'accès

**Exemple** :
```sql
-- Candidat masculin
sexe = 'M'  → Email commence par "Monsieur Jean Dupont"

-- Candidate féminine
sexe = 'F'  → Email commence par "Madame Marie Martin"
```

---

#### 3️⃣ `adresse` (TEXT)

**Type** : TEXT  
**Nullable** : YES  
**Défaut** : NULL

**Quand est-elle renseignée ?**
- ✅ Lors de l'inscription d'un candidat
- ✅ Remplie automatiquement via le trigger `handle_new_user`

**Utilisée pour** :
- Affichage dans le profil candidat
- Affichage dans les demandes d'accès
- Statistiques géographiques (répartition par région)
- Contact postal si nécessaire

**Exemple** :
```sql
adresse = '123 Rue de la Liberté, Quartier Montagne, Libreville, Gabon'
```

---

#### 4️⃣ `candidate_status` (TEXT)

**Type** : TEXT (VARCHAR 10)  
**Nullable** : YES  
**Défaut** : NULL  
**Contrainte** : CHECK (candidate_status IS NULL OR candidate_status IN ('interne', 'externe'))

**Valeurs possibles** :
- `'interne'` = Candidat interne (employé SEEG actuel)
- `'externe'` = Candidat externe (personne hors SEEG)
- `NULL` = Non renseigné (utilisateurs non-candidats)

**Quand est-elle renseignée ?**
- ✅ **Lors de l'inscription d'un candidat**
- ✅ Le candidat choisit son type au début du formulaire

**Détermine** :
- ✅ **Si le matricule est requis** :
  - `'interne'` → Matricule REQUIS et vérifié via `verify_matricule()`
  - `'externe'` → Matricule non demandé (reste NULL)

- ✅ **Validation de l'email** :
  - `'interne'` + `no_seeg_email = false` → Email doit se terminer par `@seeg.com`
  - `'interne'` + `no_seeg_email = true` → N'importe quel email accepté
  - `'externe'` → N'importe quel email accepté

**Exemple** :
```sql
-- Candidat interne (employé SEEG)
candidate_status = 'interne'
  → Formulaire affiche le champ matricule
  → Validation email @seeg.com (sauf si no_seeg_email = true)

-- Candidat externe
candidate_status = 'externe'
  → Champ matricule masqué
  → N'importe quel email accepté
```

---

#### 5️⃣ `statut` (TEXT) ⭐ **CRITIQUE**

**Type** : TEXT (VARCHAR 20)  
**Nullable** : YES  
**Défaut** : 'actif'  
**Contrainte** : CHECK (statut IS NULL OR statut IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé'))

**Valeurs possibles et leurs significations** :

| Valeur | Signification | Peut se connecter ? |
|--------|---------------|---------------------|
| `'actif'` | Compte actif et validé | ✅ OUI |
| `'en_attente'` | En attente de validation par un recruteur | ❌ NON |
| `'inactif'` | Compte désactivé temporairement par admin | ❌ NON |
| `'bloqué'` | Compte bloqué (demande refusée ou sanction) | ❌ NON |
| `'archivé'` | Compte archivé (ancien compte fermé) | ❌ NON |

**RÈGLE AUTOMATIQUE - Déterminé à l'inscription** :

1. **Candidat EXTERNE** :
   ```sql
   candidate_status = 'externe'
   → statut = 'actif'  ✅ Connexion immédiate possible
   ```

2. **Candidat INTERNE avec Email @seeg.com** :
   ```sql
   candidate_status = 'interne' 
   AND no_seeg_email = false
   AND email LIKE '%@seeg.com'
   → statut = 'actif'  ✅ Connexion immédiate possible
   ```

3. **Candidat INTERNE sans Email @seeg.com** :
   ```sql
   candidate_status = 'interne' 
   AND no_seeg_email = true
   → statut = 'en_attente'  ❌ DOIT ÊTRE VALIDÉ par un recruteur
   → Insertion automatique dans la table 'access_requests'
   → Email envoyé au candidat et à support@seeg-talentsource.com
   ```

**Transitions de Statut** :

| Événement | Statut Avant | Statut Après | Action |
|-----------|--------------|--------------|--------|
| Inscription externe | - | `'actif'` | Automatique |
| Inscription interne + email SEEG | - | `'actif'` | Automatique |
| Inscription interne - email SEEG | - | `'en_attente'` | Automatique |
| Recruteur approuve demande | `'en_attente'` | `'actif'` | `approve_access_request()` |
| Recruteur refuse demande | `'en_attente'` | `'bloqué'` | `reject_access_request()` |
| Admin désactive compte | `'actif'` | `'inactif'` | Action manuelle |
| Admin réactive compte | `'inactif'` | `'actif'` | Action manuelle |
| Admin archive ancien compte | `'actif'` | `'archivé'` | Action manuelle |

**Vérification à la Connexion** :
```sql
-- À chaque tentative de connexion, vérifier :
SELECT statut FROM users WHERE id = user_id;

IF statut != 'actif' THEN
  -- Refuser la connexion
  -- Afficher le message correspondant au statut
  RETURN ERROR
END IF
```

---

#### 6️⃣ `poste_actuel` (TEXT)

**Type** : TEXT  
**Nullable** : YES  
**Défaut** : NULL

**Quand est-elle renseignée ?**
- ✅ OPTIONNEL lors de l'inscription
- ✅ Peut être mise à jour dans les paramètres du profil

**Utilisée pour** :
- Affichage dans le profil candidat
- Statistiques sur les postes d'origine
- Analyse des mobilités internes

**Exemple** :
```sql
poste_actuel = 'Technicien Réseau Eau'
poste_actuel = 'Agent Commercial'
poste_actuel = NULL  -- Si non renseigné ou candidat externe
```

---

#### 7️⃣ `annees_experience` (INTEGER)

**Type** : INTEGER  
**Nullable** : YES  
**Défaut** : NULL

**Quand est-elle renseignée ?**
- ✅ OPTIONNEL lors de l'inscription
- ✅ Peut être mise à jour dans les paramètres du profil

**Utilisée pour** :
- Affichage dans le profil candidat
- Statistiques d'expérience
- Filtrage des candidats par séniorité

**Exemple** :
```sql
annees_experience = 5   -- 5 ans d'expérience
annees_experience = 0   -- Débutant
annees_experience = NULL -- Non renseigné
```

---

#### 8️⃣ `no_seeg_email` (BOOLEAN) ⭐ **IMPORTANT**

**Type** : BOOLEAN  
**Nullable** : YES  
**Défaut** : FALSE

**Quand est-elle renseignée ?**
- ✅ **Uniquement pour les candidats INTERNES**
- ✅ Lors de l'inscription, si le candidat coche "Je n'ai pas d'email professionnel SEEG"

**LOGIQUE CRITIQUE** :

```
Candidat INTERNE s'inscrit
  ↓
Question : "Avez-vous un email professionnel @seeg.com ?"
  ↓
  ├─ NON (checkbox cochée) → no_seeg_email = TRUE
  │   ↓
  │   Email peut être n'importe lequel (gmail, yahoo, etc.)
  │   ↓
  │   statut = 'en_attente'
  │   ↓
  │   Insertion dans 'access_requests' (validation requise)
  │   ↓
  │   Emails envoyés (candidat + support)
  │
  └─ OUI (checkbox non cochée) → no_seeg_email = FALSE
      ↓
      Email DOIT se terminer par @seeg.com
      ↓
      statut = 'actif'
      ↓
      Connexion immédiate possible
```

**Exemple** :
```sql
-- Cas 1 : Candidat interne avec email SEEG
candidate_status = 'interne'
no_seeg_email = FALSE
email = 'jean.dupont@seeg.com'
→ statut = 'actif' ✅

-- Cas 2 : Candidat interne SANS email SEEG
candidate_status = 'interne'
no_seeg_email = TRUE
email = 'jean.perso@gmail.com'
→ statut = 'en_attente' ⏳
→ INSERT dans access_requests
→ Validation requise

-- Cas 3 : Candidat externe
candidate_status = 'externe'
no_seeg_email = FALSE (ou NULL)
email = 'externe@gmail.com'
→ statut = 'actif' ✅
```

---

### Champ Modifié

#### `matricule` (TEXT)

**Avant** : NOT NULL (requis pour tous)  
**Après** : NULL (optionnel)

**Raison** :
- ✅ **Candidats EXTERNES** : N'ont pas de matricule SEEG → `matricule = NULL`
- ✅ **Candidats INTERNES** : Doivent fournir leur matricule → `matricule = '123456'`

**Quand est-il renseigné ?**
- ✅ **Uniquement pour les candidats INTERNES**
- ✅ Vérifié en temps réel via la fonction `verify_matricule(matricule)` contre la table `seeg_agents`
- ✅ Si matricule invalide ou non trouvé → Inscription refusée

**Validation** :
```sql
-- Lors de l'inscription d'un candidat interne
IF candidate_status = 'interne' THEN
  -- Vérifier que le matricule existe dans seeg_agents
  SELECT verify_matricule('123456')
  → Doit retourner TRUE
  → Sinon, afficher "Matricule invalide"
END IF
```

**Exemple** :
```sql
-- Candidat interne
candidate_status = 'interne'
matricule = '123456'  -- Vérifié dans seeg_agents

-- Candidat externe
candidate_status = 'externe'
matricule = NULL  -- Pas de matricule
```

---

### Index Créés

```sql
CREATE INDEX idx_users_statut ON users(statut);
CREATE INDEX idx_users_candidate_status ON users(candidate_status);
CREATE INDEX idx_users_matricule ON users(matricule) WHERE matricule IS NOT NULL;
```

**Pourquoi ces index ?**
- `idx_users_statut` : Pour filtrer rapidement les utilisateurs par statut (actif, en_attente, etc.)
- `idx_users_candidate_status` : Pour séparer candidats internes/externes
- `idx_users_matricule` : Pour vérifier rapidement si un matricule existe (partial index car peut être NULL)

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

### Vue d'Ensemble

La table `access_requests` enregistre **toutes les demandes d'accès** des candidats internes sans email professionnel SEEG. Elle permet aux recruteurs de valider ou refuser ces demandes.

**QUAND est-elle utilisée ?**
- ✅ **Uniquement pour les candidats INTERNES sans email @seeg.com**
- ✅ Automatiquement remplie par le trigger `log_access_request` lors de l'inscription
- ✅ Mise à jour par les recruteurs via `approve_access_request()` ou `reject_access_request()`

---

### Création de la Table

```sql
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  reviewed_by TEXT REFERENCES users(id)
);
```

**⚠️ IMPORTANT** : 
- Si dans votre système Azure, `users.id` est de type **UUID**, alors utilisez **UUID** pour `user_id` et `reviewed_by`
- Si `users.id` est de type **TEXT**, utilisez **TEXT** (comme ci-dessus)
- **Les types doivent correspondre exactement !**

---

### Description Détaillée des Champs

#### 1️⃣ `id` (UUID)

**Type** : UUID  
**Nullable** : NO  
**Défaut** : `gen_random_uuid()`  
**Clé Primaire** : OUI

**Quand est-il généré ?**
- ✅ Automatiquement à chaque création de demande d'accès
- ✅ Généré par PostgreSQL via `gen_random_uuid()`

**Utilisé pour** :
- Identifier de manière unique chaque demande
- Référence lors de l'approbation/refus : `approve_access_request(request_id)`

---

#### 2️⃣ `user_id` (TEXT) ⭐ **RÉFÉRENCE CRITIQUE**

**Type** : TEXT (ou UUID selon votre schéma)  
**Nullable** : NO  
**Clé Étrangère** : `REFERENCES users(id) ON DELETE CASCADE`

**Quand est-il renseigné ?**
- ✅ **Automatiquement lors de la création de la demande** par le trigger `log_access_request`
- ✅ Copié depuis `NEW.id` (l'ID du nouvel utilisateur créé)

**LOGIQUE** :
```
Candidat interne sans email SEEG s'inscrit
  ↓
Trigger handle_new_user crée l'utilisateur dans 'users'
  user_id_créé = 'abc-123-def-456'
  statut = 'en_attente'
  ↓
Trigger log_access_request détecte statut = 'en_attente'
  ↓
INSERT dans access_requests (
  user_id = 'abc-123-def-456'  ← Même ID que l'utilisateur
)
```

**Utilisé pour** :
- Lier la demande d'accès à l'utilisateur concerné
- Récupérer toutes les infos du candidat via JOIN
- Mettre à jour le statut de l'utilisateur lors de l'approbation/refus

**Exemple** :
```sql
-- Demande créée pour l'utilisateur Jean Dupont
user_id = 'abc-123-def-456'  
  → Correspond à users.id où email = 'jean.perso@gmail.com'
```

---

#### 3️⃣ `email` (TEXT)

**Type** : TEXT  
**Nullable** : NO

**Quand est-il renseigné ?**
- ✅ Copié depuis `users.email` lors de la création de la demande
- ✅ Rempli automatiquement par le trigger `log_access_request`

**Utilisé pour** :
- Affichage dans le dashboard recruteur
- Envoi des emails (approbation/refus)
- Recherche de demandes par email

**Exemple** :
```sql
email = 'jean.perso@gmail.com'
```

---

#### 4️⃣ `first_name` et `last_name` (TEXT)

**Type** : TEXT  
**Nullable** : YES

**Quand sont-ils renseignés ?**
- ✅ Copiés depuis `users.first_name` et `users.last_name`
- ✅ Remplis automatiquement par le trigger `log_access_request`

**Utilisés pour** :
- Affichage du nom complet dans le dashboard
- Personnalisation des emails : "Monsieur Jean Dupont"

**Exemple** :
```sql
first_name = 'Jean'
last_name = 'Dupont'
```

---

#### 5️⃣ `phone` (TEXT)

**Type** : TEXT  
**Nullable** : YES

**Quand est-il renseigné ?**
- ✅ Copié depuis `users.phone`
- ✅ Rempli automatiquement par le trigger

**Utilisé pour** :
- Affichage dans le dashboard recruteur
- Contact éventuel du candidat

**Exemple** :
```sql
phone = '+24106223344'
```

---

#### 6️⃣ `matricule` (TEXT)

**Type** : TEXT  
**Nullable** : YES

**Quand est-il renseigné ?**
- ✅ Copié depuis `users.matricule`
- ✅ Rempli automatiquement par le trigger
- ✅ **Toujours renseigné** car seuls les candidats internes créent des demandes

**Utilisé pour** :
- Vérification de l'identité du candidat interne
- Affichage dans le dashboard recruteur
- Traçabilité des demandes par matricule

**Exemple** :
```sql
matricule = '123456'  -- Matricule SEEG vérifié
```

---

#### 7️⃣ `request_type` (TEXT)

**Type** : TEXT  
**Nullable** : YES  
**Défaut** : 'internal_no_seeg_email'

**Valeurs possibles** :
- `'internal_no_seeg_email'` = Candidat interne sans email professionnel SEEG

**Quand est-il renseigné ?**
- ✅ **Automatiquement à 'internal_no_seeg_email'** lors de la création
- ✅ Permet d'ajouter d'autres types de demandes à l'avenir

**Utilisé pour** :
- Catégoriser les types de demandes
- Filtrer par type de demande
- Extensibilité future (autres types de demandes possibles)

---

#### 8️⃣ `status` (TEXT) ⭐ **STATUT DE LA DEMANDE**

**Type** : TEXT  
**Nullable** : YES  
**Défaut** : 'pending'  
**Contrainte** : CHECK (status IN ('pending', 'approved', 'rejected'))

**Valeurs possibles** :

| Valeur | Signification | Badge UI | Actions Disponibles |
|--------|---------------|----------|---------------------|
| `'pending'` | Demande en attente de traitement | 🟡 Jaune | Approuver / Refuser |
| `'approved'` | Demande approuvée par un recruteur | 🟢 Vert | Aucune |
| `'rejected'` | Demande refusée par un recruteur | 🔴 Rouge | Aucune |

**Transitions** :
```
pending → approved  (Recruteur clique "Approuver")
pending → rejected  (Recruteur clique "Refuser")
```

**IMPORTANT** :
- ✅ Une demande `'pending'` nécessite une action du recruteur
- ✅ Une fois `'approved'` ou `'rejected'`, le statut ne change plus
- ✅ Le `users.statut` est mis à jour en conséquence :
  - `status = 'approved'` → `users.statut = 'actif'`
  - `status = 'rejected'` → `users.statut = 'bloqué'`

**Exemple** :
```sql
-- Nouvelle demande
status = 'pending'
users.statut = 'en_attente'
  → Candidat ne peut PAS se connecter

-- Après approbation
status = 'approved'
users.statut = 'actif'
  → Candidat peut maintenant se connecter ✅

-- Après refus
status = 'rejected'
users.statut = 'bloqué'
  → Candidat ne peut JAMAIS se connecter ❌
```

---

#### 9️⃣ `rejection_reason` (TEXT)

**Type** : TEXT  
**Nullable** : YES  
**Défaut** : NULL

**Quand est-il renseigné ?**
- ✅ **UNIQUEMENT quand un recruteur REFUSE une demande**
- ✅ Rempli via la fonction `reject_access_request(request_id, p_rejection_reason)`
- ✅ Minimum 20 caractères requis (validation frontend)

**Utilisé pour** :
- **Email de refus** : Le motif est inclus dans l'email envoyé au candidat
- Historique et traçabilité des refus
- Statistiques sur les motifs de refus

**Exemple** :
```sql
-- Demande approuvée
rejection_reason = NULL

-- Demande refusée
rejection_reason = 'Matricule invalide ou informations non vérifiables. Veuillez contacter le service RH.'
```

---

#### 🔟 `viewed` (BOOLEAN) ⭐ **SYSTÈME DE NOTIFICATION**

**Type** : BOOLEAN  
**Nullable** : NO  
**Défaut** : FALSE

**LOGIQUE DU BADGE** :

```
Nouvelle demande créée
  ↓
viewed = FALSE
  ↓
Badge "Demandes d'accès (1)" affiché dans la sidebar recruteur
  ↓
Recruteur clique sur "Demandes d'accès"
  ↓
Fonction mark_all_access_requests_as_viewed() appelée
  ↓
UPDATE access_requests SET viewed = TRUE WHERE status = 'pending'
  ↓
Badge disparaît (0)
  ↓
Nouvelle demande arrive
  ↓
viewed = FALSE (trigger reset_viewed_on_new_request)
  ↓
Badge repasse à (1)
```

**Quand change-t-il ?**
- ✅ `FALSE` → `TRUE` : Quand un recruteur visite la page "Demandes d'accès"
- ✅ Revient à `FALSE` pour chaque nouvelle demande créée (trigger automatique)

**Utilisé pour** :
- Afficher le badge rouge avec le nombre de demandes non vues
- Notifier les recruteurs des nouvelles demandes
- Éviter de notifier pour des demandes déjà consultées

**Exemple** :
```sql
-- Nouvelle demande (non vue)
viewed = FALSE
  → Badge affiche (1)

-- Après visite de la page
viewed = TRUE
  → Badge passe à (0)
```

---

#### 1️⃣1️⃣ `created_at` (TIMESTAMPTZ)

**Type** : TIMESTAMPTZ  
**Nullable** : YES  
**Défaut** : NOW()

**Quand est-il renseigné ?**
- ✅ Automatiquement à la création de la demande
- ✅ Horodatage PostgreSQL avec fuseau horaire

**Utilisé pour** :
- Affichage de la date de demande dans le dashboard
- Tri des demandes (plus récentes en premier)
- Statistiques temporelles (demandes par jour/semaine/mois)

**Exemple** :
```sql
created_at = '2025-01-10 14:30:00+00'
  → Affichage UI : "10/01/2025 à 14:30"
```

---

#### 1️⃣2️⃣ `reviewed_at` (TIMESTAMPTZ)

**Type** : TIMESTAMPTZ  
**Nullable** : YES  
**Défaut** : NULL

**Quand est-il renseigné ?**
- ✅ NULL à la création
- ✅ Rempli avec NOW() quand un recruteur approuve ou refuse
- ✅ Mis à jour par `approve_access_request()` ou `reject_access_request()`

**Utilisé pour** :
- Calculer le délai de traitement (reviewed_at - created_at)
- Statistiques de réactivité de l'équipe
- Historique des actions

**Exemple** :
```sql
-- Demande en attente
reviewed_at = NULL

-- Demande traitée le 12/01/2025 à 10:15
reviewed_at = '2025-01-12 10:15:00+00'
```

---

#### 1️⃣3️⃣ `reviewed_by` (TEXT) ⭐ **TRAÇABILITÉ**

**Type** : TEXT (ou UUID selon votre schéma)  
**Nullable** : YES  
**Défaut** : NULL  
**Clé Étrangère** : `REFERENCES users(id)`

**Quand est-il renseigné ?**
- ✅ NULL à la création
- ✅ Rempli avec `auth.uid()` du recruteur qui traite la demande
- ✅ Mis à jour par `approve_access_request()` ou `reject_access_request()`

**Utilisé pour** :
- Savoir **QUI** a approuvé ou refusé la demande
- Traçabilité et audit
- Statistiques par recruteur
- Affichage dans l'historique : "Approuvée par Marie Koukou le 12/01/2025"

**Exemple** :
```sql
-- Demande en attente (non traitée)
reviewed_by = NULL

-- Demande approuvée par le recruteur Marie Koukou
reviewed_by = 'xyz-789-abc-012'  
  → Correspond à users.id où email = 'marie.koukou@seeg.com'
```

---

### Champs Détaillés avec Cas d'Usage

| Champ | Quand Renseigné | Renseigné Par | Exemple de Valeur | Utilisé Pour |
|-------|-----------------|---------------|-------------------|--------------|
| `id` | Création | PostgreSQL | `'uuid-123-abc'` | Identifier la demande |
| `user_id` | Création | Trigger `log_access_request` | `'user-abc-456'` | Lien vers le candidat |
| `email` | Création | Trigger | `'jean@gmail.com'` | Contact + Affichage |
| `first_name` | Création | Trigger | `'Jean'` | Affichage nom |
| `last_name` | Création | Trigger | `'Dupont'` | Affichage nom |
| `phone` | Création | Trigger | `'+24106223344'` | Contact |
| `matricule` | Création | Trigger | `'123456'` | Vérification identité |
| `request_type` | Création | Défaut | `'internal_no_seeg_email'` | Catégorisation |
| `status` | Création / Traitement | Trigger / Fonction RPC | `'pending'`, `'approved'`, `'rejected'` | État de la demande |
| `rejection_reason` | Refus | Recruteur via RPC | `'Matricule invalide...'` | Motif du refus |
| `viewed` | Création / Visite | Trigger / Fonction RPC | `FALSE` → `TRUE` | Badge notification |
| `created_at` | Création | Défaut PostgreSQL | `'2025-01-10 14:30'` | Date demande |
| `reviewed_at` | Traitement | Fonction RPC | `'2025-01-12 10:15'` | Date traitement |
| `reviewed_by` | Traitement | Fonction RPC | `'recruteur-id'` | Qui a traité |

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

## 🔐 Logique d'Authentification - Scénarios Détaillés

### 📋 SCÉNARIO 1 : Inscription Candidat Externe

**Données Reçues** :
```json
{
  "email": "jean.externe@gmail.com",
  "password": "SecurePass#123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+24106223344",
  "date_of_birth": "1990-05-15",
  "sexe": "M",
  "adresse": "123 Rue Example, Libreville",
  "candidate_status": "externe",
  "matricule": null,
  "no_seeg_email": false
}
```

**Actions sur les Tables** :

#### Étape 1 : Validation
- ✅ Email valide (format standard)
- ✅ Mot de passe respecte les critères de sécurité
- ✅ Tous les champs obligatoires présents

#### Étape 2 : Insertion dans `auth.users`
```sql
INSERT INTO auth.users (
  id,              -- UUID généré automatiquement
  email,           -- "jean.externe@gmail.com"
  encrypted_password, -- Hash du mot de passe
  raw_user_meta_data, -- JSON avec toutes les données
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'jean.externe@gmail.com',
  '[encrypted_password]',
  '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "+24106223344",
    "date_of_birth": "1990-05-15",
    "sexe": "M",
    "adresse": "123 Rue Example, Libreville",
    "candidate_status": "externe",
    "role": "candidat"
  }',
  NOW(),
  NOW()
);
```

#### Étape 3 : Trigger `handle_new_user` → Insertion dans `users`
```sql
INSERT INTO users (
  id,                    -- Même UUID que auth.users
  email,                 -- "jean.externe@gmail.com"
  first_name,            -- "Jean"
  last_name,             -- "Dupont"
  phone,                 -- "+24106223344"
  role,                  -- "candidat"
  matricule,             -- NULL (externe n'a pas de matricule)
  date_of_birth,         -- "1990-05-15"
  sexe,                  -- "M"
  adresse,               -- "123 Rue Example, Libreville"
  candidate_status,      -- "externe"
  statut,                -- "actif" (IMPORTANT: Candidat externe = actif direct)
  no_seeg_email,         -- FALSE
  poste_actuel,          -- NULL
  annees_experience,     -- NULL
  created_at,            -- NOW()
  updated_at             -- NOW()
);
```

**Résultat** :
- ✅ `users.statut = 'actif'`
- ❌ Aucune insertion dans `access_requests`

#### Étape 4 : Envoi Email
- ✅ **Email 1 : Bienvenue** envoyé à `jean.externe@gmail.com`

#### État Final
- ✅ Le candidat peut se connecter immédiatement
- ✅ Pas de validation requise

---

### 📋 SCÉNARIO 2 : Inscription Candidat Interne AVEC Email @seeg.com

**Données Reçues** :
```json
{
  "email": "jean.dupont@seeg.com",
  "password": "SecurePass#123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+24106223344",
  "date_of_birth": "1990-05-15",
  "sexe": "M",
  "adresse": "123 Rue Example, Libreville",
  "candidate_status": "interne",
  "matricule": "123456",
  "no_seeg_email": false
}
```

**Actions sur les Tables** :

#### Étape 1 : Validation
- ✅ Email se termine par `@seeg.com`
- ✅ Mot de passe respecte les critères
- ✅ Vérification matricule : `verify_matricule('123456')` retourne `TRUE`

#### Étape 2 : Insertion dans `auth.users`
```sql
INSERT INTO auth.users (
  id,
  email,                -- "jean.dupont@seeg.com"
  encrypted_password,
  raw_user_meta_data,   -- JSON avec matricule
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'jean.dupont@seeg.com',
  '[encrypted_password]',
  '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "+24106223344",
    "date_of_birth": "1990-05-15",
    "sexe": "M",
    "adresse": "123 Rue Example, Libreville",
    "candidate_status": "interne",
    "matricule": "123456",
    "no_seeg_email": false,
    "role": "candidat"
  }',
  NOW(),
  NOW()
);
```

#### Étape 3 : Trigger `handle_new_user` → Insertion dans `users`
```sql
INSERT INTO users (
  id,
  email,                 -- "jean.dupont@seeg.com"
  first_name,            -- "Jean"
  last_name,             -- "Dupont"
  phone,                 -- "+24106223344"
  role,                  -- "candidat"
  matricule,             -- "123456"
  date_of_birth,         -- "1990-05-15"
  sexe,                  -- "M"
  adresse,               -- "123 Rue Example, Libreville"
  candidate_status,      -- "interne"
  statut,                -- "actif" (Email SEEG = actif direct)
  no_seeg_email,         -- FALSE
  poste_actuel,          -- NULL
  annees_experience,     -- NULL
  created_at,
  updated_at
);
```

**Résultat** :
- ✅ `users.statut = 'actif'`
- ❌ Aucune insertion dans `access_requests`

#### Étape 4 : Envoi Email
- ✅ **Email 1 : Bienvenue** envoyé à `jean.dupont@seeg.com`

#### État Final
- ✅ Le candidat peut se connecter immédiatement
- ✅ Pas de validation requise (a un email professionnel)

---

### 📋 SCÉNARIO 3 : Inscription Candidat Interne SANS Email @seeg.com

**Données Reçues** :
```json
{
  "email": "jean.perso@gmail.com",
  "password": "SecurePass#123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+24106223344",
  "date_of_birth": "1990-05-15",
  "sexe": "M",
  "adresse": "123 Rue Example, Libreville",
  "candidate_status": "interne",
  "matricule": "123456",
  "no_seeg_email": true
}
```

**Actions sur les Tables** :

#### Étape 1 : Validation
- ✅ Email valide (ne se termine PAS par @seeg.com)
- ✅ Checkbox `no_seeg_email = true` cochée
- ✅ Vérification matricule : `verify_matricule('123456')` retourne `TRUE`

#### Étape 2 : Insertion dans `auth.users`
```sql
INSERT INTO auth.users (
  id,
  email,                -- "jean.perso@gmail.com"
  encrypted_password,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'jean.perso@gmail.com',
  '[encrypted_password]',
  '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "+24106223344",
    "date_of_birth": "1990-05-15",
    "sexe": "M",
    "adresse": "123 Rue Example, Libreville",
    "candidate_status": "interne",
    "matricule": "123456",
    "no_seeg_email": true,
    "role": "candidat"
  }',
  NOW(),
  NOW()
);
```

#### Étape 3 : Trigger `handle_new_user` → Insertion dans `users`
```sql
INSERT INTO users (
  id,
  email,                 -- "jean.perso@gmail.com"
  first_name,            -- "Jean"
  last_name,             -- "Dupont"
  phone,                 -- "+24106223344"
  role,                  -- "candidat"
  matricule,             -- "123456"
  date_of_birth,         -- "1990-05-15"
  sexe,                  -- "M"
  adresse,               -- "123 Rue Example, Libreville"
  candidate_status,      -- "interne"
  statut,                -- "en_attente" (IMPORTANT: no_seeg_email=true → en_attente)
  no_seeg_email,         -- TRUE
  poste_actuel,          -- NULL
  annees_experience,     -- NULL
  created_at,
  updated_at
);
```

**Résultat** :
- ✅ `users.statut = 'en_attente'`
- ✅ Condition trigger `log_access_request` remplie

#### Étape 4 : Trigger `log_access_request` → Insertion dans `access_requests`
```sql
INSERT INTO access_requests (
  id,                    -- UUID généré automatiquement
  user_id,               -- UUID du candidat (depuis users.id)
  email,                 -- "jean.perso@gmail.com"
  first_name,            -- "Jean"
  last_name,             -- "Dupont"
  phone,                 -- "+24106223344"
  matricule,             -- "123456"
  request_type,          -- "internal_no_seeg_email"
  status,                -- "pending"
  rejection_reason,      -- NULL
  viewed,                -- FALSE (trigger reset_viewed_on_new_request)
  created_at,            -- NOW()
  reviewed_at,           -- NULL
  reviewed_by            -- NULL
);
```

**Résultat** :
- ✅ Demande d'accès créée dans `access_requests`
- ✅ `access_requests.status = 'pending'`
- ✅ `access_requests.viewed = false`

#### Étape 5 : Envoi Emails
- ✅ **Email 2 : Demande en Attente** envoyé à `jean.perso@gmail.com`
- ✅ **Email 3 : Notification Admin** envoyé à `support@seeg-talentsource.com`

#### État Final
- ❌ Le candidat NE PEUT PAS se connecter (statut = 'en_attente')
- ⏳ Demande visible dans le dashboard recruteur
- ⏳ Badge "Demandes d'accès (1)" affiché

---

### 📋 SCÉNARIO 4 : Connexion Candidat avec Statut 'actif'

**Données Reçues** :
```json
{
  "email": "jean.dupont@seeg.com",
  "password": "SecurePass#123"
}
```

**Actions** :

#### Étape 1 : Authentification
```sql
SELECT * FROM auth.users 
WHERE email = 'jean.dupont@seeg.com' 
  AND encrypted_password = hash('SecurePass#123');
```
- ✅ Utilisateur trouvé dans `auth.users`

#### Étape 2 : Vérification Statut
```sql
SELECT statut, role FROM users 
WHERE id = '[user_id]';
```
**Résultat** :
- `statut = 'actif'`
- `role = 'candidat'`

#### Étape 3 : Validation
- ✅ `statut = 'actif'` → Connexion autorisée

#### Étape 4 : Génération Token JWT
```json
{
  "user_id": "uuid",
  "email": "jean.dupont@seeg.com",
  "role": "candidat",
  "statut": "actif"
}
```

#### État Final
- ✅ Connexion réussie
- ✅ Redirection vers le dashboard candidat

---

### 📋 SCÉNARIO 5 : Connexion Candidat avec Statut 'en_attente'

**Données Reçues** :
```json
{
  "email": "jean.perso@gmail.com",
  "password": "SecurePass#123"
}
```

**Actions** :

#### Étape 1 : Authentification
```sql
SELECT * FROM auth.users 
WHERE email = 'jean.perso@gmail.com' 
  AND encrypted_password = hash('SecurePass#123');
```
- ✅ Utilisateur trouvé dans `auth.users`

#### Étape 2 : Vérification Statut
```sql
SELECT statut, role FROM users 
WHERE id = '[user_id]';
```
**Résultat** :
- `statut = 'en_attente'`
- `role = 'candidat'`

#### Étape 3 : Validation
- ❌ `statut != 'actif'` → Connexion REFUSÉE

#### Étape 4 : Réponse Erreur
```json
{
  "error": "account_pending",
  "message": "Votre compte est en attente de validation par notre équipe."
}
```

#### État Final
- ❌ Connexion refusée
- 💬 Message affiché : "Votre compte est en attente de validation par notre équipe."
- ⏳ Utilisateur reste sur la page de connexion

---

### 📋 SCÉNARIO 6 : Approbation Demande d'Accès par Recruteur

**Action Recruteur** : Clique sur "Approuver" pour une demande

**Données** :
```json
{
  "request_id": "uuid-de-la-demande"
}
```

**Actions sur les Tables** :

#### Étape 1 : Vérification Permissions
```sql
SELECT role FROM users 
WHERE id = auth.uid();
```
- ✅ `role IN ('admin', 'recruteur')`

#### Étape 2 : Récupération Infos Demande
```sql
SELECT user_id, email, first_name, last_name 
FROM access_requests 
WHERE id = '[request_id]';
```
**Résultat** :
- `user_id = 'uuid-candidat'`
- `email = 'jean.perso@gmail.com'`
- `first_name = 'Jean'`
- `last_name = 'Dupont'`

#### Étape 3 : UPDATE dans `users`
```sql
UPDATE users 
SET 
  statut = 'actif',           -- CHANGEMENT: en_attente → actif
  updated_at = NOW()
WHERE id = '[user_id]';
```
**Résultat** :
- ✅ `users.statut` passe de `'en_attente'` à `'actif'`

#### Étape 4 : UPDATE dans `access_requests`
```sql
UPDATE access_requests 
SET 
  status = 'approved',         -- CHANGEMENT: pending → approved
  reviewed_at = NOW(),         -- Date/heure de traitement
  reviewed_by = auth.uid()     -- UUID du recruteur
WHERE id = '[request_id]';
```
**Résultat** :
- ✅ `access_requests.status` passe de `'pending'` à `'approved'`
- ✅ `reviewed_at` enregistre la date
- ✅ `reviewed_by` enregistre qui a approuvé

#### Étape 5 : Envoi Email
- ✅ **Email 4 : Approbation** envoyé à `jean.perso@gmail.com`

#### État Final
- ✅ Le candidat peut maintenant se connecter
- ✅ Demande marquée comme "Approuvée" dans le dashboard
- ✅ Badge "Demandes d'accès" décrémenté de 1

---

### 📋 SCÉNARIO 7 : Refus Demande d'Accès par Recruteur

**Action Recruteur** : Clique sur "Refuser" et saisit le motif

**Données** :
```json
{
  "request_id": "uuid-de-la-demande",
  "p_rejection_reason": "Matricule invalide ou informations non vérifiables"
}
```

**Actions sur les Tables** :

#### Étape 1 : Validation Motif
- ✅ `p_rejection_reason.length >= 20` caractères

#### Étape 2 : Vérification Permissions
```sql
SELECT role FROM users 
WHERE id = auth.uid();
```
- ✅ `role IN ('admin', 'recruteur')`

#### Étape 3 : Récupération Infos Demande
```sql
SELECT user_id, email, first_name, last_name 
FROM access_requests 
WHERE id = '[request_id]';
```
**Résultat** :
- `user_id = 'uuid-candidat'`
- `email = 'jean.perso@gmail.com'`
- `first_name = 'Jean'`
- `last_name = 'Dupont'`

#### Étape 4 : UPDATE dans `users`
```sql
UPDATE users 
SET 
  statut = 'bloqué',          -- CHANGEMENT: en_attente → bloqué
  updated_at = NOW()
WHERE id = '[user_id]';
```
**Résultat** :
- ✅ `users.statut` passe de `'en_attente'` à `'bloqué'`

#### Étape 5 : UPDATE dans `access_requests`
```sql
UPDATE access_requests 
SET 
  status = 'rejected',                -- CHANGEMENT: pending → rejected
  rejection_reason = '[motif_saisi]', -- Enregistrement du motif
  reviewed_at = NOW(),                -- Date/heure de traitement
  reviewed_by = auth.uid()            -- UUID du recruteur
WHERE id = '[request_id]';
```
**Résultat** :
- ✅ `access_requests.status` passe de `'pending'` à `'rejected'`
- ✅ `rejection_reason` enregistre le motif
- ✅ `reviewed_at` enregistre la date
- ✅ `reviewed_by` enregistre qui a refusé

#### Étape 6 : Envoi Email
- ✅ **Email 5 : Refus avec Motif** envoyé à `jean.perso@gmail.com`

#### État Final
- ❌ Le candidat NE PEUT PAS se connecter (statut = 'bloqué')
- ✅ Demande marquée comme "Rejetée" dans le dashboard
- ✅ Motif visible dans l'historique
- ✅ Badge "Demandes d'accès" décrémenté de 1

---

### 📋 SCÉNARIO 8 : Visite Page "Demandes d'Accès" par Recruteur

**Action Recruteur** : Accède à `/recruiter/access-requests`

**Actions sur les Tables** :

#### Étape 1 : Récupération Liste Demandes
```sql
SELECT 
  ar.*,
  u.date_of_birth,
  u.sexe,
  u.adresse,
  u.statut
FROM access_requests ar
INNER JOIN users u ON ar.user_id = u.id
ORDER BY ar.created_at DESC;
```

#### Étape 2 : Marquer Toutes comme Vues
```sql
UPDATE access_requests 
SET viewed = TRUE 
WHERE status = 'pending' 
  AND viewed = FALSE;
```
**Résultat** :
- ✅ Toutes les demandes `pending` passent à `viewed = true`

#### Étape 3 : Mise à Jour Badge (Temps Réel)
```sql
SELECT COUNT(*) 
FROM access_requests 
WHERE status = 'pending' 
  AND viewed = FALSE;
```
**Résultat** :
- ✅ Count = 0 (après le marquage)
- ✅ Badge disparaît dans la sidebar

#### État Final
- ✅ Liste des demandes affichée
- ✅ Badge "Demandes d'accès" passe à (0)
- ✅ Nouvelles demandes futures réafficheront le badge

---

## 📊 Tableau Récapitulatif des Actions sur Tables

| Scénario | Table `auth.users` | Table `users` | Table `access_requests` | Emails |
|----------|-------------------|---------------|-------------------------|--------|
| **1. Externe** | INSERT | INSERT (statut='actif') | - | Email 1 |
| **2. Interne + Email SEEG** | INSERT | INSERT (statut='actif') | - | Email 1 |
| **3. Interne - Email SEEG** | INSERT | INSERT (statut='en_attente') | INSERT (status='pending') | Email 2 + 3 |
| **4. Connexion Actif** | SELECT | SELECT (statut='actif') | - | - |
| **5. Connexion En Attente** | SELECT | SELECT (statut='en_attente') | - | - |
| **6. Approbation** | - | UPDATE (statut='actif') | UPDATE (status='approved') | Email 4 |
| **7. Refus** | - | UPDATE (statut='bloqué') | UPDATE (status='rejected') | Email 5 |
| **8. Visite Page** | - | - | UPDATE (viewed=TRUE) | - |

---

## 🔄 Matrice des Transitions de Statut

### Table `users.statut`

| Statut Initial | Action | Statut Final | Déclenché Par |
|---------------|--------|--------------|---------------|
| - | Inscription externe | `'actif'` | Trigger `handle_new_user` |
| - | Inscription interne + Email SEEG | `'actif'` | Trigger `handle_new_user` |
| - | Inscription interne - Email SEEG | `'en_attente'` | Trigger `handle_new_user` |
| `'en_attente'` | Approbation recruteur | `'actif'` | Fonction `approve_access_request` |
| `'en_attente'` | Refus recruteur | `'bloqué'` | Fonction `reject_access_request` |
| `'actif'` | Admin désactive compte | `'inactif'` | Action manuelle admin |
| `'inactif'` | Admin réactive compte | `'actif'` | Action manuelle admin |
| `'actif'` | Archivage ancien compte | `'archivé'` | Action manuelle admin |

### Table `access_requests.status`

| Statut Initial | Action | Statut Final | Déclenché Par |
|---------------|--------|--------------|---------------|
| - | Création demande | `'pending'` | Trigger `log_access_request` |
| `'pending'` | Approbation recruteur | `'approved'` | Fonction `approve_access_request` |
| `'pending'` | Refus recruteur | `'rejected'` | Fonction `reject_access_request` |

### Table `access_requests.viewed`

| État Initial | Action | État Final | Déclenché Par |
|-------------|--------|------------|---------------|
| - | Création demande | `FALSE` | Trigger `reset_viewed_on_new_request` |
| `FALSE` | Visite page demandes | `TRUE` | Fonction `mark_all_as_viewed` |
| `TRUE` | Nouvelle demande créée | `FALSE` | Trigger `reset_viewed_on_new_request` |

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

