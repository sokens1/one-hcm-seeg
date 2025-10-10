# 📋 Étapes à suivre pour activer les Questions MTP Dynamiques

## ✅ Fait jusqu'à présent

1. ✅ Création du fichier SQL : `sql_to_execute_in_supabase.sql`
2. ✅ Mise à jour de l'interface `JobOffer` avec les champs MTP
3. ✅ Mise à jour du hook `useRecruiterDashboard` pour supporter les questions MTP
4. ✅ Mise à jour du hook `useJobOffers` pour récupérer les questions MTP
5. ✅ Création du composant `MTPQuestionsEditor` pour éditer les questions
6. ✅ Ajout de la fonction `getMTPQuestionsFromJobOffer()` dans `metierQuestions.ts`
7. ✅ Ajout du champ `status_offerts` (Interne/Externe) dans EditJob et CreateJob

## 🔴 ÉTAPE 1 : Exécuter les requêtes SQL (OBLIGATOIRE)

### Dans l'interface Supabase :

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet (la bonne base de données de production)
3. Cliquez sur "SQL Editor" dans le menu de gauche
4. Créez une nouvelle requête
5. Copiez et collez **TOUT** le contenu du fichier `sql_to_execute_in_supabase.sql`
6. Cliquez sur "Run" pour exécuter

### Vérification

Après l'exécution, copiez et exécutez cette requête de vérification :

```sql
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'job_offers'
AND column_name IN ('status_offerts', 'mtp_questions_metier', 'mtp_questions_talent', 'mtp_questions_paradigme', 'id')
ORDER BY column_name;
```

Vous devriez voir 5 lignes avec les colonnes :
- `id` : uuid, DEFAULT gen_random_uuid(), NOT NULL
- `mtp_questions_metier` : ARRAY, DEFAULT '{}'::text[], YES
- `mtp_questions_paradigme` : ARRAY, DEFAULT '{}'::text[], YES
- `mtp_questions_talent` : ARRAY, DEFAULT '{}'::text[], YES
- `status_offerts` : text, NULL, YES

## 🟡 ÉTAPE 2 : Intégration du composant MTPQuestionsEditor (À FAIRE)

Vous devez intégrer le composant `MTPQuestionsEditor` dans les formulaires de création et modification d'offres.

### 2.1 Modifier CreateJob.tsx

Je vous enverrai les modifications dans un instant après votre confirmation que l'étape 1 est terminée.

### 2.2 Modifier EditJob.tsx

Je vous enverrai les modifications dans un instant après votre confirmation que l'étape 1 est terminée.

## 🟡 ÉTAPE 3 : Mettre à jour ApplicationForm.tsx (À FAIRE)

Modifier le formulaire de candidature pour utiliser la nouvelle fonction `getMTPQuestionsFromJobOffer()` au lieu de `getMetierQuestionsForTitle()`.

## 📊 Résultat attendu

Après avoir complété toutes les étapes :

1. ✅ Le champ "Statut de l'offre" (Interne/Externe) fonctionnera correctement
2. ✅ Les recruteurs pourront définir des questions MTP personnalisées pour chaque offre
3. ✅ Les questions MTP seront sauvegardées en base de données
4. ✅ Le formulaire de candidature affichera les questions personnalisées
5. ✅ Les offres existantes continueront à utiliser les questions par défaut (codées en dur)
6. ✅ Aucune interruption de service pendant la migration

## ⚠️ IMPORTANT

**NE PAS** intégrer les composants dans CreateJob.tsx et EditJob.tsx avant d'avoir :
1. Exécuté les requêtes SQL dans Supabase
2. Vérifié que les colonnes existent bien
3. Testé que la création d'offres fonctionne sans erreur

## 🆘 En cas de problème

### Erreur : "column does not exist"

➡️ Vous n'avez pas exécuté les requêtes SQL ou vous êtes sur la mauvaise base de données

### Erreur : "null value in column id violates not-null constraint"

➡️ Exécutez cette requête pour fixer :

```sql
ALTER TABLE job_offers 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

### Les questions MTP ne s'affichent pas

➡️ Vérifiez que vous avez bien mis à jour `ApplicationForm.tsx` pour utiliser `getMTPQuestionsFromJobOffer()`

---

**👉 PROCHAINE ACTION IMMÉDIATE :**

**Exécutez les requêtes SQL du fichier `sql_to_execute_in_supabase.sql` dans l'éditeur SQL de Supabase, puis confirmez-moi que c'est fait pour que je continue avec les prochaines étapes !**

