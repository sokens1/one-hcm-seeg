# Correction de la Fonctionnalité "Programmer l'Entretien" - Protocole 1

## 🚨 Problème Identifié

La fonctionnalité "Programmer l'entretien" dans le protocole 1 ne fonctionnait pas et générait des erreurs 400 lors de la création de créneaux d'entretien.

### Erreurs Constatées
- Erreur 400 lors de la création d'un créneau d'entretien
- Message d'erreur : "Impossible de programmer l'entretien"
- Structure de base de données incohérente entre le code et la DB

## 🔧 Corrections Apportées

### 1. Migration de la Table `interview_slots`
**Fichier :** `supabase/migrations/20250131000003_fix_interview_slots_structure.sql`

- Recréation complète de la table avec la structure correcte
- Ajout des colonnes manquantes : `is_available`, `recruiter_id`, `candidate_id`, `notes`
- Correction des contraintes d'unicité
- Mise en place des politiques RLS appropriées
- Ajout des index pour optimiser les performances

### 2. Migration de la Table `applications`
**Fichier :** `supabase/migrations/20250131000004_fix_applications_table.sql`

- Ajout de la colonne `interview_date` pour stocker la date/heure de l'entretien
- Mise à jour de la contrainte CHECK du statut pour inclure `'entretien_programme'`
- Ajout des index nécessaires
- Correction des valeurs par défaut

### 3. Mise à Jour du Hook `useInterviewScheduling`
**Fichier :** `src/hooks/useInterviewScheduling.ts`

- Correction de la logique de création des créneaux
- Utilisation de `upsert` au lieu de `insert` pour éviter les conflits
- Ajout de la gestion des erreurs détaillée
- Intégration avec le système d'authentification
- Amélioration de la gestion des états

### 4. Mise à Jour des Types TypeScript
**Fichiers :** 
- `src/types/application.ts`
- `src/hooks/useApplications.tsx`

- Ajout du statut `'entretien_programme'`
- Ajout de la propriété `interview_date`
- Mise à jour des interfaces pour la cohérence

## 🚀 Déploiement

### 1. Appliquer les Migrations
```bash
# Dans votre projet Supabase
supabase db push
```

### 2. Vérifier la Structure
```bash
# Exécuter le script de test
node scripts/test-interview-scheduling.js
```

### 3. Redémarrer l'Application
```bash
npm run dev
```

## 🧪 Test de la Fonctionnalité

### 1. Connexion en tant que Recruteur
- Se connecter avec un compte recruteur
- Accéder au protocole 1 d'une candidature

### 2. Programmer un Entretien
- Cliquer sur "Programmer l'entretien"
- Sélectionner une date disponible
- Choisir un créneau horaire
- Confirmer la programmation

### 3. Vérifications
- L'entretien doit être programmé sans erreur
- Le statut de la candidature doit passer à "entretien_programme"
- La date d'entretien doit être enregistrée
- Le créneau doit être marqué comme indisponible

## 📊 Structure de la Base de Données

### Table `interview_slots`
```sql
CREATE TABLE public.interview_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    candidate_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(date, time)
);
```

### Table `applications` (colonnes ajoutées)
```sql
-- Colonnes ajoutées
interview_date TIMESTAMP WITH TIME ZONE,
status TEXT DEFAULT 'candidature' CHECK (status IN ('candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme'))
```

## 🔒 Sécurité (RLS)

### Politiques sur `interview_slots`
- **Recruteurs** : Accès complet (CRUD)
- **Candidats** : Lecture de leurs propres créneaux
- **Admins** : Accès complet

### Politiques sur `applications`
- Mise à jour du statut et de la date d'entretien
- Contrôle d'accès basé sur les rôles

## 🐛 Résolution des Erreurs

### Erreur 400
- **Cause** : Structure de table incorrecte
- **Solution** : Migration complète de la table

### "Impossible de programmer l'entretien"
- **Cause** : Gestion d'erreur insuffisante
- **Solution** : Amélioration de la gestion des erreurs et logging

### Conflits de Créneaux
- **Cause** : Contraintes d'unicité mal définies
- **Solution** : Utilisation d'`upsert` avec gestion des conflits

## 📝 Logs et Debug

Le hook `useInterviewScheduling` inclut maintenant des logs détaillés :
- `🔄 Programmation entretien pour:` - Début de la programmation
- `✅ Créneau créé avec succès` - Succès de la création
- `❌ Erreur lors de la programmation:` - Erreurs détaillées

## 🔄 Rollback (si nécessaire)

Si des problèmes surviennent, vous pouvez annuler les migrations :

```sql
-- Annuler la migration interview_slots
DROP TABLE IF EXISTS public.interview_slots CASCADE;

-- Annuler la migration applications
ALTER TABLE public.applications DROP COLUMN IF EXISTS interview_date;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
```

## ✅ Validation

Après le déploiement, vérifiez que :
1. ✅ La table `interview_slots` a la bonne structure
2. ✅ La table `applications` a les nouvelles colonnes
3. ✅ Les contraintes CHECK sont correctes
4. ✅ Les politiques RLS sont en place
5. ✅ La fonctionnalité fonctionne sans erreur 400
6. ✅ Les entretiens peuvent être programmés et annulés

## 🆘 Support

En cas de problème :
1. Vérifier les logs de la console
2. Exécuter le script de test
3. Vérifier la structure de la base de données
4. Contrôler les politiques RLS
