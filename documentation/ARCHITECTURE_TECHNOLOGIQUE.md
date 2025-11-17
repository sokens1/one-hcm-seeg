# ARCHITECTURE TECHNOLOGIQUE DU PROJET TALENT FLOW GABON

## Vue d'Ensemble

Le projet **Talent Flow Gabon** est une plateforme de gestion du capital humain (HCM) développée pour la SEEG (Société d'Énergie et d'Eau du Gabon). L'architecture est construite selon une approche **full-stack moderne** avec séparation claire entre le frontend et le backend.

---

## 🏗️ ARCHITECTURE GLOBALE

### Type d'Architecture
- **Frontend** : Application web SPA (Single Page Application)
- **Backend** : BaaS (Backend as a Service) avec Supabase
- **Base de données** : PostgreSQL (via Supabase)
- **Authentification** : JWT avec Row Level Security (RLS)
- **Stockage** : Supabase Storage pour les documents
- **Déploiement** : Vercel / Lovable

### Diagramme d'Architecture Simplifié

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 18.3 + TypeScript 5.8 + Vite 5.4             │  │
│  │  • shadcn/ui (composants UI)                         │  │
│  │  • Tailwind CSS 3.4 (styling)                       │  │
│  │  • React Router 7.8 (routing)                       │  │
│  │  • TanStack Query 5.8 (état serveur)                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API + WebSocket
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (BaaS)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase                                             │  │
│  │  • PostgreSQL 13.0.4                                 │  │
│  │  • Authentication (JWT)                              │  │
│  │  • Row Level Security (RLS)                          │  │
│  │  • Storage (documents)                               │  │
│  │  • Real-time subscriptions                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 STACK TECHNOLOGIQUE FRONTEND

### 1. Framework et Bibliothèque Principale

#### **React 18.3.1**
- Framework JavaScript pour construire l'interface utilisateur
- Architecture basée sur les composants réutilisables
- Gestion d'état réactive avec hooks
- Optimisations : lazy loading, code splitting, Suspense

**Utilisation principale :**
- Composants fonctionnels avec hooks
- `useState`, `useEffect`, `useCallback`, `useMemo` pour l'état local
- Context API pour l'état global (AuthContext, CampaignContext)

#### **TypeScript 5.8.3**
- Superset typé de JavaScript
- Développement assisté et réduction des erreurs
- Interfaces et types pour la structure de données

**Typage typique :**
```typescript
interface Application {
  id: string;
  candidate_id: string;
  job_offer_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  candidature_status: 'interne' | 'externe';
}
```

### 2. Outils de Build et Développement

#### **Vite 5.4.19**
- Outil de build ultra-rapide
- Hot Module Replacement (HMR)
- Optimisation automatique de la production
- Support natif des modules ES6

**Configuration :**
- Mode développement : serveur local rapide
- Mode production : bundle optimisé, minification
- Support TypeScript natif
- Plugin React SWC pour compilation rapide

#### **ESLint 9.32.0**
- Linting du code JavaScript/TypeScript
- Détection des erreurs et bonnes pratiques
- Plugins React, TypeScript, et règles personnalisées

### 3. Interface Utilisateur (UI/UX)

#### **shadcn/ui**
- Bibliothèque de composants UI modernes
- Basée sur Radix UI et Tailwind CSS
- Composants accessibles et personnalisables

**Composants utilisés :**
- `Button`, `Card`, `Dialog`, `Table`, `Select`, `Input`
- `Badge`, `Alert`, `Toast`, `Tabs`, `Accordion`
- `Dropdown`, `Popover`, `Tooltip`

#### **Tailwind CSS 3.4.17**
- Framework CSS utility-first
- Personnalisation via `tailwind.config.js`
- Optimisation automatique des classes inutilisées
- Responsive design avec breakpoints

**Extensibilité :**
- Plugin `@tailwindcss/typography` pour contenu riche
- Animations avec `tailwindcss-animate`
- Thème personnalisé pour l'identité SEEG

#### **Lucide React 0.462.0**
- Bibliothèque d'icônes SVG modernes
- Icônes cohérentes et vectorielles
- Taille et couleur personnalisables

