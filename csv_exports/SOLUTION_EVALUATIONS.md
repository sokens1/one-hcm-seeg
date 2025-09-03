# SOLUTION - CORRECTION DES FICHIERS D'ÉVALUATIONS

## Problèmes identifiés et corrigés

### 1. public.protocol2_evaluations.csv
- **Problème** : Lignes vides dans le fichier
- **Solution** : Suppression des 3 lignes vides
- **Résultat** : Fichier nettoyé avec 2 lignes (en-tête + 1 ligne de données)
- **Statut** : ✅ Corrigé

### 2. public.protocol1_evaluations.csv
- **Problème** : Ligne 11 avec 48 champs au lieu de 46 attendus
- **Cause** : Virgules non échappées dans le champ `lettre_motivation_comments`
- **Contenu problématique** : "Inadéquation diplôme-profil. Pas de lien entre le poste, le diplôme, et l'expérience."
- **Solution** : Échappement correct des champs CSV avec guillemets
- **Résultat** : Fichier nettoyé avec 28 lignes et 0 problème de structure
- **Statut** : ✅ Corrigé

## Fichiers générés

1. `csv_exports/public.protocol2_evaluations_clean.csv` - Version nettoyée
2. `csv_exports/public.protocol1_evaluations_clean.csv` - Version nettoyée

## Vérifications effectuées

- ✅ Structure des en-têtes correcte
- ✅ Nombre de champs cohérent sur toutes les lignes
- ✅ Échappement correct des caractères spéciaux
- ✅ Suppression des lignes vides

## Recommandations pour l'import

1. Utiliser les fichiers `*_clean.csv` pour l'import dans Supabase
2. Vérifier que l'ordre de création des tables est respecté (voir `table_creation_order.txt`)
3. Les tables d'évaluations doivent être créées après les tables `applications` et `users`

## Ordre de création des tables d'évaluations

12. public.protocol1_evaluations (référence applications)
13. public.protocol2_evaluations (référence applications)

## Notes techniques

- Les fichiers d'évaluations contiennent des données complexes avec des commentaires
- L'échappement CSV est crucial pour éviter les erreurs "Too many fields"
- Les champs contenant des virgules doivent être entourés de guillemets
- Les guillemets dans les données doivent être échappés en les doublant
