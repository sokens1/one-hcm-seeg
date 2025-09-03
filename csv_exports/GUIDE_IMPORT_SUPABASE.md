# 🚀 Guide d'Import des Fichiers CSV dans Supabase

## ✅ Problème Résolu

Les fichiers CSV ont été corrigés pour résoudre l'erreur d'import que vous rencontriez :

### 🔧 Corrections Apportées

1. **Séparateurs** : Remplacement des tabulations par des virgules
2. **Valeurs NULL** : Remplacement de `\N` par des cellules vides
3. **Format standard** : Conformité avec le format CSV standard

## 📋 Instructions d'Import dans Supabase

### 1. Ordre d'Import des Tables

**IMPORTANT** : Respectez cet ordre pour éviter les erreurs de clés étrangères :

1. **public.users** ← Commencez par celui-ci
2. **public.seeg_agents**
3. **public.job_offers**
4. **public.candidate_profiles**
5. **public.applications**
6. **public.application_drafts**
7. **public.application_documents**
8. **public.application_history**
9. **public.documents**
10. **public.interview_slots**
11. **public.notifications**
12. **public.protocol1_evaluations**
13. **public.protocol2_evaluations**

### 2. Étapes d'Import

Pour chaque table :

1. **Aller dans l'éditeur SQL de Supabase**
2. **Créer la table** avec la structure appropriée
3. **Aller dans l'onglet "Table Editor"**
4. **Cliquer sur "Import data from CSV"**
5. **Sélectionner le fichier CSV correspondant**
6. **Vérifier la prévisualisation** (doit maintenant montrer le bon nombre de colonnes)
7. **Confirmer l'import**

### 3. Structure de la Table Users (Exemple)

```sql
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    matricule text,
    role text NOT NULL,
    first_name text,
    last_name text,
    phone text,
    date_of_birth date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    sexe text
);
```

### 4. Vérifications Import

Après l'import, vérifiez que :

- ✅ Le nombre de lignes correspond (206 pour users)
- ✅ Les colonnes sont correctement mappées
- ✅ Les types de données sont corrects
- ✅ Les contraintes sont respectées

### 5. Gestion des Erreurs

Si vous rencontrez encore des erreurs :

1. **Vérifiez l'encodage** : UTF-8
2. **Vérifiez les guillemets** : Échappez les guillemets dans les données
3. **Vérifiez les dates** : Format YYYY-MM-DD HH:mm:ss
4. **Vérifiez les UUIDs** : Format standard UUID

### 6. Données Spéciales

- **Dates** : Format `2025-08-24 23:15:15.793555+00`
- **UUIDs** : Format `ff8bda17-9bbe-46b6-8e45-33218393f862`
- **JSON** : Données JSON dans les colonnes `mtp_answers`, `form_data`, etc.

## 🎯 Résultat Attendu

Après l'import correct, vous devriez voir :

- **206 lignes** dans la table users
- **11 colonnes** correctement reconnues
- **Aucune erreur** dans la prévisualisation
- **Import réussi** sans problèmes

## 📞 Support

Si vous rencontrez encore des problèmes, vérifiez :

1. Le fichier CSV est bien dans le bon format
2. L'ordre d'import des tables est respecté
3. Les contraintes de clés étrangères sont satisfaites
4. Les types de données correspondent à la structure de la table

---

**Date de correction** : 3 septembre 2025  
**Fichiers corrigés** : Tous les fichiers CSV du dossier `csv_exports/`