### 4. Routage et Navigation

#### **React Router DOM 7.8.1**
- Routage côté client
- Navigation sans rechargement de page
- Routes protégées (ProtectedRoute)
- Lazy loading des pages

**Routes principales :**
- `/` : Page d'accueil
- `/candidate/*` : Espace candidat
- `/recruiter/*` : Espace recruteur
- `/observer/*` : Espace observateur
- `/admin/*` : Espace administrateur

### 5. Gestion d'État et Requêtes

#### **TanStack Query (React Query) 5.83.0**
- Synchronisation serveur-état
- Cache automatique
- Mise à jour optimiste
- Retry et gestion d'erreurs

**Hooks personnalisés :**
```typescript
useJobOffers()      // Gestion des offres
useApplications()   // Gestion des candidatures
useAuth()          // Authentification
useSEEGAIData()    // Données évaluation IA
```

#### **Context API (React Native)**
- État global léger
- Contextes créés :
  - `AuthProvider` : Authentification utilisateur
  - `CampaignProvider` : Gestion des campagnes
  - `ToastContext` : Notifications

### 6. Formulaires et Validation

#### **React Hook Form 7.61.1**
- Gestion performante des formulaires
- Validation native ou Zod
- Minima de re-renders
- Débounce intégré

#### **Zod 3.25.76**
- Validation de schémas TypeScript-first
- Validation runtime des données
- Types inférés automatiquement

**Exemple de validation :**
```typescript
const applicationSchema = z.object({
  cover_letter: z.string().min(50),
  motivation: z.string().min(100),
  matricule: z.string().regex(/^\d+$/)
});
```

### 7. Manipulation de Documents

#### **jsPDF 3.0.1 + jspdf-autotable 5.0.2**
- Génération de PDF côté client
- Rapports d'évaluation
- Fiches de synthèse candidat
- Export de tableaux

#### **xlsx 0.18.5**
- Lecture/écriture de fichiers Excel
- Export de données candidatures
- Import de listes d'offres

#### **jszip 3.10.1**
- Compression de fichiers
- Création de dossiers archivés
- Export de candidatures complètes

### 8. Date et Temps

#### **date-fns 3.6.0**
- Manipulation de dates
- Formatage localisé
- Calcul de durées
- Gestion des fuseaux horaires

### 9. Notifications et Alertes

#### **Sonner 1.7.4**
- Système de toasts moderne
- Notifications non-intrusives
- Animations fluides
- Positionnement configurable

### 10. Graphiques et Visualisation

#### **Recharts 2.15.4**
- Bibliothèque de graphiques React
- Dashboards statistiques
- Graphiques pour analyses recruiter
- Responsive

### 11. Autres Bibliothèques Utiles

- **clsx** 2.1.1 : Gestion conditionnelle de classes CSS
- **tailwind-merge** 2.6.0 : Fusion intelligente de classes Tailwind
- **cmdk** 1.1.1 : Commandes à la palette (command menu)
- **class-variance-authority** 0.7.1 : Variants de composants
- **react-error-boundary** 6.0.0 : Gestion des erreurs React
- **react-helmet-async** 2.0.5 : Gestion du head HTML

---

## ⚙️ STACK TECHNOLOGIQUE BACKEND

### 1. Plateforme Backend as a Service

#### **Supabase**
- Alternative open-source à Firebase
- PostgreSQL géré
- Authentification intégrée
- Storage pour fichiers
- Real-time

**Services utilisés :**

#### **PostgreSQL 13.0.4**
- Base relationnelle
- Extensions JSON
- Contraintes, triggers
- Fonctions stockées PL/pgSQL

**Structure principale :**
- `users` : Utilisateurs (candidats, recruteurs, admins)
- `job_offers` : Offres d'emploi
- `applications` : Candidatures
- `protocol1_evaluations` : Évaluations documentaires
- `protocol2_evaluations` : Simulations et entretiens
- `application_documents` : Documents joints
- `access_requests` : Demandes d'accès
- `notifications` : Notifications système

