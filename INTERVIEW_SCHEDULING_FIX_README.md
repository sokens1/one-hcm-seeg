# 🔧 Fix Fonctionnalité "Programmer l'Entretien" - Protocol 1

## 🚨 **Problème Initial**
- Bouton "Programmer l'entretien" non fonctionnel
- Erreur 400 lors de la programmation
- Message d'erreur : "impossible de programmer l'entretien"

## ✅ **Solutions Appliquées**

### 1. **Migration Base de Données** ✅
- Migration ultra-sécurisée appliquée via Supabase SQL Editor
- Ajout de la colonne `interview_date` à la table `applications`
- Mise à jour du statut CHECK pour inclure `entretien_programme`

### 2. **Correction du Hook useInterviewScheduling** ✅
- Adaptation à la structure existante de la table `interview_slots`
- Remplacement de `upsert` par logique `insert/update` manuelle
- Ajout de la récupération des détails candidat/job
- Gestion des champs obligatoires (`candidate_name`, `job_title`, `status`)

### 3. **Mise à Jour des Types TypeScript** ✅
- Ajout du champ `interview_date` dans les interfaces
- Ajout du statut `entretien_programme`

## 🔧 **Dernières Modifications**

### Hook useInterviewScheduling.ts
```typescript
// Récupération des détails candidat/job
const { data: applicationDetails, error: appDetailsError } = await supabase
  .from('applications')
  .select(`
    candidate_id,
    job_offer_id,
    users!applications_candidate_id_fkey(first_name, last_name),
    job_offers!applications_job_offer_id_fkey(title)
  `)
  .eq('id', applicationId)
  .single();

// Logique insert/update manuelle au lieu d'upsert
if (existingSlot) {
  // Mise à jour du créneau existant
  const { error } = await supabase
    .from('interview_slots')
    .update({...})
    .eq('id', existingSlot.id);
} else {
  // Création d'un nouveau créneau
  const { error } = await supabase
    .from('interview_slots')
    .insert({...});
}
```

## 🚀 **Étapes de Test**

### 1. Créer des Créneaux de Test
Exécuter dans Supabase SQL Editor :
```sql
INSERT INTO public.interview_slots (
  date, time, application_id, candidate_name, job_title, 
  status, is_available, recruiter_id, candidate_id, notes, 
  created_at, updated_at
) VALUES 
  ('2024-02-15', '09:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-15', '10:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-15', '11:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-16', '09:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-16', '10:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-16', '11:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-17', '09:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-17', '10:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW()),
  ('2024-02-17', '11:00:00', NULL, NULL, NULL, 'available', true, NULL, NULL, 'Créneau disponible', NOW(), NOW())
ON CONFLICT (date, time) DO NOTHING;
```

### 2. Tester la Fonctionnalité
1. Recharger l'application
2. Se connecter en tant que recruteur
3. Accéder au protocole 1 d'une candidature
4. Cliquer sur "Programmer l'entretien"
5. Sélectionner une date (15, 16 ou 17 février)
6. Choisir un créneau horaire (9h, 10h ou 11h)
7. Confirmer

## 📊 **Logs Attendus**
```
🔄 Programmation entretien pour: { date, time, applicationId, userId }
📋 Détails récupérés: { candidateName, jobTitle, candidateId }
✅ Créneau créé avec succès
```

## 🔍 **Diagnostic en Cas d'Échec**
Si l'erreur 400 persiste, vérifier :
1. Les logs détaillés dans la console
2. La structure exacte de la table `interview_slots`
3. Les permissions RLS sur la table
4. Les contraintes de la base de données

## 📝 **Fichiers Modifiés**
- `src/hooks/useInterviewScheduling.ts` - Logique principale
- `src/types/application.ts` - Types TypeScript
- `src/hooks/useApplications.tsx` - Interface Application
- `supabase/migrations/20250131000005_combined_interview_fix.sql` - Migration DB

## 🎯 **Statut Actuel**
- ✅ Migration appliquée
- ✅ Hook corrigé
- ✅ Types mis à jour
- 🔄 En attente de test final
