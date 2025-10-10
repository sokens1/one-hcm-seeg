# Gestion des Demandes d'Accès

## Vue d'Ensemble

Ce document décrit la fonctionnalité de gestion des demandes d'accès pour les candidats internes sans email professionnel SEEG.

---

## Fonctionnalités Implémentées

### 1. Sidebar Recruteur - Badge Notification
**Fichier**: `src/components/layout/RecruiterSidebar.tsx`

- ✅ Ajout du menu "Demandes d'accès" avec icône `UserCheck`
- ✅ Badge rouge affichant le nombre de demandes en attente
- ✅ Mise à jour en temps réel via Supabase Realtime
- ✅ Badge visible uniquement quand il y a des demandes en attente

```typescript
{item.badge && pendingRequestsCount > 0 && (
  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
    {pendingRequestsCount}
  </span>
)}
```

---

### 2. Page de Gestion des Demandes
**Fichier**: `src/pages/recruiter/AccessRequests.tsx`

#### 2.1 Interface Utilisateur

**Statistiques en Haut**
- Nombre de demandes en attente (jaune)
- Nombre de demandes approuvées (vert)
- Nombre de demandes rejetées (rouge)

**Barre de Recherche**
- Recherche par nom, email ou matricule
- Filtrage en temps réel

**Liste des Demandes**
- Affichage de toutes les informations du candidat
- Badge de statut (En attente, Approuvée, Rejetée)
- Informations complètes : email, téléphone, matricule, date de naissance, sexe, adresse

#### 2.2 Actions Disponibles

**Pour les demandes en attente** :

1. **Approuver** ✅
   - Appelle `approve_access_request(request_id)`
   - Change le statut utilisateur à `'actif'`
   - Envoie un email de validation
   - Affiche un toast de succès

2. **Refuser** ❌
   - Ouvre une modal pour saisir le motif
   - Minimum 20 caractères requis
   - Appelle `reject_access_request(request_id, p_rejection_reason)`
   - Change le statut utilisateur à `'bloqué'`
   - Envoie un email de refus avec le motif
   - Affiche un toast de confirmation

---

### 3. Emails de Notification

#### 3.1 Email de Refus d'Accès
**Fichiers**:
- `api/send-access-rejected-email.ts` (Production - Vercel)
- `vite.config.ts` (Développement - Middleware)

**Contenu de l'Email** :
```
┌──────────────────────────────────────┐
│ Demande d'Accès Refusée              │
├──────────────────────────────────────┤
│ Monsieur/Madame [Prénom] [Nom],     │
│                                      │
│ Votre demande d'accès n'a pas été   │
│ validée.                             │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Motif du refus                 │  │
│ │ [Raison saisie par le          │  │
│ │  recruteur]                    │  │
│ └────────────────────────────────┘  │
│                                      │
│ Contact Support :                    │
│ support@seeg-talentsource.com       │
│                                      │
│ Cordialement,                        │
│ L'équipe OneHCM - SEEG Talent Source│
│                                      │
│ [Logo OneHCM]                        │
└──────────────────────────────────────┘
```

**Template HTML** :
- Utilise des tables pour compatibilité email
- Détecte le sexe pour "Monsieur"/"Madame"
- Affiche le motif dans un encadré rouge
- Fournit les coordonnées du support

---

### 4. Base de Données

#### 4.1 Table `access_requests`
**Fichier**: `supabase/migrations/20250110000001_update_internal_candidate_status.sql`

```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  matricule TEXT,
  request_type TEXT DEFAULT 'internal_no_seeg_email',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,  -- ✅ Nouveau champ
  created_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);
```

#### 4.2 Fonction `reject_access_request`
**Fichier**: `supabase/migrations/20250110000002_add_rejection_reason.sql`

```sql
CREATE FUNCTION reject_access_request(
  request_id UUID,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
```

**Comportement** :
1. Vérifie que l'utilisateur est admin/recruteur
2. Met à jour le statut de l'utilisateur à `'bloqué'`
3. Met à jour la demande : `status = 'rejected'`, `rejection_reason = p_rejection_reason`
4. Enregistre `reviewed_at` et `reviewed_by`

---

### 5. Routing

**Fichier**: `src/App.tsx`

```typescript
const AccessRequests = lazy(() => import("./pages/recruiter/AccessRequests"));

// Route protégée pour les recruteurs/observateurs
<Route 
  path="recruiter/access-requests" 
  element={
    <ProtectedRecruiterReadRoute>
      <AccessRequests />
    </ProtectedRecruiterReadRoute>
  } 
/>
```

---

## Flux Complet

### Scénario 1 : Approbation d'une Demande

```
1. Candidat interne sans email SEEG s'inscrit
   ↓
2. Statut = 'en_attente', demande créée dans access_requests
   ↓
3. Badge rouge s'affiche dans la sidebar recruteur
   ↓
4. Recruteur clique sur "Demandes d'accès"
   ↓
5. Recruteur clique sur "Approuver"
   ↓
6. RPC approve_access_request() :
   - Statut utilisateur → 'actif'
   - Demande → 'approved'
   ↓
7. Email de validation envoyé au candidat
   ↓
8. Toast de succès affiché
   ↓
9. Candidat peut désormais se connecter
```