#### **Supabase Authentication**
- Authentification JWT
- Gestion des sessions
- OAuth, Magic Links
- Récupération de mot de passe

**Intégration :**
```typescript
const { data: { session } } = await supabase.auth.signIn({
  email, password
});
```

#### **Row Level Security (RLS)**
- Sécurité au niveau des lignes
- Politiques sur les tables
- Accès par rôle

**Exemple de politique RLS :**
```sql
CREATE POLICY "Candidates can view own applications"
ON applications FOR SELECT
USING (candidate_id = auth.uid());
```

#### **Supabase Storage**
- Stockage objets
- Organisé par buckets
- URLs signées
- Gestion des permissions

**Buckets utilisés :**
- `documents` : CVs, lettres de motivation
- `profiles` : Photos de profil

#### **Realtime Subscriptions**
- WebSockets
- Subscriptions à des tables
- Notifications en temps réel

**Utilisation :**
```typescript
supabase
  .channel('access_requests')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'access_requests'
  }, payload => {
    // Mise à jour UI en temps réel
  })
  .subscribe();
```

### 2. Fonctions et Procédures Stockées

**Fonctions RPC personnalisées :**
```sql
-- Vérification de matricule
verify_matricule(p_matricule TEXT) RETURNS BOOLEAN

-- Approbation de demande d'accès
sp_approve_request(request_id UUID, user_id UUID)

-- Rejet de demande
sp_reject_request(request_id UUID, reason TEXT)

-- Marquer comme vue
sp_mark_as_viewed(request_id UUID)
```

**Triggers automatiques :**
```sql
-- Mise à jour de updated_at
update_updated_at_column()

-- Historique de statut
track_application_status_changes()

-- Validation interne/externe
trg_validate_candidature_status()
```

### 3. Migration et Évolutions

**Supabase Migrations :**
- Migrations SQL versionnées
- Ordre chronologique
- Rollback possible
- Synchronisation locale/production

**Structure des migrations :**
```
supabase/migrations/
  ├── 20250101000000_initial_schema.sql
  ├── 20250115000000_add_protocols.sql
  ├── 20250201000000_add_campaigns.sql
  └── ...
```

---

## 📊 BASE DE DONNÉES

### Modèle de Données

**Relations principales :**

```
users (1) ──< (N) applications ──> (1) job_offers
  ↓                               ↓
  └──> (1) candidate_profiles    └──> (1) recruiter

applications (1) ──> (N) application_documents
applications (1) ──> (1) protocol1_evaluations
applications (1) ──> (1) protocol2_evaluations
applications (1) ──> (N) application_history

users (1) ──< (N) access_requests
users (1) ──< (N) notifications
```

**Contraintes d'intégrité :**
- Clés primaires (UUID)
- Clés étrangères avec `ON DELETE CASCADE`
- Contraintes de validation (CHECK)
- Unicité (UNIQUE)
- Index pour performances

**Stratégies d'indexation :**
```sql
CREATE INDEX idx_applications_candidate_id 
  ON applications(candidate_id);

CREATE INDEX idx_applications_status 
  ON applications(status);

CREATE INDEX idx_job_offers_campaign_id 
  ON job_offers(campaign_id);
```

---

## 🔐 SÉCURITÉ

### Authentification
- JWT avec tokens d'accès/refresh
- Expiration configurée
- Validité auto des sessions

### Autorisation
- Rôles : candidat, recruteur, observateur, admin
- Politiques RLS
- Vérification métier (matricule, accès interne/externe)

### Protection des Données
- Contrôles d'accès
- Stockage chiffré des fichiers
- Validation côté serveur
- Échappement XSS

### Conformité
- Politique de confidentialité
- Consents RGPD
- Logs d'audit

---

## 🚀 DÉPLOIEMENT

### Environnement de Production

**Plateforme :** Vercel / Lovable
- Déploiement continu via Git
- Build et optimisation
- CDN global, SSL
- Monitoring intégré

**Variables d'environnement :**
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_USER=support@seeg-talentsource.com
```

### Processus de Build

```bash
# Développement
npm run dev          # Lance Vite en mode dev

