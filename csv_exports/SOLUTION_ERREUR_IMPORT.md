# 🔧 Solution à l'Erreur d'Import Supabase

## ❌ Erreur Rencontrée

```
Table users has been created but we ran into an error while inserting rows: 
column " email" of relation "users" does not exist
```

## 🔍 Cause du Problème

L'erreur était causée par des **espaces dans les en-têtes** du fichier CSV :
- ❌ `" email"` (avec espace)
- ✅ `"email"` (sans espace)

## ✅ Solution Appliquée

### 1. Nettoyage des En-têtes
- Suppression des espaces avant et après les noms de colonnes
- Suppression des espaces autour des virgules
- Formatage standard des en-têtes CSV

### 2. Résultat
**Avant** : `id, email, matricule, role, first_name, last_name, phone, date_of_birth, created_at, updated_at, sexe`

**Après** : `id,email,matricule,role,first_name,last_name,phone,date_of_birth,created_at,updated_at,sexe`

## 🚀 Instructions d'Import Corrigées

### 1. Créer la Table Users
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

### 2. Importer le Fichier CSV
1. **Télécharger** le fichier `public.users.csv` corrigé
2. **Aller** dans l'onglet "Table Editor" de Supabase
3. **Cliquer** sur "Import data from CSV"
4. **Sélectionner** le fichier `public.users.csv`
5. **Vérifier** la prévisualisation (11 colonnes)
6. **Confirmer** l'import

### 3. Vérifications
- ✅ **206 lignes** importées
- ✅ **11 colonnes** reconnues
- ✅ **Aucune erreur** de colonne manquante
- ✅ **Import réussi**

## 📋 Ordre d'Import Complet

1. **public.users** ← Commencez par celui-ci (maintenant corrigé)
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

## 🎯 Résultat Attendu

Après l'import du fichier `public.users.csv` corrigé :

- ✅ **Table créée** avec succès
- ✅ **206 lignes** insérées sans erreur
- ✅ **Toutes les colonnes** correctement mappées
- ✅ **Prêt** pour l'import des tables suivantes

## 📞 Si Problème Persiste

1. **Vérifiez** que vous utilisez le fichier `public.users.csv` corrigé
2. **Vérifiez** que la table a été créée avec la structure exacte ci-dessus
3. **Vérifiez** que les noms de colonnes correspondent exactement
4. **Vérifiez** l'encodage UTF-8 du fichier

---

**Date de correction** : 3 septembre 2025  
**Fichier corrigé** : `csv_exports/public.users.csv`  
**Statut** : ✅ Prêt pour l'import
