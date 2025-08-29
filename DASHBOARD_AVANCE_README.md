# Dashboard Recruteur et Observateur Avancé

## Vue d'ensemble

Ce projet implémente une refonte complète du dashboard recruteur et observateur avec des fonctionnalités d'analyse de données avancées et un design moderne et responsive.

## Fonctionnalités Principales

### 🔄 Basculement entre Vues
- **Vue Classique** : Dashboard original avec métriques de base
- **Vue Avancée** : Dashboard moderne avec graphiques interactifs et analyses détaillées

### 📊 Métriques Avancées (KPIs)
- **Total Applications** : Nombre total de candidatures reçues
- **Coverage Rate** : Taux de couverture par poste (candidatures/postes ouverts)
- **Open Positions** : Nombre de postes actuellement ouverts

### 📈 Visualisations de Données
- **Histogramme** : Répartition des candidatures par poste
- **Graphique Linéaire** : Évolution des candidatures par statut au fil du temps
- **Graphique de Répartition** : Distribution des candidatures par statut avec pourcentages

### 🎛️ Contrôles Avancés
- **Masquer les Offres Actives** : Toggle pour filtrer l'affichage des offres actives
- **Données en Temps Réel** : Intégration Supabase pour des données toujours à jour

## Architecture Technique

### Composants Principaux
```
src/
├── pages/recruiter/
│   ├── RecruiterDashboard.tsx      # Dashboard principal avec basculement
│   └── AdvancedDashboard.tsx       # Dashboard avancé
├── components/ui/
│   ├── AdvancedCharts.tsx          # Composants de graphiques
│   └── DashboardToggle.tsx         # Basculement entre vues
└── hooks/
    └── useAdvancedRecruiterStats.tsx # Logique des statistiques avancées
```

### Hooks Personnalisés
- `useAdvancedRecruiterStats` : Gestion des statistiques avancées
- `useRecruiterDashboard` : Données de base du dashboard
- `useRecruiterActivity` : Activités récentes

### Composants de Graphiques
- `AdvancedHistogram` : Histogramme interactif
- `AdvancedLineChart` : Graphique linéaire avec grille
- `MetricCard` : Cartes de métriques avec indicateurs de tendance
- `StatusDistributionChart` : Répartition par statut

## Utilisation

### 1. Accès au Dashboard
Naviguez vers `/recruiter/dashboard` pour accéder au dashboard principal.

### 2. Basculement entre Vues
Utilisez les boutons "Classique" et "Avancé" en haut du dashboard pour changer de vue.

### 3. Vue Avancée
- **KPIs** : Métriques clés affichées en haut
- **Graphiques** : Visualisations interactives des données
- **Contrôles** : Toggle pour masquer les offres actives
- **Actions Rapides** : Accès rapide aux fonctionnalités principales

### 4. Vue Classique
- **Métriques de Base** : Statistiques traditionnelles
- **Gestion des Offres** : Interface classique pour la gestion des postes
- **Activités Récentes** : Suivi des actions récentes

## Fonctionnalités d'Analyse

### Calculs Automatiques
- **Taux de Couverture** : Calculé automatiquement (candidatures/postes)
- **Répartition par Statut** : Pourcentages calculés en temps réel
- **Évolution Temporelle** : Données groupées par mois

### Filtrage et Tri
- **Par Position** : Tri automatique par nombre de candidatures
- **Par Statut** : Regroupement par statut de candidature
- **Par Période** : Évolution mensuelle des données

## Responsive Design

### Mobile First
- **Grilles Adaptatives** : S'ajustent automatiquement à la taille d'écran
- **Composants Flexibles** : Graphiques et cartes s'adaptent au mobile
- **Navigation Touch-Friendly** : Boutons et contrôles optimisés pour le tactile

### Breakpoints
- **Mobile** : < 640px
- **Tablet** : 640px - 1024px
- **Desktop** : > 1024px

## Intégration Supabase

### Fonctions RPC Utilisées
- `get_all_recruiter_applications` : Récupération des candidatures
- `get_recruiter_activities` : Activités des recruteurs

### Données en Temps Réel
- **Requêtes Optimisées** : Utilisation de React Query pour la gestion d'état
- **Mise à Jour Automatique** : Rafraîchissement automatique des données
- **Gestion d'Erreurs** : Gestion robuste des erreurs de connexion

## Personnalisation

### Couleurs et Thèmes
- **Palette Cohérente** : Utilisation des variables CSS personnalisées
- **Thème Sombre/Clair** : Support automatique des thèmes
- **Accents Visuels** : Couleurs distinctives pour chaque type de données

### Animations
- **Transitions Fluides** : Animations CSS pour une meilleure UX
- **Chargement Progressif** : Affichage progressif des éléments
- **Feedback Visuel** : Indicateurs de chargement et d'état

## Maintenance et Évolutions

### Ajout de Nouvelles Métriques
1. Modifier l'interface `AdvancedStats` dans `useAdvancedRecruiterStats.tsx`
2. Ajouter la logique de calcul dans la fonction `loadStats`
3. Créer un nouveau composant de visualisation si nécessaire

### Ajout de Nouveaux Graphiques
1. Créer un nouveau composant dans `AdvancedCharts.tsx`
2. Définir les interfaces TypeScript appropriées
3. Intégrer dans le dashboard avancé

### Personnalisation des Couleurs
- Modifier les variables CSS dans `tailwind.config.ts`
- Ajuster les couleurs dans les composants de graphiques
- Maintenir la cohérence visuelle globale

## Déploiement

### Prérequis
- Node.js 18+
- Supabase configuré et accessible
- Variables d'environnement configurées

### Build
```bash
npm run build
# ou
yarn build
```

### Vérifications
- [ ] Tous les composants se chargent correctement
- [ ] Les graphiques s'affichent sur mobile et desktop
- [ ] Les données se mettent à jour en temps réel
- [ ] Le basculement entre vues fonctionne
- [ ] Les contrôles (toggle, filtres) sont fonctionnels

## Support et Dépannage

### Problèmes Courants
1. **Graphiques qui ne s'affichent pas** : Vérifier les données Supabase
2. **Erreurs de chargement** : Vérifier la connexion réseau et Supabase
3. **Problèmes de responsive** : Tester sur différents appareils

### Logs et Debug
- Utiliser la console du navigateur pour les erreurs
- Vérifier les requêtes Supabase dans l'onglet Network
- Contrôler les états React avec React DevTools

## Conclusion

Ce dashboard avancé offre une expérience moderne et intuitive pour les recruteurs et observateurs, avec des analyses de données en temps réel et un design responsive. L'architecture modulaire permet une maintenance facile et des évolutions futures.
