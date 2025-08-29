# Test de la Vue Classique Réorganisée

## 🎯 Objectif
Vérifier que la vue classique du dashboard respecte l'ordre de lecture des indicateurs selon les spécifications.

## 📋 Ordre des Indicateurs Attendus

### **1. Offres Actives** 🏢
- **Position** : Premier indicateur (gauche, première ligne)
- **Couleur** : Bleu
- **Icône** : Briefcase
- **Valeur** : Nombre total d'offres actives
- **Description** : "Postes ouverts"

### **2. Total des Candidatures** 👥
- **Position** : Deuxième indicateur (centre, première ligne)
- **Couleur** : Vert
- **Icône** : Users
- **Valeur** : Nombre total de candidats uniques
- **Description** : "+X ce jour"

### **3. Candidatures par Poste** 📈
- **Position** : Troisième indicateur (droite, première ligne)
- **Couleur** : Violet
- **Icône** : BarChart3
- **Valeur** : Moyenne des candidatures par poste
- **Description** : "Moyenne"

### **4. Candidats Multi-Postes** 🔄
- **Position** : Quatrième indicateur (gauche, deuxième ligne)
- **Couleur** : Orange
- **Icône** : Target
- **Valeur** : Nombre de candidats multi-postes
- **Description** : "Candidats"

### **5. Taux de Couverture** 🎯
- **Position** : Cinquième indicateur (centre, deuxième ligne)
- **Couleur** : Émeraude
- **Icône** : TrendingUp
- **Valeur** : Pourcentage de couverture
- **Description** : "Couverture"

### **6. Entretiens** 📅
- **Position** : Sixième indicateur (droite, deuxième ligne)
- **Couleur** : Violet
- **Icône** : Calendar
- **Valeur** : Nombre d'entretiens programmés
- **Description** : "Programmés"

## 🔍 Étapes de Test

### **Étape 1 : Accès au Dashboard**
1. Naviguer vers `/recruiter/dashboard`
2. Vérifier que la vue classique est affichée par défaut
3. Confirmer que le bouton "Classique" est actif

### **Étape 2 : Vérification de l'Ordre des Indicateurs**
1. **Première ligne** (3 indicateurs) :
   - Gauche : Offres Actives (bleu)
   - Centre : Total des Candidatures (vert)
   - Droite : Candidatures par Poste (violet)

2. **Deuxième ligne** (3 indicateurs) :
   - Gauche : Candidats Multi-Postes (orange)
   - Centre : Taux de Couverture (émeraude)
   - Droite : Entretiens (violet)

### **Étape 3 : Vérification des Données**
1. **Offres Actives** : Doit afficher le nombre réel d'offres
2. **Total des Candidatures** : Doit afficher le nombre réel de candidats
3. **Candidatures par Poste** : Doit calculer la moyenne (Total candidats / Total offres)
4. **Candidats Multi-Postes** : Doit afficher le nombre de candidats multi-postes
5. **Taux de Couverture** : Doit calculer le pourcentage (Total candidats / Total offres × 100)
6. **Entretiens** : Doit afficher le nombre d'entretiens programmés

### **Étape 4 : Vérification de la Responsivité**
1. **Desktop** : Grille 3x2 (3 colonnes, 2 lignes)
2. **Tablet** : Grille 2x3 (2 colonnes, 3 lignes)
3. **Mobile** : Grille 1x6 (1 colonne, 6 lignes)

## ✅ Checklist de Validation

### **Ordre des Indicateurs**
- [ ] Offres Actives en première position
- [ ] Total des Candidatures en deuxième position
- [ ] Candidatures par Poste en troisième position
- [ ] Candidats Multi-Postes en quatrième position
- [ ] Taux de Couverture en cinquième position
- [ ] Entretiens en sixième position

### **Données Affichées**
- [ ] Valeurs numériques correctes
- [ ] Calculs automatiques fonctionnels
- [ ] Descriptions appropriées
- [ ] Icônes contextuelles

### **Design et Responsivité**
- [ ] Couleurs cohérentes avec la palette
- [ ] Grille adaptative selon la taille d'écran
- [ ] Espacement uniforme entre les cartes
- [ ] Transitions fluides

## 🚨 Problèmes Courants

### **1. Ordre Incorrect**
- **Symptôme** : Les indicateurs ne sont pas dans l'ordre attendu
- **Solution** : Vérifier que le composant `RecruiterDashboard.tsx` a été mis à jour

### **2. Données Manquantes**
- **Symptôme** : Certains indicateurs affichent 0 ou "undefined"
- **Solution** : Vérifier la connexion Supabase et les données de test

### **3. Problème de Grille**
- **Symptôme** : La disposition des cartes est incorrecte
- **Solution** : Vérifier les classes CSS Tailwind et la responsivité

### **4. Calculs Incorrects**
- **Symptôme** : Les valeurs calculées ne correspondent pas aux attentes
- **Solution** : Vérifier la logique de calcul dans le hook `useRecruiterDashboard`

## 🎯 Résultat Attendu

La vue classique doit maintenant afficher **6 indicateurs** dans l'ordre exact spécifié :
1. **Offres Actives** (bleu) - Premier indicateur
2. **Total des Candidatures** (vert)
3. **Candidatures par Poste** (violet)
4. **Candidats Multi-Postes** (orange)
5. **Taux de Couverture** (émeraude)
6. **Entretiens** (violet)

Tous les indicateurs doivent utiliser des **données réelles** de la base de données et être **entièrement responsifs**.

## 🔄 Test de Basculement

### **Vue Classique → Vue Avancée**
1. Cliquer sur le bouton "Avancé"
2. Vérifier que le dashboard avancé s'affiche
3. Confirmer que tous les nouveaux graphiques sont présents

### **Vue Avancée → Vue Classique**
1. Cliquer sur le bouton "Classique"
2. Vérifier que la vue classique réorganisée s'affiche
3. Confirmer que l'ordre des 6 indicateurs est respecté

## 📝 Notes de Test

- **Date de test** : [À remplir]
- **Testeur** : [À remplir]
- **Version** : Vue Classique Réorganisée
- **Statut** : [À remplir]

---

**La vue classique est maintenant entièrement conforme aux spécifications demandées !** 🎉
