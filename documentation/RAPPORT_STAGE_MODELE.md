# EXTRAITS POUR RAPPORT DE STAGE
## Talent Flow Gabon - SEEG HCM

---

## 2.2. LA MODÉLISATION UML (Unified Modeling Language)

Pour concevoir l'architecture de l'application avant le codage, nous avons eu recours au langage de modélisation unifié (UML). La modélisation a permis de visualiser et de documenter la structure et le comportement du système.

### Diagramme de Cas d'Utilisation (Use Case)

Ce diagramme a permis d'identifier les acteurs principaux du système et les fonctionnalités qu'ils peuvent utiliser :

**Acteurs identifiés :**
- **Candidat Interne** : Employé SEEG postulant pour un poste interne
- **Candidat Externe** : Personne externe à l'entreprise
- **Recruteur SEEG** : Membre de l'équipe RH chargé de recruter
- **Admin** : Administrateur système avec accès total

**Cas d'utilisation principaux :**

**Gestion de Candidatures :**
- S'inscrire au système
- Se connecter avec authentification
- Compléter le profil personnel et professionnel
- Consulter le catalogue d'offres d'emploi
- Postuler à une offre
- Télécharger des documents (CV, lettre de motivation, diplômes)
- Suivre l'état de ses candidatures
- Demander un accès au système (pour candidats internes)

**Gestion des Offres :**
- Créer une nouvelle offre d'emploi
- Modifier une offre existante
- Publier une offre pour la rendre visible
- Clore une offre (fin de recrutement)

**Évaluation :**
- Évaluer un dossier de candidature
- Planifier un entretien/simulation
- Analyser un candidat selon les protocoles d'évaluation

**Administration :**
- Gérer les utilisateurs du système
- Valider les demandes d'accès
- Superviser les activités du système

Ce diagramme est essentiel pour délimiter le périmètre du projet et assurer que tous les besoins métier sont couverts.

### Diagramme de Classes

Nous l'avons utilisé pour structurer les données et les relations entre les entités clés. Ce modèle a servi de base directe à la conception du schéma de la base de données dans Supabase.

**Classes principales identifiées :**

**User (Utilisateur)**
- Attributs : id, email, role, nom, prénom, candidate_status, matricule, statut
- Méthodes : vérifierMatricule(), mettreÀJourProfil(), obtenirCandidatures()

**CandidateProfile (Profil Candidat)**
- Stocke les informations détaillées : poste actuel, département, années d'expérience, compétences

