# 🔧 Correction : Erreur NOT NULL sur reference_full_name

## 🎯 Problème identifié
```
Erreur lors de l'envoi: null value in column "reference_full_name" of relation "applications" violates not-null constraint
```

## 🔍 Cause du problème
1. **Contraintes NOT NULL** : Les colonnes de référence dans la table `applications` avaient des contraintes NOT NULL
2. **Champs optionnels** : Le formulaire de candidature ne remplit pas toujours ces champs
3. **Chaînes vides** : Le code envoyait des chaînes vides `""` au lieu de `null`

## ✅ Solution implémentée

### 1. Modification du code frontend
**Fichier :** `src/components/forms/ApplicationForm.tsx`

```typescript
// AVANT
reference_full_name: formData.referenceFullName,
reference_email: formData.referenceEmail,
reference_contact: formData.referenceContact,
reference_company: formData.referenceCompany,

// APRÈS
reference_full_name: formData.referenceFullName || null,
reference_email: formData.referenceEmail || null,
reference_contact: formData.referenceContact || null,
reference_company: formData.referenceCompany || null,
```

### 2. Script SQL de correction
**Fichier :** `CORRECTION_FINALE_REFERENCES_NOT_NULL.sql`

```sql
-- Supprimer les contraintes NOT NULL
ALTER TABLE applications ALTER COLUMN reference_full_name DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN reference_email DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN reference_contact DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN reference_company DROP NOT NULL;

-- Définir des valeurs par défaut NULL
ALTER TABLE applications ALTER COLUMN reference_full_name SET DEFAULT NULL;
ALTER TABLE applications ALTER COLUMN reference_email SET DEFAULT NULL;
ALTER TABLE applications ALTER COLUMN reference_contact SET DEFAULT NULL;
ALTER TABLE applications ALTER COLUMN reference_company SET DEFAULT NULL;

-- Nettoyer les chaînes vides existantes
UPDATE applications SET reference_full_name = NULL WHERE reference_full_name = '';
UPDATE applications SET reference_email = NULL WHERE reference_email = '';
UPDATE applications SET reference_contact = NULL WHERE reference_contact = '';
UPDATE applications SET reference_company = NULL WHERE reference_company = '';
```

### 3. Validation du hook useApplications
Le hook `useApplications` gère déjà correctement les valeurs null avec des conditions `if` :
```typescript
if (applicationData.reference_full_name) payload.reference_full_name = applicationData.reference_full_name;
if (applicationData.reference_email) payload.reference_email = applicationData.reference_email;
if (applicationData.reference_contact) payload.reference_contact = applicationData.reference_contact;
if (applicationData.reference_company) payload.reference_company = applicationData.reference_company;
```

## 🚀 Étapes de déploiement

### Étape 1 : Exécuter le script SQL
```bash
# Dans Supabase SQL Editor
# Copier-coller le contenu de CORRECTION_FINALE_REFERENCES_NOT_NULL.sql
```

### Étape 2 : Vérifier la correction
```bash
# Dans Supabase SQL Editor
# Copier-coller le contenu de test_reference_fields.sql
```

### Étape 3 : Tester l'application
1. Créer une nouvelle candidature sans remplir les références
2. Créer une candidature avec des références partielles
3. Vérifier que les deux fonctionnent sans erreur

## 📊 Résultat attendu

| Type de candidature | Statut | Références |
|-------------------|--------|------------|
| **Externe** | ✅ Fonctionne | Optionnelles |
| **Interne** | ✅ Fonctionne | Optionnelles |
| **Sans références** | ✅ Fonctionne | NULL |
| **Avec références partielles** | ✅ Fonctionne | Champs remplis + NULL |

## 📝 Fichiers modifiés
- ✅ `src/components/forms/ApplicationForm.tsx`
- ✅ `CORRECTION_FINALE_REFERENCES_NOT_NULL.sql` (nouveau)
- ✅ `test_reference_fields.sql` (nouveau)
- ✅ `CORRECTION_REFERENCE_NOT_NULL.md` (nouveau)

---
**Date de correction :** ${new Date().toLocaleDateString('fr-FR')}
**Statut :** ✅ Code corrigé, script SQL prêt
**Prochaine étape :** Exécuter le script SQL dans Supabase
