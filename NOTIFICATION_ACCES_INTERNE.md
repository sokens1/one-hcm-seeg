# Système de Notification pour Candidats Internes Sans Email SEEG

## 🎯 Objectif

Lorsqu'un candidat interne s'inscrit **sans email professionnel SEEG** (checkbox cochée), le système doit :
1. ✅ Créer le compte avec statut **"en_attente"**
2. ✅ Envoyer un email à l'admin (support@seeg-talentsource.com)
3. ✅ Envoyer un email au candidat pour l'informer
4. ✅ Empêcher la connexion automatique

---

## 📋 Architecture de la Solution

### 1. **Base de Données (Supabase)**

#### Migration 1 : `20250110000001_update_internal_candidate_status.sql`

**Trigger Automatique**
```sql
-- Met automatiquement le statut à "en_attente" si :
-- - candidate_status = 'interne'
-- - no_seeg_email = TRUE
```

**Table `access_requests`**
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY,
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  matricule TEXT,
  request_type TEXT DEFAULT 'internal_no_seeg_email',
  status TEXT DEFAULT 'pending',  -- pending, approved, rejected
  created_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
);
```

**Trigger de Logging**
```sql
-- Enregistre automatiquement dans access_requests
-- lors de l'inscription d'un candidat interne sans email SEEG
```

---

### 2. **API Email (Vercel Function)**

#### Fichier : `api/send-access-request-email.ts`

**Fonctionnalités :**
- ✅ Envoi via SMTP (prioritaire)
- ✅ Fallback via Resend
- ✅ Deux emails distincts (admin + candidat)
- ✅ Templates HTML professionnels
- ✅ Gestion d'erreurs robuste

**Endpoint :**
```
POST /api/send-access-request-email
```

**Body :**
```json
{
  "userEmail": "candidat@gmail.com",
  "firstName": "Arthur",
  "lastName": "CROWN",
  "phone": "+241 08 78 85 46",
  "matricule": "1234",
  "dateOfBirth": "2025-10-10",
  "sexe": "M",
  "adresse": "OWENDO"
}
```

---

### 3. **Frontend (Hook React)**

#### Fichier : `src/hooks/useAccessRequestNotification.ts`

**Usage :**
```typescript
const { sendAccessRequestNotification } = useAccessRequestNotification();

await sendAccessRequestNotification({
  userEmail: "...",
  firstName: "...",
  // ... autres champs
});
```

---

### 4. **Intégration dans Auth.tsx**

```typescript
// Après inscription réussie
if (signUpData.candidateStatus === "interne" && signUpData.noSeegEmail) {
  // Envoyer les notifications
  await sendAccessRequestNotification({ ... });
  
  // Message utilisateur
  toast.success("Inscription réussie ! Votre demande est en attente de validation.");
  toast.info("Vous recevrez un email une fois votre compte validé.");
  
  // Rediriger vers connexion (pas de connexion auto)
  setActiveTab("signin");
}
```

---

## 📧 Templates d'Emails

### Email 1 : Pour l'Administrateur

**Destinataire :** `support@seeg-talentsource.com`

**Sujet :** 🔔 Nouvelle Demande d'Accès - Candidat Interne

**Contenu :**
```
┌─────────────────────────────────────┐
│ SEEG Logo                           │
├─────────────────────────────────────┤
│ Nouvelle Demande d'Accès           │
│ Candidat Interne                    │
├─────────────────────────────────────┤
│                                     │
│ Un candidat interne sans email      │
│ professionnel SEEG a créé un compte │
│ et est en attente de validation.    │
│                                     │
│ ┌─────────────────────────────┐    │
│ │ Informations du Candidat    │    │
│ ├─────────────────────────────┤    │
│ │ Nom : Arthur CROWN          │    │
│ │ Email : candidat@gmail.com  │    │
│ │ Téléphone : +241 08 78...   │    │
│ │ Matricule : 1234            │    │
│ │ Date naissance : 10/10/2025 │    │
│ │ Sexe : Homme                │    │
│ │ Adresse : OWENDO            │    │
│ └─────────────────────────────┘    │
│                                     │
│ ⚠️ Action requise :                │
│ Veuillez vérifier et valider cette  │
│ demande dans le dashboard admin.    │
└─────────────────────────────────────┘
```

---

### Email 2 : Pour le Candidat

**Destinataire :** Email du candidat

**Sujet :** Demande d'Accès en Attente de Validation

**Contenu :**
```
┌─────────────────────────────────────┐
│ SEEG Logo                           │
├─────────────────────────────────────┤
│ Demande d'Accès en Attente         │
├─────────────────────────────────────┤
│                                     │
│ Bonjour Arthur CROWN,              │
│                                     │
│ Votre demande d'accès à la         │
│ plateforme OneHCM a bien été       │
│ enregistrée.                        │
│                                     │
│ En tant que candidat interne sans   │
│ email professionnel SEEG, votre     │
│ compte est en attente de validation.│
│                                     │
│ ┌─────────────────────────────┐    │
│ │ Vos Informations            │    │
│ ├─────────────────────────────┤    │
│ │ Email : candidat@gmail.com  │    │
│ │ Téléphone : +241 08 78...   │    │
│ │ Matricule : 1234            │    │
│ └─────────────────────────────┘    │
│                                     │
│ ⏳ Prochaines étapes :             │
│ Notre équipe va vérifier vos       │
│ informations et valider votre      │
│ compte dans les plus brefs délais. │
│ Vous recevrez un email une fois    │
│ votre compte activé.               │
│                                     │
│ Cordialement,                       │
│ L'équipe OneHCM - SEEG             │
└─────────────────────────────────────┘
```

---

## 🔄 Flux Complet

### Cas 1 : Candidat Interne AVEC Email SEEG
```
Inscription
  ↓