### Scénario 2 : Refus d'une Demande

```
1. Candidat interne sans email SEEG s'inscrit
   ↓
2. Statut = 'en_attente', demande créée
   ↓
3. Recruteur clique sur "Refuser"
   ↓
4. Modal s'ouvre pour saisir le motif
   ↓
5. Recruteur saisit minimum 20 caractères
   ↓
6. Clique sur "Confirmer le Refus"
   ↓
7. RPC reject_access_request(request_id, reason) :
   - Statut utilisateur → 'bloqué'
   - Demande → 'rejected'
   - rejection_reason enregistré
   ↓
8. Email de refus avec motif envoyé au candidat
   ↓
9. Toast de confirmation affiché
   ↓
10. Candidat ne peut pas se connecter
```

---

## Migrations

### Migration 1 : Table et Fonctions de Base
**Fichier**: `supabase/migrations/20250110000001_update_internal_candidate_status.sql`

```bash
# Appliquer la migration
supabase migration up
```

### Migration 2 : Ajout du Champ rejection_reason
**Fichier**: `supabase/migrations/20250110000002_add_rejection_reason.sql`

Cette migration est **idempotente** :
- Vérifie si le champ existe avant de l'ajouter
- Peut être exécutée plusieurs fois sans erreur

```bash
# Appliquer la migration
supabase migration up
```

---

## API Routes

### Production (Vercel)
- `api/send-access-rejected-email.ts`

### Développement (Vite Middleware)
- Handler dans `vite.config.ts` (ligne ~727)

**Variables d'Environnement Requises** :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@seeg-talentsource.com
SMTP_PASSWORD=njev urja zsbc spfn
```

---

## Tests Recommandés

### Test 1 : Badge de Notification
1. Créer une demande d'accès (inscription interne sans email SEEG)
2. Se connecter en tant que recruteur
3. Vérifier que le badge rouge s'affiche avec "1"

### Test 2 : Recherche
1. Créer plusieurs demandes
2. Rechercher par nom, email, matricule
3. Vérifier le filtrage en temps réel

### Test 3 : Approbation
1. Cliquer sur "Approuver"
2. Vérifier l'email reçu par le candidat
3. Vérifier que le statut passe à "actif"
4. Le candidat doit pouvoir se connecter

### Test 4 : Refus
1. Cliquer sur "Refuser"
2. Saisir moins de 20 caractères → Bouton désactivé
3. Saisir 20+ caractères → Bouton activé
4. Confirmer le refus
5. Vérifier l'email avec le motif
6. Vérifier que le statut passe à "bloqué"
7. Le candidat ne doit PAS pouvoir se connecter

### Test 5 : Temps Réel
1. Ouvrir la page en 2 onglets différents
2. Approuver/Rejeter dans un onglet
3. Vérifier la mise à jour automatique dans l'autre

---

## Fichiers Modifiés/Créés

### Nouveaux Fichiers
- ✅ `src/pages/recruiter/AccessRequests.tsx`
- ✅ `api/send-access-rejected-email.ts`
- ✅ `supabase/migrations/20250110000002_add_rejection_reason.sql`
- ✅ `GESTION_DEMANDES_ACCES.md`

### Fichiers Modifiés
- ✅ `src/components/layout/RecruiterSidebar.tsx`
- ✅ `src/App.tsx`
- ✅ `vite.config.ts`
- ✅ `supabase/migrations/20250110000001_update_internal_candidate_status.sql`
- ✅ `src/pages/Auth.tsx` (Fix toast connexion réussie)

---

## Permissions

**Qui peut gérer les demandes ?**
- ✅ Administrateurs (role = 'admin')
- ✅ Recruteurs (role = 'recruteur')
- ✅ Observateurs (lecture seule via ProtectedRecruiterReadRoute)

**RLS Policies** :
- Les fonctions `approve_access_request` et `reject_access_request` vérifient le rôle
- Seuls admin et recruteur peuvent approuver/rejeter

---

## Notes Importantes

1. **Toast "Connexion réussie" Corrigé** ✅
   - Le toast de succès s'affiche maintenant APRÈS la vérification du statut
   - Évite le double toast (succès + erreur)

2. **Motif de Refus Obligatoire** ✅
   - Minimum 20 caractères
   - Compteur affiché en temps réel
   - Bouton désactivé tant que non valide

3. **Emails Transactionnels** ✅
   - Production : Vercel Serverless Functions
   - Développement : Vite Middlewares
   - Fallback SMTP → Resend

4. **Sécurité** ✅
   - Routes protégées par rôle
   - Vérification côté serveur (RPC)
   - SECURITY DEFINER sur les fonctions PostgreSQL

---

## Prochaines Étapes Possibles

1. **Tableau de Bord Admin**
   - Vue d'ensemble des demandes
   - Statistiques par période

2. **Notifications Push**
   - Alertes en temps réel pour les nouveaux demandes
   - Intégration avec Firebase/OneSignal

3. **Historique**
   - Voir toutes les actions passées
   - Qui a approuvé/rejeté et quand

4. **Commentaires Internes**
   - Ajouter des notes internes sur les demandes
   - Collaboration entre recruteurs

5. **Export**
   - Exporter les demandes en CSV/Excel
   - Rapports mensuels

