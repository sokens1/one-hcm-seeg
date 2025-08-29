# Test d'Intégration du Dashboard Avancé

## ✅ Vérifications à Effectuer

### 1. **Structure des Fichiers**
- [ ] `src/pages/recruiter/RecruiterDashboard.tsx` - Dashboard principal avec basculement
- [ ] `src/pages/recruiter/AdvancedDashboard.tsx` - Dashboard avancé sans RecruiterLayout
- [ ] `src/components/ui/AdvancedCharts.tsx` - Composants de graphiques
- [ ] `src/components/ui/DashboardToggle.tsx` - Basculement entre vues
- [ ] `src/hooks/useAdvancedRecruiterStats.tsx` - Hook des statistiques avancées

### 2. **Fonctionnalités du Dashboard Principal**
- [ ] Basculement automatique vers la vue avancée par défaut
- [ ] Affichage du composant `DashboardToggle` en haut
- [ ] Basculement entre vue "Classique" et "Avancée"
- [ ] Conservation de toutes les fonctionnalités existantes

### 3. **Vue Avancée**
- [ ] **Header** : Titre "Recruiter & Observer Dashboard"
- [ ] **Toggle** : Switch pour masquer les offres actives
- [ ] **KPIs** : 3 cartes de métriques (Total Applications, Coverage Rate, Open Positions)
- [ ] **Graphiques** : Histogramme et graphique linéaire
- [ ] **Répartition** : Graphique de répartition par statut
- [ ] **Offres Actives** : Section conditionnelle (masquable)
- **Actions Rapides** : Boutons de navigation
- **Activité Récente** : Liste des activités

### 4. **Vue Classique**
- [ ] **Métriques de Base** : Statistiques traditionnelles
- [ ] **Gestion des Offres** : Interface classique
- [ ] **Activités Récentes** : Suivi des actions

### 5. **Responsive Design**
- [ ] **Mobile** (< 640px) : Grilles adaptatives
- [ ] **Tablet** (640px - 1024px) : Layout intermédiaire
- [ ] **Desktop** (> 1024px) : Layout complet

## 🧪 Tests Manuels

### Test 1 : Basculement entre Vues
1. Accéder à `/recruiter/dashboard`
2. Vérifier que la vue avancée s'affiche par défaut
3. Cliquer sur "Classique" → Vérifier l'affichage du dashboard original
4. Cliquer sur "Avancé" → Vérifier le retour au dashboard avancé

### Test 2 : Fonctionnalités Avancées
1. **Toggle des Offres Actives** : Activer/désactiver le switch
2. **Graphiques** : Vérifier l'affichage des histogrammes et graphiques
3. **KPIs** : Vérifier les valeurs et indicateurs de tendance
4. **Navigation** : Tester tous les boutons d'action

### Test 3 : Responsive
1. **Mobile** : Redimensionner la fenêtre < 640px
2. **Tablet** : Redimensionner entre 640px et 1024px
3. **Desktop** : Redimensionner > 1024px
4. Vérifier l'adaptation des grilles et composants

## 🐛 Problèmes Courants et Solutions

### Problème 1 : Erreur "Cannot find module"
**Cause** : Import incorrect ou fichier manquant
**Solution** : Vérifier les chemins d'import dans `AdvancedDashboard.tsx`

### Problème 2 : Double RecruiterLayout
**Cause** : Le composant avancé contient encore RecruiterLayout
**Solution** : Vérifier que `AdvancedDashboard.tsx` retourne seulement des fragments `<>`

### Problème 3 : Graphiques qui ne s'affichent pas
**Cause** : Données manquantes ou erreur dans le hook
**Solution** : Vérifier la console et les données Supabase

### Problème 4 : Erreurs TypeScript
**Cause** : Types manquants ou incorrects
**Solution** : Vérifier les interfaces dans `useAdvancedRecruiterStats.tsx`

## 📱 Vérification Mobile

### Test sur Mobile
1. **Ouvrir DevTools** → Mode responsive
2. **Sélectionner** un appareil mobile (ex: iPhone 12)
3. **Vérifier** :
   - Grilles s'adaptent correctement
   - Boutons sont touch-friendly
   - Graphiques restent lisibles
   - Navigation est intuitive

## 🔧 Debug

### Console Browser
- Vérifier les erreurs JavaScript
- Contrôler les requêtes Supabase
- Vérifier les états React

### React DevTools
- Inspecter les composants
- Vérifier les props et états
- Contrôler les hooks personnalisés

## ✅ Checklist Finale

- [ ] Tous les composants se chargent sans erreur
- [ ] Le basculement entre vues fonctionne
- [ ] Les graphiques s'affichent correctement
- [ ] Le responsive design fonctionne sur tous les écrans
- [ ] Les données se mettent à jour en temps réel
- [ ] Tous les contrôles sont fonctionnels
- [ ] La navigation est fluide et intuitive

## 🎯 Résultat Attendu

Un dashboard moderne et responsive avec :
- **Vue Classique** : Fonctionnalités traditionnelles
- **Vue Avancée** : Graphiques interactifs et métriques avancées
- **Basculement fluide** entre les deux vues
- **Design responsive** optimisé pour tous les appareils
- **Intégration Supabase** pour des données en temps réel