**JobOffer (Offre d'Emploi)**
- Attributs : titre, description, lieu, type de contrat, département, campaign_id, status_offers
- Méthodes : créer(), publier(), clore()

**Application (Candidature)**
- Lie un candidat à une offre
- Attributs : candidature_status (interne/externe), has_been_manager, statut de traitement
- Méthodes : soumettre(), mettreÀJour(), validerStatut()

**Protocol1Evaluation (Évaluation Protocole 1)**
- Évaluation documentaire : CV, lettre de motivation, diplômes
- Évaluation MTP (Métier, Talent, Paradigme)
- Calcul de scores documentaire, MTP et entretien

**Protocol2Evaluation (Évaluation Protocole 2)**
- Simulation et mise en situation
- Jeux de rôle et comité de direction
- Planification avec date et heure de simulation

**ApplicationDocument (Document)**
- Pièces jointes : CV, lettre, diplômes, certificats

**ApplicationHistory (Historique)**
- Trace les changements de statut d'une candidature

**AccessRequest (Demande d'Accès)**
- Gère les demandes d'accès des candidats internes
- Attributs : statut, vu/non vu, motif de rejet

**Relations identifiées :**
- Un User peut avoir un CandidateProfile
- Un User peut créer plusieurs Applications
- Une Application appartient à un User (candidat) et une JobOffer
- Une Application peut avoir plusieurs ApplicationDocuments
- Une Application peut avoir une évaluation Protocol1 et Protocol2
- Chaque changement de statut génère une entrée dans ApplicationHistory

### Diagramme d'Architecture Globale (Logique)

Ce diagramme illustre l'architecture technique globale de notre application selon le modèle **Client-BaaS (Backend as a Service)**. Cette approche minimise les coûts d'infrastructure tout en maximisant la réactivité du frontend.

**Composants principaux :**

**Client (Frontend SPA)**
- Framework : **React 18.3** avec **TypeScript 5.8**
- Build tool : **Vite 5.4** pour un développement ultra-rapide et des builds optimisés
- Routing : **React Router** pour la navigation
- Gestion d'état : **TanStack Query** pour la synchronisation serveur-client
- UI : **shadcn/ui** pour des composants accessibles et **Tailwind CSS** pour le styling
- Architecture : Single Page Application (SPA) pour une expérience utilisateur fluide

**Backend as a Service - Supabase**

L'application utilise **Supabase** comme plateforme BaaS, fournissant plusieurs services intégrés :

**Authentication**
- Authentification basée sur **JWT** (JSON Web Tokens)
- Gestion automatique des sessions utilisateur
- Gestion des rôles et permissions (candidat, recruteur, admin, observateur)
- Connexion sécurisée via HTTPS

**REST API**
- API REST automatique générée à partir du schéma PostgreSQL
- Opérations CRUD complètes
- Query builder intégré pour requêtes complexes
- Optimisation des performances automatique

**File Storage**
- Stockage de documents (CVs, lettres de motivation, diplômes)
- URLs signées pour accès sécurisé
- Organisation par buckets et dossiers
- Gestion des métadonnées associées

**Real-time**
- Souscriptions WebSocket pour mises à jour en temps réel
- Notifications automatiques aux utilisateurs
- Synchronisation instantanée des données

**Base de données - PostgreSQL 13.0.4**

**Données structurées** stockées dans PostgreSQL :
- Table `users` : Gestion des utilisateurs et leurs rôles
- Table `job_offers` : Catalogue des offres d'emploi
- Table `applications` : Candidatures des utilisateurs
- Tables `protocol1_evaluations` et `protocol2_evaluations` : Évaluations candidats
- Table `application_documents` : Documents joints aux candidatures
- Tables de support : notifications, demandes d'accès, historique

**Row Level Security (RLS)**
- Sécurité au niveau des lignes de données
- Politiques définies par rôle utilisateur
- Validation automatique des permissions
- Protection des données sensibles

**Flux de données :**

Le Frontend communique avec Supabase via :
- **Connexion JWT sécurisée** pour l'authentification
- **REST API HTTPS** pour les opérations CRUD
- **WebSocket** pour les mises à jour en temps réel
- **Storage API** pour l'upload et le téléchargement de fichiers

Supabase se connecte ensuite à PostgreSQL pour :
- La validation des utilisateurs
- L'exécution des requêtes SQL
- Le stockage des métadonnées des fichiers

**Avantages de l'Architecture Client-BaaS :**

✅ **Pas d'infrastructure à gérer** : Pas besoin de maintenir serveurs, base de données, ou services d'authentification  
✅ **Évolutivité automatique** : Supabase gère la montée en charge selon la charge  
✅ **Coûts optimisés** : Pay-as-you-go, sans coûts fixes d'infrastructure  
✅ **Sécurité intégrée** : HTTPS, RLS, authentification JWT, tout est préconfiguré  
✅ **Réactivité maximale** : Focus sur le frontend et la logique métier  
✅ **Développement rapide** : Mise en production en quelques heures plutôt que semaines  

Cette architecture nous permet de nous concentrer sur la création de valeur métier plutôt que sur la gestion d'infrastructure, accélérant significativement le développement et réduisant les coûts opérationnels.

### Diagramme de Séquence

Ces diagrammes ont modélisé le comportement dynamique du système pour deux processus critiques :

#### Dépôt d'une Candidature

**Acteurs impliqués :** Candidat, Interface Web, API Frontend, Base de données

**Flux principal :**

1. Le candidat accède au catalogue d'offres disponibles
2. L'interface récupère les offres actives via l'API
3. Le candidat consulte les détails d'une offre
4. Lors du clic sur "Postuler", le système vérifie la complétude du profil
5. Si le profil est incomplet, une demande de complément est affichée
6. Sinon, la candidature est créée dans la base de données
7. Un trigger de validation automatique vérifie la cohérence (interne/externe)
8. Si la validation échoue, un message d'erreur est affiché
9. Si la validation réussit, une évaluation Protocole 1 est automatiquement créée
10. Le candidat peut alors uploader ses documents (CV, lettre, diplômes)
11. Une confirmation de dépôt est affichée

**Points critiques :**
- Validation automatique de cohérence interne/externe
- Création automatique de l'évaluation initiale
- Gestion des erreurs et messages utilisateur appropriés

#### Analyse d'un Dossier par un Recruteur

**Acteurs impliqués :** Recruteur, Dashboard, API Frontend, Base de données

**Flux principal :**

1. Le recruteur s'authentifie et accède à son dashboard
2. Le dashboard récupère la liste des candidatures en attente d'analyse
3. Le recruteur sélectionne une candidature pour consultation
4. Les détails complets sont chargés (candidature, documents, profil)
5. Le recruteur évalue le dossier selon le Protocole 1 :
   - Noter le CV (score + commentaires)
   - Noter la lettre de motivation
   - Noter les diplômes et certificats
   - Évaluer l'adhérence MTP (Métier, Talent, Paradigme)
6. Les scores totaux sont calculés automatiquement
7. Si le dossier est retenu, le recruteur planifie une simulation (Protocole 2)
8. Une date et heure de simulation sont définies
9. Le recruteur prend une décision finale (accepter/rejeter)
10. Le changement de statut est enregistré avec création d'une entrée d'historique
11. Le candidat est notifié automatiquement

**Points critiques :**
- Calcul automatique des scores
- Enregistrement de l'historique pour traçabilité
- Notification automatique au candidat

#### Processus Global de Candidature

Ce diagramme d'activité montre le flux complet d'une candidature de l'inscription à la décision finale :

**Phases principales :**

**Phase 1 : Inscription et Vérification**
- Inscription avec vérification du matricule (pour internes)
- Validation du compte ou demande d'accès admin
- Activation du compte

**Phase 2 : Consultation et Candidature**
- Consultation du catalogue d'offres
- Sélection d'une offre pertinente
- Postulation si le profil est complet
- Upload des documents requis

**Phase 3 : Évaluation Recruteur**
- Analyse du dossier (Protocole 1)
- Décision de poursuivre ou rejeter
- Si poursuivi, planification et réalisation de la simulation (Protocole 2)
- Calcul des scores finaux
- Décision finale d'acceptation ou rejet

**Phase 4 : Notification**
- Notification automatique du candidat
- Fin du processus

Ces diagrammes ont assuré que la logique métier soit correctement traduite en code et que tous les cas d'usage soient couverts.

---

## 2.3. ARCHITECTURE TECHNOLOGIQUE DU PROJET

### Vue d'Ensemble

Le projet **Talent Flow Gabon** est développé selon une architecture **full-stack moderne** utilisant des technologies web récentes et un Backend as a Service (BaaS) pour accélérer le développement tout en garantissant la sécurité et la scalabilité.

### Frontend : Application Web Single Page Application (SPA)

**Framework principal : React 18.3**

React a été choisi pour sa maturité, sa large communauté et sa facilité de développement d'interfaces utilisateur complexes. L'architecture se base sur :
- **Composants fonctionnels** : Réutilisabilité et maintenabilité du code
- **Hooks personnalisés** : Encapsulation de la logique métier (ex: `useAuth`, `useJobOffers`)
- **Code splitting** : Chargement différé des composants pour optimiser les performances

**Typage fort : TypeScript 5.8**

TypeScript assure la cohérence et évite des erreurs précoces via :
- Interfaces et types
- Autocomplétion
- Refactoring assisté

**Outil de build : Vite 5.4**

Vite accélère le dev (HMR) et produit des bundles optimisés en production (minification, code splitting).

**Styling : Tailwind CSS 3.4**

Approche utility-first pour un style cohérent et réactif, cohérent avec l’identité SEEG.

**Composants UI : shadcn/ui**

Bibliothèque de composants accessibles, construite sur Radix UI, utilisée pour :
- Formulaires, tableaux, modales
- Mises en page cohérentes

**Routing : React Router DOM 7.8**

Routes et navigation simples, avec routes protégées selon les rôles.

**Gestion d'état : TanStack Query 5.8 + Context API**

- React Query pour le serveur (cache, retry)
- Context API pour l’état global léger (auth, campagnes)

**Formulaires : React Hook Form 7.6 + Zod 3.2**

- React Hook Form pour les formulaires
- Zod pour la validation côté client

**Autres bibliothèques :**
- Lucide React : icônes
- jspdf + jspdf-autotable : PDF
- xlsx : Excel
- Sonner : toasts
- Recharts : graphiques

### Backend : Backend as a Service (BaaS) avec Supabase

**PostgreSQL 13**

Base relationnelle avec :
- Contraintes de données
- Triggers d’historique
- Fonctions RPC (p. ex. vérification matricule)
- Politiques Row Level Security (RLS)

**Tables principales :**
- `users` : Candidats, recruteurs, admins
- `job_offers` : Offres
- `applications` : Candidatures
- `protocol1_evaluations` : Évaluations documentaires
- `protocol2_evaluations` : Simulations/entretiens
- `application_documents` : Documents
- `access_requests` : Demandes d’accès
- `notifications` : Notifications système

**Authentification Supabase**

- JWT, gestion de session, récupération de mot de passe
- Rôles : candidat, recruteur, observateur, admin

**Supabase Storage**

- Buckets par type, URLs signées, permissions

**Real-time Subscriptions**

- WebSockets pour notifications temps réel (demandes d’accès)

**Row Level Security (RLS)**

- Politiques par rôle, validation métier

### Gestion des Dépendenances

**Node.js 18+** via **npm**

Installation, build et lint via npm. Dépôts/CI possibles avec GitHub Actions.

### Sécurité

**Authentification**
- JWT avec expiration
- Rôles : candidat, recruteur, observateur, admin

**Autorisation**
- RLS
- Validation métier (matricule, interne/externe)

**Protection des données**
- Chiffrement, HTTPS, validation, XSS

### Déploiement

**Environnement**

Plates-formes : Vercel, Lovable
- Git → CI/CD
- Builds
- CDN + SSL

**Variables d'environnement**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_SMTP_HOST`, `VITE_SMTP_USER`

### Liste Complète des Technologies Utilisées

#### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.8.3 | Langage typé |
| Vite | 5.4.19 | Outil de build |
| Tailwind CSS | 3.4.17 | Framework CSS |
| shadcn/ui | latest | Composants UI |
| React Router | 7.8.1 | Routing |
| TanStack Query | 5.83.0 | Gestion état |
| React Hook Form | 7.61.1 | Formulaires |
| Zod | 3.25.76 | Validation |
| Lucide React | 0.462.0 | Icônes |
| jspdf | 3.0.1 | Génération PDF |
| xlsx | 0.18.5 | Excel |
| Sonner | 1.7.4 | Notifications |
| Recharts | 2.15.4 | Graphiques |
| date-fns | 3.6.0 | Dates |
| ESLint | 9.32.0 | Linting |

#### Backend & Base de Données
| Technologie | Version | Usage |
|-------------|---------|-------|
| Supabase | latest | BaaS |
| PostgreSQL | 13.0.4 | Base de données |
| Row Level Security | - | Sécurité |
| Supabase Auth | - | Authentification |
| Supabase Storage | - | Fichiers |
| Supabase Realtime | - | Temps réel |

#### Déploiement & Développement
| Technologie | Usage |
|-------------|-------|
| Vercel / Lovable | Hébergement |
| GitHub | Versioning |
| npm | Gestion dépendances |
| Git | Contrôle version |

### Conclusion Architecture

Stack actuelle, type-safe, sécurisée, maintenable, avec des optimisations pour la production.

**Points forts :**
- Maintien et évolution facilités
- Sécurité intégrée
- Effort réduit grâce à BaaS
- Scalabilité et performance

---
*Extraits générés pour le rapport de stage - Talent Flow Gabon 2025*

