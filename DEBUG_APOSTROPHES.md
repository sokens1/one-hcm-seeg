# 🔍 DEBUG APOSTROPHES CORROMPUES

## Étape 1 : Identifier le caractère exact

Dans le PDF, vous voyez probablement un de ces caractères :
- `'` (U+2018) : Apostrophe typographique ouvrante
- `'` (U+2019) : Apostrophe typographique fermante  
- `´` (U+00B4) : Accent aigu
- `` ` `` (U+0060) : Accent grave

## Étape 2 : Vérifier la source

### **A. Vérifier dans la base de données**
```sql
-- Dans Supabase SQL Editor
SELECT 
  title,
  mtp_questions_metier[1] as question
FROM job_offers
WHERE title = 'Directeur Audit & Contrôle interne';
```

**Regardez la question et notez quel caractère vous voyez.**

### **B. Solutions selon la source**

#### **Si le problème vient de la BASE DE DONNÉES :**
✅ Exécutez : `FIX_APOSTROPHES_SIMPLE.sql`

#### **Si le problème vient du CODE :**
✅ Les fichiers suivants ont déjà été corrigés :
- `src/utils/generateApplicationPdf.ts`
- `src/utils/exportPdfUtils.ts`
- `src/utils/exportSynthesisPdf.ts`

#### **Si le problème persiste :**
Le problème pourrait venir de **jsPDF** qui ne supporte pas certains caractères.

---

## Étape 3 : Test rapide

1. **Créez une candidature de test** avec cette réponse :
   ```
   J'ai géré l'équipe avec succès
   ```

2. **Exportez le PDF**

3. **Vérifiez dans le PDF** :
   - Si vous voyez : `J'ai géré` → ✅ Corrigé
   - Si vous voyez : `J'ai géré` ou autre → ❌ Encore un problème

---

## Solution ultime : Forcer l'encodage dans jsPDF

Si le problème persiste, on peut forcer jsPDF à utiliser une police qui supporte mieux les caractères spéciaux.

**Dites-moi exactement quel caractère vous voyez dans le PDF et je vous donnerai la solution précise ! 🎯**
