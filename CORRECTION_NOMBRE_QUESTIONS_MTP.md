# ✅ CORRECTION : Nombre de questions MTP selon le statut

## 🎯 Problème identifié
La logique était inversée :
- **Internes** : 7 questions Métier ❌
- **Externes** : 3 questions Métier ❌

## ✅ Correction appliquée
Maintenant c'est correct :
- **Internes** : 3 questions Métier ✅
- **Externes** : 7 questions Métier ✅

---

## 📊 Règles corrigées

### **Offres INTERNES**
- **3 questions Métier** ✅
- **3 questions Talent** ✅
- **3 questions Paradigme** ✅

### **Offres EXTERNES**
- **7 questions Métier** ✅
- **3 questions Talent** ✅
- **3 questions Paradigme** ✅

---

## 🔧 Fichiers modifiés

### **1. `src/components/forms/MTPQuestionsEditor.tsx`**
```typescript
// AVANT (incorrect)
const recommendedMetier = isExterne ? 3 : 7;

// APRÈS (correct)
const recommendedMetier = isExterne ? 7 : 3;
```

**Messages d'affichage corrigés :**
- Externes : "📢 Offre externe : 7 questions Métier, 3 Talent, 3 Paradigme"
- Internes : "📢 Offre interne : 3 questions Métier, 3 Talent, 3 Paradigme"

### **2. `src/data/metierQuestions.ts`**
**Nouvelle constante créée :**
```typescript
export const defaultMTPQuestionsInternes: MTPQuestions = {
  metier: [
    "1. Quelles sont vos principales compétences techniques dans ce domaine ?",
    "2. Comment votre expérience professionnelle vous prépare-t-elle à ce poste ?",
    "3. Quels défis techniques de ce métier vous motivent le plus ?",
  ],
  // ... talent et paradigme (3 questions chacun)
};
```

**Questions externes étendues :**
```typescript
export const defaultMTPQuestionsExternes: MTPQuestions = {
  metier: [
    "1. Quelles sont vos principales compétences techniques dans ce domaine ?",
    "2. Comment votre expérience professionnelle vous prépare-t-elle à ce poste ?",
    "3. Quels défis techniques de ce métier vous motivent le plus ?",
    "4. Décrivez une réalisation professionnelle dont vous êtes fier dans ce domaine.",
    "5. Quelles sont les technologies ou outils que vous maîtrisez dans ce métier ?",
    "6. Comment abordez-vous l'apprentissage de nouvelles compétences techniques ?",
    "7. Quelle est votre vision de l'évolution de ce métier dans les années à venir ?",
  ],
  // ... talent et paradigme (3 questions chacun)
};
```

**Logique de sélection mise à jour :**
```typescript
// Si l'offre est externe, utiliser les questions externes (7 Métier, 3 Talent, 3 Paradigme)
if (jobOffer.status_offerts === 'externe') {
  return defaultMTPQuestionsExternes;
}

// Si l'offre est interne, utiliser les questions internes (3 Métier, 3 Talent, 3 Paradigme)
if (jobOffer.status_offerts === 'interne') {
  return defaultMTPQuestionsInternes;
}
```

### **3. `src/pages/recruiter/CreateJob.tsx`**
```typescript
if (formData.statusOfferts === 'externe') {
  // Offre externe : 7 questions Métier, 3 Talent, 3 Paradigme
  defaultQuestions = defaultMTPQuestionsExternes;
} else if (formData.statusOfferts === 'interne') {
  // Offre interne : 3 questions Métier, 3 Talent, 3 Paradigme
  defaultQuestions = defaultMTPQuestionsInternes;
}
```

### **4. `src/pages/recruiter/EditJob.tsx`**
```typescript
if (jobOffer.status_offerts === 'externe') {
  defaultQuestions = defaultMTPQuestionsExternes;
  console.log('[EditJob] Offre externe : 7 questions Métier, 3 Talent, 3 Paradigme');
} else {
  defaultQuestions = defaultMTPQuestionsInternes;
  console.log('[EditJob] Offre interne : 3 questions Métier, 3 Talent, 3 Paradigme');
}
```

---

## 🧪 Test de validation

### **1. Créer une offre INTERNE**
1. Aller dans "Créer une offre"
2. Sélectionner "Interne" dans le statut
3. **Résultat attendu :** "📢 Offre interne : 3 questions Métier, 3 Talent, 3 Paradigme"
4. **Vérifier :** L'onglet Métier affiche 3 questions par défaut

### **2. Créer une offre EXTERNE**
1. Aller dans "Créer une offre"
2. Sélectionner "Externe" dans le statut
3. **Résultat attendu :** "📢 Offre externe : 7 questions Métier, 3 Talent, 3 Paradigme"
4. **Vérifier :** L'onglet Métier affiche 7 questions par défaut

### **3. Modifier une offre existante**
1. Aller dans "Modifier une offre"
2. **Résultat attendu :** Les questions se chargent selon le statut de l'offre
3. **Vérifier :** Le nombre de questions correspond au statut

---

## 📊 Résultat final

| Type d'offre | Questions Métier | Questions Talent | Questions Paradigme |
|--------------|------------------|------------------|---------------------|
| **Interne** | 3 ✅ | 3 ✅ | 3 ✅ |
| **Externe** | 7 ✅ | 3 ✅ | 3 ✅ |

---

## 🎯 Impact

Cette correction garantit que :
- ✅ **Offres internes** : 3 questions Métier (plus concises)
- ✅ **Offres externes** : 7 questions Métier (plus approfondies)
- ✅ **Interface cohérente** : Messages clairs selon le statut
- ✅ **Expérience utilisateur** : Logique intuitive

---
**Date de correction :** ${new Date().toLocaleDateString('fr-FR')}
**Statut :** ✅ Nombre de questions MTP corrigé selon le statut
**Approche :** Logique inversée corrigée + nouvelles constantes