# Production
npm run build        # Build optimisé
npm run preview      # Prévisualisation locale
```

**Optimisations production :**
- Minification JS/CSS
- Tree shaking
- Code splitting
- Lazy loading des routes
- Compression Gzip/Brotli
- Images optimisées

---

## 📦 GESTION DES DÉPENDANCES

### Node.js et npm

**Version Node.js :** 18+
**Gestionnaire :** npm (package-lock.json)

**Installation :**
```bash
npm install
```

**Scripts disponibles :**
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

### Dépendances Principales (Production)

| Package | Version | Usage |
|---------|---------|-------|
| react | 18.3.1 | Framework UI |
| react-dom | 18.3.1 | Rendu React |
| react-router-dom | 7.8.1 | Routing |
| @supabase/supabase-js | 2.55.0 | Client Supabase |
| @tanstack/react-query | 5.83.0 | Gestion données |
| @radix-ui/* | ^1.x | Composants UI |
| tailwindcss | 3.4.17 | Styling |
| lucide-react | 0.462.0 | Icônes |
| zod | 3.25.76 | Validation |
| jspdf | 3.0.1 | Génération PDF |

---

## 🔄 INTÉGRATIONS EXTERNES

### Azure Container Apps (Évaluations IA)
- Analyse CV et lettres
- Scoring automatique
- Insights métier

### SMTP (Nodemailer)
- Emails de notification
- Confirmations d'inscription
- Rappels d'entretien
- Résultats d'évaluation

---

## 🧪 TESTS ET QUALITÉ

### Tests Manuels
- Tests fonctionnels
- Validation UX
- Tests de régression

### Linting
- ESLint
- Format cohérent
- Détection d'erreurs

### Gestion des Erreurs
- Error Boundaries React
- Try-catch
- Logs d'erreurs
- Messages utilisateur

---

## 📈 PERFORMANCES

### Optimisations Frontend
- Code splitting par route
- Lazy loading de composants
- Mémorisation avec React.memo, useMemo
- Debounce sur recherches
- Pagination pour grandes listes

### Optimisations Backend
- Index sur requêtes fréquentes
- Cache via React Query
- Requêtes limitées
- Optimisation des requêtes SQL

### Métriques
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s
- Lighthouse Score > 90

---

## 📚 DOCUMENTATION ET STANDARDS

### Conventions de Code
- ESLint
- Prettier
- Naming en français métier
- Composants PascalCase
- Fichiers kebab-case

### Structure de Projet
```
src/
├── components/       # Composants réutilisables
├── pages/           # Pages application
├── hooks/           # Custom hooks React
├── contexts/        # Context providers
├── integrations/    # Clients API
├── utils/           # Fonctions utilitaires
├── config/          # Configuration
└── types/           # Types TypeScript
```

### Documentation
- README
- Commentaires dans le code
- TypeScript comme documentation
- Guide utilisateur
- Procédures de déploiement

---

## 🔮 ÉVOLUTION FUTURE

### Améliorations Programmées
1. Optimisations IA
2. Tests E2E avec Cypress/Playwright
3. Progressive Web App (PWA)
4. Version mobile
5. Analytics

### Technologies Explorées
- Next.js
- Server-Side Rendering (SSR)
- GraphQL
- Microservices
- Kubernetes

---

## 📝 CONCLUSION

Architecture moderne et scalable. Stack React + TypeScript + Supabase, performante et maintenable. Sécurité via RLS. Préparée pour l’évolution du projet.

**Points forts :**
- ✅ Stack actuelle
- ✅ Code type-safe
- ✅ Sécurité
- ✅ Expérience développeur
- ✅ Performances
- ✅ Maintenabilité

**Technologies clés résumées :**
- **Frontend** : React 18 + TypeScript + Vite
- **UI** : shadcn/ui + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **État** : TanStack Query + Context API
- **Routage** : React Router DOM
- **Validation** : React Hook Form + Zod
- **Déploiement** : Vercel

---
*Document généré pour le rapport de stage - Talent Flow Gabon 2025*

