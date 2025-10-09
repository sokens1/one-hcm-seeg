# 🔧 Dépannage : Questions MTP non affichées

## 🎯 Problème
Les questions MTP sont en base de données mais ne s'affichent pas dans le formulaire d'édition des offres.

---

## ✅ Vérifications effectuées

1. ✅ Code de chargement dans `EditJob.tsx` - Corrigé avec vérification de type
2. ✅ Logs de debug ajoutés pour voir ce qui est chargé
3. ✅ Gestion des valeurs `null` améliorée

---

## 🔍 Étape 1 : Vérifier dans la console

1. Ouvrez la console du navigateur (F12)
2. Allez sur la page de modification d'une offre
3. Cherchez le log : `[EditJob DEBUG] MTP questions from DB:`
4. Vérifiez les valeurs affichées

**Exemple de ce que vous devriez voir :**
```javascript
[EditJob DEBUG] MTP questions from DB: {
  metier: ["Question 1", "Question 2", ...],
  talent: ["Question 1", "Question 2", "Question 3"],
  paradigme: ["Question 1", "Question 2", "Question 3"]
}
```

**Si vous voyez `null` ou `undefined` :**
- Les données ne sont pas en base → Passez à l'étape 2

**Si vous voyez les questions :**
- Les données sont chargées mais pas affichées → Passez à l'étape 3

---

## 🔍 Étape 2 : Vérifier dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Ouvrez l'éditeur SQL
3. Exécutez le fichier `verifier_questions_mtp_en_base.sql`

**Requête rapide :**
```sql
SELECT 
    id,
    title,
    status_offerts,
    array_length(mtp_questions_metier, 1) as nb_metier,
    array_length(mtp_questions_talent, 1) as nb_talent,
    array_length(mtp_questions_paradigme, 1) as nb_paradigme
FROM job_offers
ORDER BY created_at DESC
LIMIT 10;
```

**Résultats attendus :**
- `nb_metier`, `nb_talent`, `nb_paradigme` devraient afficher des nombres (3, 7, etc.)
- Si NULL → Les colonnes existent mais sont vides → Les offres ont été créées avant la mise à jour

---

## 🔍 Étape 3 : Offres créées avant la mise à jour

Si vos offres ont été créées AVANT l'ajout des colonnes MTP, elles n'ont pas de questions.

**Solution 1 : Modifier l'offre et ajouter des questions**
1. Allez sur la page de modification de l'offre
2. Les onglets MTP sont maintenant visibles
3. Ajoutez vos questions dans chaque onglet
4. Cliquez sur "Sauvegarder"
5. Les questions seront sauvegardées en base

**Solution 2 : Ajouter des questions par défaut via SQL**

Pour une offre spécifique :
```sql
UPDATE job_offers
SET 
    mtp_questions_metier = ARRAY[
        'Question Métier 1',
        'Question Métier 2',
        'Question Métier 3'
    ],
    mtp_questions_talent = ARRAY[
        'Question Talent 1',
        'Question Talent 2',
        'Question Talent 3'
    ],
    mtp_questions_paradigme = ARRAY[
        'Question Paradigme 1',
        'Question Paradigme 2',
        'Question Paradigme 3'
    ]
WHERE id = 'VOTRE_ID_OFFRE';
```

Pour TOUTES les offres externes sans questions :
```sql
UPDATE job_offers
SET 
    mtp_questions_metier = ARRAY[
        '1. Quelles sont vos principales compétences techniques dans ce domaine ?',
        '2. Comment votre expérience professionnelle vous prépare-t-elle à ce poste ?',
        '3. Quels défis techniques de ce métier vous motivent le plus ?'
    ],
    mtp_questions_talent = ARRAY[
        '1. Quelle est votre plus grande force en tant que professionnel ?',
        '2. Décrivez une situation où vous avez dû apprendre une nouvelle compétence rapidement.',
        '3. Comment gérez-vous la pression et les délais serrés ?'
    ],
    mtp_questions_paradigme = ARRAY[
        '1. Qu''est-ce qui vous motive le plus dans votre carrière ?',
        '2. Comment vous tenez-vous au courant des évolutions de votre secteur ?',
        '3. Quelle est votre vision du travail en équipe ?'
    ]
WHERE status_offerts = 'externe'
AND (mtp_questions_metier IS NULL OR array_length(mtp_questions_metier, 1) IS NULL);
```

---

## 🔍 Étape 4 : Rafraîchir le cache

Si les données sont en base mais ne s'affichent toujours pas :

1. **Rafraîchir la page** (Ctrl+R ou F5)
2. **Vider le cache** (Ctrl+Shift+Delete)
3. **Redémarrer le serveur** :
   ```bash
   # Arrêter le serveur (Ctrl+C)
   npm run dev
   ```

---

## 🔍 Étape 5 : Vérifier les colonnes Supabase

Si vraiment rien ne fonctionne, vérifiez que les colonnes existent :

```sql
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'job_offers'
AND column_name IN ('mtp_questions_metier', 'mtp_questions_talent', 'mtp_questions_paradigme')
ORDER BY column_name;
```

**Résultat attendu :**
```
mtp_questions_metier   | ARRAY | {}::text[] | YES
mtp_questions_paradigme | ARRAY | {}::text[] | YES
mtp_questions_talent    | ARRAY | {}::text[] | YES
```

**Si les colonnes n'existent pas :**
- Exécutez à nouveau le fichier `sql_to_execute_in_supabase.sql`

---

## 🎯 Checklist rapide

- [ ] Ouvrir la console (F12) et chercher les logs `[EditJob DEBUG]`
- [ ] Exécuter `verifier_questions_mtp_en_base.sql` dans Supabase
- [ ] Vérifier que les colonnes MTP existent
- [ ] Rafraîchir la page / Vider le cache
- [ ] Si les offres sont anciennes, ajouter des questions via l'interface ou SQL
- [ ] Tester avec une NOUVELLE offre créée après la mise à jour

---

## 📞 Si le problème persiste

1. Envoyez-moi :
   - La console complète (F12)
   - Le résultat de la requête SQL de vérification
   - Une capture d'écran du formulaire d'édition

2. Logs importants à chercher :
   - `[EditJob DEBUG] MTP questions from DB:`
   - Erreurs en rouge dans la console

---

## ✅ Résolution attendue

Après ces vérifications, vous devriez :
1. ✅ Voir les questions MTP dans les onglets lors de la modification
2. ✅ Pouvoir ajouter/modifier/supprimer des questions
3. ✅ Les modifications sont sauvegardées en base
4. ✅ Les candidats voient les bonnes questions lors de la candidature

---

**Date** : 9 octobre 2025, 16h00

