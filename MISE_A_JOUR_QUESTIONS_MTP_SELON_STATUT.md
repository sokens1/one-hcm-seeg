# 📋 Mise à jour : Questions MTP selon le statut (Interne/Externe)

## ✅ Modifications effectuées

### 🎯 Objectif
Les offres **externes** affichent maintenant **3 questions par catégorie** (Métier, Talent, Paradigme), tandis que les offres **internes** conservent le format actuel (7 Métier, 3 Talent, 3 Paradigme).

---

## 📊 Règles de questions MTP

### Offres INTERNES
- **7 questions Métier**
- **3 questions Talent**
- **3 questions Paradigme**

### Offres EXTERNES
- **3 questions Métier**
- **3 questions Talent**
- **3 questions Paradigme**

---

## 🔧 Fichiers modifiés

### 1. `src/components/forms/MTPQuestionsEditor.tsx`
✅ Ajout du prop `statusOfferts` (interne/externe)
✅ Calcul dynamique du nombre de questions recommandées
✅ Affichage d'un badge informatif selon le statut :
   - 📢 Offre externe : 3 questions par catégorie
   - 📢 Offre interne : 7 questions Métier, 3 Talent, 3 Paradigme

### 2. `src/pages/recruiter/CreateJob.tsx`
✅ Passage du prop `statusOfferts` au composant `MTPQuestionsEditor`

### 3. `src/pages/recruiter/EditJob.tsx`
✅ Passage du prop `statusOfferts` au composant `MTPQuestionsEditor`

### 4. `src/data/metierQuestions.ts`
✅ Création de `defaultMTPQuestionsExternes` (3 questions par catégorie)
✅ Mise à jour de `getMTPQuestionsFromJobOffer()` pour prendre en compte le statut
✅ Logique de fallback :
   1. Si des questions personnalisées existent → les utiliser
   2. Si l'offre est externe → utiliser `defaultMTPQuestionsExternes`
   3. Sinon → utiliser les questions par défaut basées sur le titre

---

## 🎨 Expérience utilisateur

### Pour les recruteurs

1. **Lors de la création d'une offre :**
   - Sélectionnez "Interne" ou "Externe" dans le champ "Statut de l'offre"
   - Le composant Questions MTP affiche automatiquement le nombre recommandé
   - Un badge coloré indique le format attendu

2. **Lors de la modification d'une offre :**
   - Le statut est chargé depuis la base de données
   - Les recommandations s'ajustent automatiquement

### Pour les candidats

1. **Lors de la candidature :**
   - Si l'offre est externe → 3 questions par catégorie (9 au total)
   - Si l'offre est interne → 7 Métier + 3 Talent + 3 Paradigme (13 au total)
   - Les questions personnalisées (si définies) priment sur les questions par défaut

---

## 🧪 Comment tester

### Test 1 : Créer une offre externe

1. Allez sur `/recruiter/create-job`
2. Remplissez les champs obligatoires
3. Sélectionnez **"Externe"** dans "Statut de l'offre"
4. Allez à la section "Questions MTP"
5. Vérifiez que le badge indique : **"📢 Offre externe : 3 questions par catégorie"**
6. Ajoutez 3 questions dans chaque onglet (Métier, Talent, Paradigme)
7. Publiez l'offre
8. Postulez en tant que candidat
9. Vérifiez que seulement **3 questions s'affichent par catégorie**

### Test 2 : Créer une offre interne

1. Allez sur `/recruiter/create-job`
2. Remplissez les champs obligatoires
3. Sélectionnez **"Interne"** dans "Statut de l'offre"
4. Allez à la section "Questions MTP"
5. Vérifiez que le badge indique : **"📢 Offre interne : 7 questions Métier, 3 Talent, 3 Paradigme"**
6. Ajoutez 7 questions Métier, 3 Talent, 3 Paradigme
7. Publiez l'offre
8. Postulez en tant que candidat
9. Vérifiez que **7 questions Métier** et **3 questions Talent/Paradigme** s'affichent

### Test 3 : Modifier le statut d'une offre

1. Modifiez une offre existante
2. Changez le statut de "Interne" à "Externe"
3. Vérifiez que le badge et les recommandations changent instantanément
4. Les questions déjà saisies restent inchangées (pas de perte de données)

---

## 📊 Priorité des questions (rappel)

L'ordre de priorité pour afficher les questions MTP est :

1. **Questions personnalisées** (définies dans `mtp_questions_metier`, `mtp_questions_talent`, `mtp_questions_paradigme`)
2. **Questions selon le statut** :
   - Externe → `defaultMTPQuestionsExternes` (3 par catégorie)
   - Interne → Questions par titre ou `defaultMTPQuestions` (7 Métier, 3 Talent, 3 Paradigme)

---

## ✅ Avantages

- 🎯 **Flexibilité** : Adaptation automatique selon le type d'offre
- 🔄 **Cohérence** : Nombre de questions adapté au type de candidature
- 📊 **UX améliorée** : Badge informatif pour guider les recruteurs
- 🚀 **Performance** : Moins de questions pour les candidatures externes = processus plus rapide
- ✅ **Rétrocompatible** : Les offres existantes continuent de fonctionner

---

## 🔮 Prochaines évolutions possibles

- [ ] Permettre au recruteur de personnaliser le nombre de questions par catégorie
- [ ] Statistiques sur le taux de complétion selon le nombre de questions
- [ ] Templates de questions par secteur d'activité
- [ ] Export/Import de questions MTP entre offres

---

**Date de mise à jour** : 9 octobre 2025, 15h45
**Mode campagne** : Désactivé (`CAMPAIGN_MODE = false`)

