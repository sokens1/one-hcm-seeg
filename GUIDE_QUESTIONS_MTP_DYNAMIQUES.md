# Guide : Questions MTP Dynamiques

## Vue d'ensemble

Ce guide explique comment utiliser les questions MTP (Métier, Talent, Paradigme) dynamiques dans les offres d'emploi.

## 1. Configuration de la base de données

### Exécuter les requêtes SQL

Ouvrez l'éditeur SQL de Supabase et exécutez les requêtes du fichier `sql_to_execute_in_supabase.sql` :

```sql
-- 1. Ajouter la colonne status_offerts
ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS status_offerts TEXT CHECK (status_offerts IN ('interne', 'externe'));

-- 2. Ajouter les colonnes pour les questions MTP
ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_metier TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS mtp_questions_talent TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS mtp_questions_paradigme TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Fixer le problème de génération automatique de l'ID
ALTER TABLE job_offers 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

### Vérification

Exécutez cette requête pour vérifier que tout est bien créé :

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

## 2. Utilisation dans le frontend

### Créer une offre d'emploi avec questions MTP personnalisées

1. Allez sur la page de création d'offre (`/recruiter/create-job`)
2. Remplissez les informations de base de l'offre
3. **PROCHAINE ÉTAPE** : Utilisez le nouveau composant MTPQuestionsEditor pour ajouter vos questions personnalisées
   - 7 questions Métier recommandées
   - 3 questions Talent recommandées
   - 3 questions Paradigme recommandées

### Modifier une offre existante

1. Allez sur la page de modification d'offre (`/recruiter/edit-job/:id`)
2. Les questions MTP existantes seront chargées automatiquement
3. Modifiez, ajoutez ou supprimez des questions selon vos besoins

## 3. Affichage dans le formulaire de candidature

Les questions MTP sont automatiquement récupérées depuis la base de données lors de la candidature :

- Si l'offre a des questions personnalisées → elles seront affichées
- Sinon → les questions par défaut (codées en dur) seront utilisées

## 4. Structure des données

### JobOffer Interface

```typescript
export interface JobOffer {
  // ... autres champs
  mtp_questions_metier?: string[] | null;
  mtp_questions_talent?: string[] | null;
  mtp_questions_paradigme?: string[] | null;
}
```

### Exemple de données

```json
{
  "mtp_questions_metier": [
    "Question 1 sur le métier",
    "Question 2 sur le métier",
    // ... jusqu'à 7 questions
  ],
  "mtp_questions_talent": [
    "Question 1 sur le talent",
    "Question 2 sur le talent",
    "Question 3 sur le talent"
  ],
  "mtp_questions_paradigme": [
    "Question 1 sur le paradigme",
    "Question 2 sur le paradigme",
    "Question 3 sur le paradigme"
  ]
}
```

## 5. Priorité des questions

L'ordre de priorité pour afficher les questions MTP est :

1. **Questions personnalisées** (définies dans la base de données pour l'offre spécifique)
2. **Questions par titre** (correspondance exacte du titre de l'offre avec les questions codées en dur)
3. **Questions par défaut** (questions génériques pour toutes les offres)

## 6. Composants créés/modifiés

### Nouveaux composants

- `src/components/forms/MTPQuestionsEditor.tsx` : Éditeur de questions MTP

### Fichiers modifiés

- `src/hooks/useJobOffers.tsx` : Ajout des champs MTP à l'interface JobOffer
- `src/hooks/useRecruiterDashboard.tsx` : Support des questions MTP dans les mutations
- `src/data/metierQuestions.ts` : Nouvelle fonction `getMTPQuestionsFromJobOffer()`

### Prochaines modifications nécessaires

- `src/pages/recruiter/CreateJob.tsx` : Intégrer MTPQuestionsEditor
- `src/pages/recruiter/EditJob.tsx` : Intégrer MTPQuestionsEditor
- `src/components/forms/ApplicationForm.tsx` : Utiliser `getMTPQuestionsFromJobOffer()` au lieu de `getMetierQuestionsForTitle()`

## 7. Migration progressive

Cette solution permet une migration progressive :

✅ Les offres existantes continueront à utiliser les questions codées en dur
✅ Les nouvelles offres peuvent utiliser des questions personnalisées
✅ Les offres existantes peuvent être mises à jour pour utiliser des questions personnalisées
✅ Aucune donnée n'est perdue pendant la migration

## 8. Avantages

- 🎯 **Flexibilité** : Chaque offre peut avoir ses propres questions
- 🔄 **Réutilisable** : Les questions peuvent être copiées d'une offre à l'autre
- 📊 **Traçabilité** : Les questions sont versionnées avec l'offre
- 🚀 **Performance** : Pas besoin de recompiler le code pour changer les questions
- 🌐 **Multilingue** : Facile d'ajouter des questions dans différentes langues

## 9. Prochaines étapes

1. ✅ Exécuter les requêtes SQL dans Supabase
2. 📝 Intégrer MTPQuestionsEditor dans CreateJob.tsx
3. 📝 Intégrer MTPQuestionsEditor dans EditJob.tsx
4. 🔄 Mettre à jour ApplicationForm.tsx pour utiliser la nouvelle fonction
5. 🧪 Tester la création/modification d'offres
6. 🧪 Tester le formulaire de candidature

---

**Date de création** : 9 octobre 2025
**Dernière mise à jour** : 9 octobre 2025