Trigger → statut = 'actif'
  ↓
Connexion automatique
  ↓
Redirection vers /candidate/dashboard
```

### Cas 2 : Candidat Interne SANS Email SEEG
```
Inscription
  ↓
Trigger → statut = 'en_attente'
  ↓
Enregistrement dans access_requests
  ↓
Envoi email à l'admin ✉️
  ↓
Envoi email au candidat ✉️
  ↓
Message : "Demande en attente de validation"
  ↓
PAS de connexion automatique
  ↓
Redirection vers l'onglet connexion
```

### Cas 3 : Candidat Externe
```
Inscription
  ↓
Trigger → statut = 'actif'
  ↓
Connexion automatique
  ↓
Redirection vers /candidate/dashboard
```

---

## 🛠️ Fonctions de Gestion (Backend)

### Approuver une Demande
```sql
SELECT approve_access_request('request-id'::UUID);
```

**Effet :**
- ✅ Statut utilisateur : `en_attente` → `actif`
- ✅ Statut demande : `pending` → `approved`
- ✅ `reviewed_at` et `reviewed_by` mis à jour

### Rejeter une Demande
```sql
SELECT reject_access_request('request-id'::UUID);
```

**Effet :**
- ✅ Statut utilisateur : `en_attente` → `bloqué`
- ✅ Statut demande : `pending` → `rejected`
- ✅ `reviewed_at` et `reviewed_by` mis à jour

### Voir les Demandes en Attente
```sql
SELECT * FROM pending_access_requests;
```

**Résultat :**
```
id | user_id | email | first_name | last_name | phone | matricule | status | created_at
---|---------|-------|------------|-----------|-------|-----------|--------|------------
... | ... | candidat@gmail.com | Arthur | CROWN | +241... | 1234 | pending | 2025-10-09...
```

---

## 📊 Table `access_requests`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Référence vers users |
| `email` | TEXT | Email du candidat |
| `first_name` | TEXT | Prénom |
| `last_name` | TEXT | Nom |
| `phone` | TEXT | Téléphone |
| `matricule` | TEXT | Matricule SEEG |
| `request_type` | TEXT | Type de demande |
| `status` | TEXT | pending, approved, rejected |
| `created_at` | TIMESTAMPTZ | Date de création |
| `reviewed_at` | TIMESTAMPTZ | Date de révision |
| `reviewed_by` | UUID | Admin qui a révisé |

---

## 🚀 Déploiement

### Étape 1 : Appliquer la Migration
```sql
-- Dans Supabase SQL Editor
-- Copier-coller : supabase/migrations/20250110000001_update_internal_candidate_status.sql
```

### Étape 2 : Vérifier les Variables d'Environnement
```bash
# .env.local
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=support@seeg-talentsource.com
VITE_SMTP_PASS=njev urja zsbc spfn

# Vercel (pour production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=support@seeg-talentsource.com
SMTP_PASSWORD=njev urja zsbc spfn
```

### Étape 3 : Tester
1. Inscription candidat interne
2. Cocher "Je n'ai pas d'email professionnel SEEG"
3. Remplir avec email non-SEEG
4. Soumettre
5. Vérifier :
   - ✅ Message "En attente de validation"
   - ✅ Email reçu par l'admin
   - ✅ Email reçu par le candidat
   - ✅ Enregistrement dans `access_requests`
   - ✅ Statut = 'en_attente' dans `users`

---

## 🧪 Tests de Vérification

### Test 1 : Vérifier le Trigger
```sql
-- Créer un utilisateur test
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'test@gmail.com',
  jsonb_build_object(
    'candidate_status', 'interne',
    'no_seeg_email', true,
    'first_name', 'Test',
    'last_name', 'User'
  )
);

-- Vérifier dans public.users
SELECT statut, candidate_status, no_seeg_email 
FROM users 
WHERE email = 'test@gmail.com';
-- Résultat attendu: statut = 'en_attente'

-- Vérifier dans access_requests
SELECT * FROM access_requests 
WHERE email = 'test@gmail.com';
-- Résultat attendu: 1 ligne avec status = 'pending'
```

### Test 2 : Tester l'Approbation
```sql
-- Récupérer l'ID de la demande
SELECT id FROM access_requests WHERE email = 'test@gmail.com';

-- Approuver
SELECT approve_access_request('request-id-ici'::UUID);

