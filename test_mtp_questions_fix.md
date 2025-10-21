# 🧪 Test des corrections MTP Questions

## ✅ Corrections apportées

### 1. Vue Recruteur (`CandidateAnalysis.tsx`)
- **Avant** : Utilisait `getMetierQuestionsForTitle(jobTitle)` → questions par défaut
- **Après** : Utilise `getMTPQuestionsFromJobOffer(jobOffer)` → vraies questions de l'offre
- **Changement** : Passage de l'offre complète au composant `MtpAnswersDisplay`
- **Correction** : Limite l'affichage au nombre de questions de l'offre (pas de questions vides)

### 2. Export PDF (`exportPdfUtils.ts` + `generateApplicationPdf.ts`)
- **Avant** : Utilisait les questions par défaut basées sur le titre
- **Après** : Récupère les vraies questions MTP depuis `application.job_offers`
- **Changement** : Ajout des champs `metierQuestions`, `talentQuestions`, `paradigmeQuestions` dans `ApplicationData`
- **Correction** : Affiche seulement le nombre de questions correspondant à l'offre (pas de questions vides)

## 🎯 Comportement attendu

### Vue Recruteur
- Les questions affichées correspondent exactement aux questions configurées pour l'offre
- Si l'offre a des questions personnalisées → affiche les questions personnalisées
- Si l'offre est externe → affiche 7 questions Métier, 3 Talent, 3 Paradigme
- Si l'offre est interne → affiche 3 questions Métier, 3 Talent, 3 Paradigme
- **Plus de questions vides** : n'affiche que le nombre de questions de l'offre

### Export PDF
- Le PDF généré contient les vraies questions de l'offre
- Les réponses sont associées aux bonnes questions
- Plus de décalage entre questions et réponses
- **Plus de questions vides** : n'affiche que le nombre de questions de l'offre

## 🧪 Tests à effectuer

### Test 1 : Vue Recruteur
1. Aller sur une candidature dans la vue recruteur
2. Cliquer sur l'onglet "Références"
3. Vérifier que les questions MTP affichées correspondent à l'offre :
   - **Offre externe** : 7 questions Métier, 3 Talent, 3 Paradigme
   - **Offre interne** : 3 questions Métier, 3 Talent, 3 Paradigme
   - **Offre personnalisée** : Questions spécifiques configurées

### Test 2 : Export PDF
1. Dans la vue recruteur, cliquer sur "Télécharger PDF"
2. Ouvrir le PDF généré
3. Aller à la section "Adhérence MTP"
4. Vérifier que :
   - Les questions correspondent à l'offre (pas les questions par défaut)
   - Les réponses sont alignées avec les bonnes questions
   - Le nombre de questions correspond au type d'offre

### Test 3 : Offre avec questions personnalisées
1. Créer/éditer une offre avec des questions MTP personnalisées
2. Faire une candidature sur cette offre
3. Vérifier que la vue recruteur et l'export PDF utilisent les questions personnalisées

## 🔍 Vérification technique

### Dans la console du navigateur
```javascript
// Vérifier que l'offre contient les bonnes questions MTP
console.log('Questions MTP de l\'offre:', {
  metier: application.job_offers.mtp_questions_metier,
  talent: application.job_offers.mtp_questions_talent,
  paradigme: application.job_offers.mtp_questions_paradigme,
  status_offerts: application.job_offers.status_offerts
});
```

### Dans la base de données
```sql
-- Vérifier les questions MTP d'une offre spécifique
SELECT 
    id, title, status_offerts,
    mtp_questions_metier,
    mtp_questions_talent,
    mtp_questions_paradigme
FROM job_offers 
WHERE id = 'ID_DE_L_OFFRE';
```

## 🚨 Si le problème persiste

1. **Vérifier que l'offre a bien des questions MTP** en base
2. **Vérifier que `application.job_offers` est bien peuplé** dans la vue recruteur
3. **Vérifier que `getMTPQuestionsFromJobOffer` retourne les bonnes questions**
4. **Vérifier que les questions sont bien passées au PDF**

## 📝 Notes

- Les corrections sont rétrocompatibles : si l'offre n'a pas de questions personnalisées, le système utilise les questions par défaut selon le statut (interne/externe)
- Le fallback vers `getMetierQuestionsForTitle` reste en place pour les cas où l'offre n'est pas disponible
