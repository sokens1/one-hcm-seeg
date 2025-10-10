# 🔧 Correction : Texte corrompu dans les PDF

## 🎯 Problème identifié
Les PDF des candidatures affichaient du texte corrompu avec des caractères `&` qui s'intercalaient entre chaque lettre :
```
&R&e&n&s&e&i&g&n&é
```

## ✅ Solution implémentée

### 1. Fonction de nettoyage créée
Ajout d'une fonction `cleanText()` dans :
- `src/utils/exportPdfUtils.ts`
- `src/utils/exportSynthesisPdf.ts`

### 2. Logique de nettoyage
```javascript
const cleanText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text
    // Nettoyer les entités HTML standard D'ABORD
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, '')
    // PUIS nettoyer les caractères & qui s'intercalent
    .replace(/&([a-zA-Zàâäéèêëïîôöùûüÿçñ])/g, '$1')
    .trim();
};
```

### 3. Champs nettoyés
- ✅ Réponses MTP (Métier, Talent, Paradigme)
- ✅ Informations personnelles (nom, email, poste actuel, sexe)
- ✅ Références de recommandation
- ✅ Synthèses d'évaluation

### 4. Tests validés
```javascript
// Test 1: Texte corrompu
"&R&e&n&s&e&i&g&n&é" → "Renseigné" ✅

// Test 2: Texte normal
"Selon vous, l'accès universel à l'éducation est-il important ?" → Inchangé ✅

// Test 3: Entités HTML
"&lt;p&gt;Mon &quot;texte&quot; avec &amp; des entités&lt;/p&gt;" → "<p>Mon \"texte\" avec & des entités</p>" ✅

// Test 4: Valeur null
null → "" ✅
```

## 🚀 Résultat
- ✅ Les PDF des candidatures affichent maintenant du texte propre
- ✅ Les PDF de synthèse d'évaluation sont également corrigés
- ✅ Aucune régression sur les autres fonctionnalités

## 📝 Fichiers modifiés
- `src/utils/exportPdfUtils.ts`
- `src/utils/exportSynthesisPdf.ts`

---
**Date de correction :** ${new Date().toLocaleDateString('fr-FR')}
**Statut :** ✅ Résolu
