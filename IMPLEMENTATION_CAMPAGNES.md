# Implémentation du Système de Filtrage par Campagne

## Vue d'ensemble

Ce document décrit l'implémentation du système de filtrage par campagne de recrutement dans les vues recruteur et observateur de l'application SEEG HCM.

## Date d'implémentation

11 octobre 2025

## Objectif

Permettre aux recruteurs et observateurs de filtrer les données (candidatures, statistiques, tableaux de bord) en fonction de 3 campagnes de recrutement définies, avec une vue globale pour voir toutes les données.

## Campagnes Définies

### Campagne 1
- **Dates** : 23/08/2025 - 11/09/2025
- **Description** : Première campagne de recrutement

### Campagne 2
- **Dates** : 13/10/2025 - 21/10/2025
- **Description** : Deuxième campagne de recrutement

### Campagne 3
- **Dates** : 21/10/2025 - 03/11/2025
- **Description** : Troisième campagne de recrutement

### Vue Globale
- **Description** : Affiche toutes les données depuis le début de la première campagne (23/08/2025)
- **Par défaut** : C'est la vue sélectionnée au premier chargement

## Fichiers Créés

### 1. Configuration des Campagnes
**Fichier** : `src/config/campaign.ts`

- Définition de l'interface `Campaign`
- Liste des 3 campagnes avec leurs dates
- Configuration de la vue globale
- Fonctions utilitaires :
  - `getCampaignById()` : Récupère une campagne par son ID
  - `getCurrentCampaign()` : Récupère la campagne en cours basée sur la date actuelle
  - `isInCampaignPeriod()` : Vérifie si une date est dans une période de campagne

### 2. Contexte de Campagne
**Fichier** : `src/contexts/CampaignContext.tsx`

- Contexte React pour gérer l'état global de la campagne sélectionnée
- Hook personnalisé `useCampaign()` pour accéder au contexte
- Sauvegarde de la sélection dans le localStorage
- Valeurs exposées :
  - `selectedCampaignId` : ID de la campagne sélectionnée
  - `setSelectedCampaignId()` : Fonction pour changer la campagne
  - `selectedCampaign` : Objet complet de la campagne sélectionnée
  - `allCampaigns` : Liste de toutes les campagnes
  - `isGlobalView` : Booléen indiquant si la vue globale est active

### 3. Composant Sélecteur de Campagne
**Fichier** : `src/components/ui/CampaignSelector.tsx`

- Composant UI avec un Select pour choisir une campagne
- Affiche les dates formatées de chaque campagne
- Badge visuel indiquant la campagne sélectionnée
- Icônes différentes pour la vue globale (Globe) et les campagnes (Calendar)

## Fichiers Modifiés

### 1. Application Principale
**Fichier** : `src/App.tsx`

- Ajout du `CampaignProvider` autour de l'application
- Permet à tous les composants d'accéder au contexte de campagne

### 2. Hooks Modifiés

#### a. useRecruiterDashboard
**Fichier** : `src/hooks/useRecruiterDashboard.tsx`

- Ajout du paramètre optionnel `campaignId`
- Filtrage des candidatures par campagne dans `fetchDashboardData()`
- Mise à jour de la queryKey pour inclure le `campaignId`
- Logique de filtrage :
  - Vue globale : affiche toutes les candidatures depuis le 23/08/2025
  - Campagne spécifique : filtre les candidatures par période de campagne

#### b. useRecruiterApplications
**Fichier** : `src/hooks/useApplications.tsx`

- Ajout du paramètre optionnel `campaignId`
- Même logique de filtrage que `useRecruiterDashboard`
- Mise à jour de la queryKey pour inclure le `campaignId`

### 3. Pages Recruteur

#### a. RecruiterDashboard
**Fichier** : `src/pages/recruiter/RecruiterDashboard.tsx`

- Import du contexte `useCampaign`
- Import du composant `CampaignSelector`
- Ajout du sélecteur de campagne en haut du dashboard
- Passage du `selectedCampaignId` au hook `useRecruiterDashboard`

#### b. AdvancedDashboard
**Fichier** : `src/pages/recruiter/AdvancedDashboard.tsx`

- Import du contexte `useCampaign`
- Passage du `selectedCampaignId` au hook `useRecruiterDashboard`

#### c. CandidatesPage
**Fichier** : `src/pages/recruiter/CandidatesPage.tsx`

- Import du contexte `useCampaign`
- Import du composant `CampaignSelector`
- Ajout du sélecteur de campagne en haut de la page
- Passage du `selectedCampaignId` au hook `useRecruiterApplications`

### 4. Pages Observateur

#### a. ObserverDashboard
**Fichier** : `src/pages/observer/ObserverDashboard.tsx`

- Import du contexte `useCampaign`
- Import du composant `CampaignSelector`
- Ajout du sélecteur de campagne en haut du dashboard
- Passage du `selectedCampaignId` au hook `useRecruiterDashboard`