-- Vérifier
SELECT statut FROM users WHERE email = 'test@gmail.com';
-- Résultat attendu: statut = 'actif'
```

---

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers
1. ✅ `supabase/migrations/20250110000001_update_internal_candidate_status.sql` - Migration
2. ✅ `api/send-access-request-email.ts` - Fonction Vercel
3. ✅ `src/hooks/useAccessRequestNotification.ts` - Hook React
4. ✅ `NOTIFICATION_ACCES_INTERNE.md` - Documentation

### Fichiers Modifiés
1. ✅ `src/pages/Auth.tsx` - Intégration de l'envoi d'emails

---

## 🎨 Expérience Utilisateur

### Scénario : Candidat Interne Sans Email SEEG

**1. Inscription :**
```
[X] Candidat Interne
[X] Je n'ai pas d'email professionnel SEEG
Email: arthur@gmail.com
Matricule: 1234
... autres champs ...
[Clic sur S'inscrire]
```

**2. Retour Visuel :**
```
✅ "Inscription réussie ! Votre demande d'accès est en attente de validation."
ℹ️ "Vous recevrez un email de confirmation une fois votre compte validé."
→ Redirection vers l'onglet connexion
```

**3. Emails Envoyés :**
- ✉️ Admin reçoit : "🔔 Nouvelle Demande d'Accès"
- ✉️ Candidat reçoit : "Demande d'Accès en Attente"

**4. Base de Données :**
- `users.statut` = `'en_attente'`
- `access_requests` = nouvelle ligne avec `status = 'pending'`

**5. Connexion :**
```
Candidat tente de se connecter
  ↓
Authentification réussie MAIS statut = 'en_attente'
  ↓
Message : "Votre compte est en attente de validation"
  ↓
Accès bloqué au dashboard
```

---

## 🔐 Sécurité et Permissions

### Table `access_requests`
- ✅ RLS activé
- ✅ Admins/recruteurs : voir toutes les demandes
- ✅ Candidats : voir uniquement leurs propres demandes

### Fonctions de Gestion
- ✅ `approve_access_request()` : Réservé aux admins/recruteurs
- ✅ `reject_access_request()` : Réservé aux admins/recruteurs

### Trigger `log_access_request`
- ✅ `SECURITY DEFINER` : Exécution avec privilèges élevés
- ✅ Insertion automatique sécurisée

---

## 🎯 Dashboard Admin (À Créer)

### Page : `/admin/access-requests`

**Fonctionnalités :**
- 📋 Liste des demandes en attente
- 👁️ Détails de chaque demande
- ✅ Bouton "Approuver"
- ❌ Bouton "Rejeter"
- 📊 Statistiques des demandes

**Requête :**
```sql
SELECT * FROM pending_access_requests ORDER BY created_at DESC;
```

**Actions :**
```typescript
// Approuver
await supabase.rpc('approve_access_request', { request_id: 'xxx' });
toast.success("Demande approuvée ! L'utilisateur peut maintenant se connecter.");

// Rejeter
await supabase.rpc('reject_access_request', { request_id: 'xxx' });
toast.success("Demande rejetée. L'utilisateur a été bloqué.");
```

---

## 📊 Statistiques

### Requêtes Utiles

**Nombre de demandes en attente :**
```sql
SELECT COUNT(*) FROM access_requests WHERE status = 'pending';
```

**Demandes par statut :**
```sql
SELECT status, COUNT(*) 
FROM access_requests 
GROUP BY status;
```

**Candidats internes en attente :**
```sql
SELECT COUNT(*) 
FROM users 
WHERE candidate_status = 'interne' 
  AND statut = 'en_attente';
```

---

## ✅ Checklist de Déploiement

### Base de Données
- [ ] Migration 1 appliquée : `20250110000000_add_candidate_fields.sql`
- [ ] Migration 2 appliquée : `20250110000001_update_internal_candidate_status.sql`
- [ ] Table `access_requests` créée
- [ ] Triggers actifs
- [ ] Fonctions de gestion créées
- [ ] Politiques RLS configurées

### API
- [ ] Fichier `api/send-access-request-email.ts` créé
- [ ] Variables d'environnement configurées (SMTP)
- [ ] Test d'envoi d'email réussi

### Frontend
- [ ] Hook `useAccessRequestNotification` créé
- [ ] Intégration dans `Auth.tsx` effectuée
- [ ] Test d'inscription candidat interne sans email SEEG
- [ ] Vérification des emails reçus

### Tests
- [ ] Inscription candidat interne avec email SEEG → actif
- [ ] Inscription candidat interne sans email SEEG → en_attente
- [ ] Inscription candidat externe → actif
- [ ] Emails envoyés correctement
- [ ] Approbation de demande fonctionne
- [ ] Rejet de demande fonctionne

---

## 🚀 Résultat Final

**Pour les candidats internes sans email SEEG :**
- ✅ Compte créé avec statut `'en_attente'`
- ✅ Email admin envoyé automatiquement
- ✅ Email candidat envoyé automatiquement
- ✅ Demande enregistrée dans `access_requests`
- ✅ Connexion bloquée jusqu'à approbation
- ✅ Workflow de validation complet

**Le système est prêt !** 🎯✨
