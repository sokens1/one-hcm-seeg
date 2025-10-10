# 🔄 Migration des Questions MTP : Code → Base de données

## 🎯 Objectif
Permettre aux recruteurs de **voir et modifier les questions MTP** qui étaient codées en dur, et les **sauvegarder en base de données**.

---

## ✅ Modifications effectuées

### 1. `EditJob.tsx` - Édition d'offres existantes

**Comportement :**
1. **Détecte si les questions MTP sont vides** en base de données (Array(0))
2. **Si vides** : Charge automatiquement les questions depuis le code
   - Offre externe → 3 questions par catégorie (`defaultMTPQuestionsExternes`)
   - Offre interne → Questions basées sur le titre (`getMetierQuestionsForTitle()`)
3. **Si présentes** : Charge directement depuis la base de données
4. **Affiche les questions** dans les onglets M, T, P
5. **Quand vous sauvegardez** → Les questions sont écrites en base

**Logs ajoutés :**
```javascript
[EditJob] Questions vides en base, chargement depuis le code...
[EditJob] Offre externe : 3 questions par catégorie
[EditJob] Questions chargées: {metier: 3, talent: 3, paradigme: 3}
```

### 2. `CreateJob.tsx` - Création de nouvelles offres

**Comportement :**
1. **useEffect** déclenché quand vous :
   - Sélectionnez le statut (Interne/Externe)
   - Entrez un titre d'offre
2. **Pré-remplit automatiquement** les questions selon :
   - Externe → 3 questions par catégorie
   - Interne + Titre → Questions spécifiques au poste
3. **Vous pouvez modifier** les questions avant de publier
4. **À la publication** → Sauvegarde en base de données

**Logs ajoutés :**
```javascript
[CreateJob] Chargement questions externes (3 par catégorie)
[CreateJob] Questions pré-remplies: {metier: 3, talent: 3, paradigme: 3}
```

---

## 🚀 Comment utiliser

### Pour les offres EXISTANTES (Édition)

1. **Ouvrez une offre existante** en mode édition
2. **Descendez jusqu'à "Questions MTP"**
3. **Vous verrez les 3 onglets** (M, T, P) déjà remplis avec :
   - Les questions de la base SI elles existent
   - Les questions du code SI elles sont vides en base
4. **Modifiez les questions** comme vous voulez
5. **Cliquez sur "Sauvegarder"**
6. **✅ Les questions sont maintenant en base** et ne seront plus rechargées depuis le code

### Pour les NOUVELLES offres (Création)

1. **Créez une nouvelle offre**
2. **Sélectionnez le statut** (Interne/Externe)
3. **Entrez le titre** du poste
4. **Les questions se chargent automatiquement** dans les onglets MTP
5. **Modifiez-les** si nécessaire
6. **Publiez l'offre**
7. **✅ Les questions sont sauvegardées en base**

---

## 📊 Priorité de chargement des questions

### Pour EditJob (Modification)

```
1. Questions en base de données (si présentes)
   ↓
2. Questions du code selon statut/titre (si base vide)
   - Externe → defaultMTPQuestionsExternes (3/3/3)
   - Interne → getMetierQuestionsForTitle(titre) (7/3/3 ou selon titre)
```

### Pour CreateJob (Création)

```
1. Questions du code selon statut/titre
   - Externe → defaultMTPQuestionsExternes (3/3/3)
   - Interne → getMetierQuestionsForTitle(titre) (7/3/3 ou selon titre)
```

---

## 🧪 Test complet

### Test 1 : Modifier une offre existante

1. **Ouvrez la console** (F12)
2. **Modifiez une offre** qui n'a pas de questions en base
3. **Cherchez les logs** :
   ```
   [EditJob DEBUG] MTP questions from DB: {metier: Array(0), ...}
   [EditJob] Questions vides en base, chargement depuis le code...
   [EditJob] Questions chargées: {metier: 7, talent: 3, paradigme: 3}
   ```
4. **Vérifiez les onglets** : Ils sont remplis avec les questions
5. **Modifiez une question** (ajoutez "(MODIFIÉ)" à la fin)
6. **Sauvegardez**
7. **Rechargez la page**
8. **Vérifiez** : La modification "(MODIFIÉ)" est toujours là
9. **Log attendu** :
   ```
   [EditJob] Questions chargées depuis la base de données
   ```

### Test 2 : Créer une nouvelle offre externe

1. **Créez une nouvelle offre**
2. **Titre** : "Test Externe"
3. **Statut** : "Externe"
4. **Console** : `[CreateJob] Chargement questions externes (3 par catégorie)`
5. **Descendez** aux Questions MTP
6. **Vérifiez** : 3 questions dans chaque onglet
7. **Modifiez une question**
8. **Publiez**
9. **Modifiez l'offre** pour vérifier que les questions modifiées sont sauvegardées

### Test 3 : Créer une nouvelle offre interne

1. **Créez une nouvelle offre**
2. **Titre** : "Directeur Audit & Contrôle interne" (ou un autre titre de la liste)
3. **Statut** : "Interne"
4. **Console** : `[CreateJob] Chargement questions pour: Directeur Audit & Contrôle interne`
5. **Vérifiez** : Les questions spécifiques à ce poste sont chargées
6. **Publiez**

---

## 🔍 Vérification en base de données

Après avoir modifié et sauvegardé des offres :

```sql
SELECT 
    title,
    status_offerts,
    array_length(mtp_questions_metier, 1) as nb_metier,
    array_length(mtp_questions_talent, 1) as nb_talent,
    array_length(mtp_questions_paradigme, 1) as nb_paradigme,
    mtp_questions_metier[1] as premiere_question
FROM job_offers
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

**Résultat attendu :**
- `nb_metier`, `nb_talent`, `nb_paradigme` ne sont plus NULL ou 0
- `premiere_question` affiche la première question que vous avez saisie

---

## ✅ Avantages de cette approche

1. **📦 Migration automatique** : Pas besoin de script SQL pour remplir toutes les offres
2. **✏️ Contrôle total** : Vous modifiez chaque offre manuellement et vérifiez les questions
3. **🎯 Flexible** : Vous pouvez ajuster les questions poste par poste
4. **🔄 Progressive** : Les offres sont migrées au fur et à mesure de vos modifications
5. **💾 Sauvegarde** : Une fois modifiées, les questions sont en base définitivement
6. **🔍 Traçable** : Les logs permettent de suivre ce qui est chargé

---

## 📊 Statistiques de migration

Pour voir combien d'offres ont été migrées :

```sql
-- Offres avec questions MTP en base
SELECT 
    'Migrées' as statut,
    COUNT(*) as nombre
FROM job_offers
WHERE array_length(mtp_questions_metier, 1) > 0;

-- Offres sans questions MTP (à migrer)
SELECT 
    'À migrer' as statut,
    COUNT(*) as nombre
FROM job_offers
WHERE array_length(mtp_questions_metier, 1) IS NULL
   OR array_length(mtp_questions_metier, 1) = 0;
```

---

## 🎉 Résultat final

**Avant :**
- ❌ Questions codées en dur, impossibles à modifier sans redéployer
- ❌ Même questions pour tous les postes similaires
- ❌ Pas de personnalisation possible

**Maintenant :**
- ✅ Questions chargées automatiquement depuis le code
- ✅ Modifiables dans l'interface recruteur
- ✅ Sauvegardées en base de données
- ✅ Personnalisables poste par poste
- ✅ Migration progressive et contrôlée

---

**Date de migration** : 9 octobre 2025, 16h15
**Statut** : ✅ Opérationnel - Prêt pour la migration progressive