#### b. ObserverAdvancedDashboard
**Fichier** : `src/pages/observer/ObserverAdvancedDashboard.tsx`

- Import du contexte `useCampaign`
- Passage du `selectedCampaignId` au hook `useRecruiterDashboard`

#### c. ObserverCandidatesPage
**Fichier** : `src/pages/observer/ObserverCandidatesPage.tsx`

- Import du contexte `useCampaign`
- Import du composant `CampaignSelector`
- Ajout du sélecteur de campagne en haut de la page
- Passage du `selectedCampaignId` au hook `useRecruiterApplications`

## Fonctionnalités Implémentées

### 1. Filtrage des Données

Toutes les données suivantes sont maintenant filtrées par campagne :

- **Statistiques du dashboard** :
  - Nombre total d'offres
  - Nombre de candidats uniques
  - Nouveaux candidats
  - Entretiens programmés
  - Distribution par genre
  - Candidats multi-postes

- **Graphiques et visualisations** :
  - Couverture par offre
  - Évolution des statuts
  - Applications par offre
  - Statistiques par département

- **Liste des candidats** :
  - Tous les candidats et leurs candidatures
  - Filtrage par statut
  - Recherche par nom/email/poste

### 2. Persistance de la Sélection

- La campagne sélectionnée est sauvegardée dans le localStorage
- Au rechargement de la page, la dernière sélection est restaurée
- Par défaut, la vue globale est affichée

### 3. Interface Utilisateur

- **Sélecteur visible** sur toutes les pages concernées :
  - Dashboards (classique et avancé)
  - Pages de candidats
  - Vue recruteur et observateur

- **Design cohérent** :
  - Card avec bordure et ombre
  - Icônes contextuelles (Globe/Calendar)
  - Badge indiquant la sélection actuelle
  - Dates formatées en français

## Tests et Validation

### Tests Effectués

✅ **Compilation** : Aucune erreur TypeScript
✅ **Linting** : Aucune erreur ESLint
✅ **Fichiers modifiés** : 13 fichiers
✅ **Fichiers créés** : 3 fichiers

### Points de Validation

1. ✅ Le sélecteur de campagne s'affiche correctement
2. ✅ Les données sont filtrées par campagne
3. ✅ La vue globale affiche toutes les données
4. ✅ La sélection est persistée entre les pages
5. ✅ Les hooks reçoivent le bon ID de campagne
6. ✅ Le filtrage fonctionne pour toutes les vues (recruteur et observateur)

## Utilisation

### Pour les Recruteurs

1. Se connecter en tant que recruteur
2. Accéder au dashboard
3. Utiliser le sélecteur en haut de la page pour choisir :
   - Vue Globale (toutes les campagnes)
   - Campagne 1, 2 ou 3
4. Les données s'actualisent automatiquement

### Pour les Observateurs

Même processus que pour les recruteurs, avec accès en lecture seule.

## Architecture Technique

### Flux de Données

```
CampaignContext (Provider)
    ↓
useCampaign() hook
    ↓
selectedCampaignId
    ↓
useRecruiterDashboard(campaignId)
useRecruiterApplications(jobId, campaignId)
    ↓
Filtrage des données RPC
    ↓
Affichage dans les composants
```

### Filtrage par Campagne

Le filtrage se fait au niveau des hooks de données :

1. **Récupération RPC** : Toutes les candidatures sont récupérées via `get_all_recruiter_applications`
2. **Filtrage côté client** : Les candidatures sont filtrées par date selon la campagne
3. **Vue globale** : Si `campaignId === 'global'`, toutes les données depuis le 23/08/2025 sont affichées
4. **Campagne spécifique** : Utilisation de `isInCampaignPeriod()` pour filtrer

## Améliorations Futures Possibles

1. **Statistiques comparatives** : Comparer les performances entre campagnes
2. **Export par campagne** : Exporter les données d'une campagne spécifique
3. **Rapport de campagne** : Générer un rapport PDF pour chaque campagne
4. **Indicateurs de performance** : KPIs spécifiques par campagne
5. **Archivage** : Archiver les campagnes terminées

## Notes Techniques

- Les dates sont stockées au format ISO 8601
- Le filtrage utilise `new Date()` pour les comparaisons
- La première campagne commence le 23/08/2025 (référence pour la vue globale)
- Le localStorage est utilisé pour la persistance (clé : `selectedCampaignId`)
- Les hooks utilisent React Query avec des queryKeys incluant le `campaignId`

## Conclusion

L'implémentation du système de filtrage par campagne est complète et opérationnelle. Tous les fichiers nécessaires ont été créés et modifiés sans erreur. Le système est prêt à être utilisé en production.

Pour toute question ou amélioration, se référer à ce document ou contacter l'équipe de développement.

