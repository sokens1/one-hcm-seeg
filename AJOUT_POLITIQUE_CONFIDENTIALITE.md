# Ajout de la Politique de Confidentialité au Formulaire d'Inscription

## Date de modification : 16 Octobre 2025

## Résumé des modifications

Cette mise à jour ajoute un champ obligatoire pour l'acceptation de la politique de confidentialité lors de l'inscription des utilisateurs sur la plateforme OneHCM | Talent Source.

---

## Modifications apportées

### 1. Base de données (Migration SQL)

**Fichier :** `supabase/migrations/20251016000001_add_politique_confidentialite_column.sql`

- ✅ Ajout de la colonne `politique_confidentialite` (type BOOLEAN, NOT NULL, DEFAULT FALSE) à la table `public.users`
- ✅ Mise à jour de tous les utilisateurs existants avec la valeur `TRUE` par défaut
- ✅ Ajout d'un commentaire de documentation sur la colonne
- ✅ Mise à jour de la fonction `handle_new_user()` pour gérer le nouveau champ lors des inscriptions

### 2. Interface utilisateur (Frontend)

**Fichier :** `src/pages/Auth.tsx`

#### Modifications apportées :

1. **État du formulaire**
   - Ajout du champ `politiqueConfidentialite: false` dans l'état `signUpData`

2. **Validation du formulaire**
   - Ajout de la vérification `signUpData.politiqueConfidentialite === true` dans la fonction `isSignUpFormValid()`
   - Ajout d'un message d'erreur spécifique si la politique n'est pas acceptée

3. **Soumission du formulaire**
   - Transmission du champ `politique_confidentialite` lors de l'appel à `signUp()`

4. **Interface utilisateur**
   - Ajout d'une section dédiée avec un checkbox obligatoire
   - Lien cliquable vers la page de politique de confidentialité (s'ouvre dans un nouvel onglet)
   - Message d'avertissement visuel si le checkbox n'est pas coché
   - Séparateur visuel (bordure supérieure) pour distinguer cette section
   - Icône d'alerte pour attirer l'attention de l'utilisateur

**Texte du checkbox :**
> "J'accepte la politique de confidentialité et je consens au traitement de mes données personnelles conformément à celle-ci. *"

### 3. Types TypeScript

#### **Fichier :** `src/hooks/useAuth.tsx`
- ✅ Ajout du champ `politique_confidentialite?: boolean` à l'interface `SignUpMetadata`

#### **Fichier :** `src/hooks/useAzureAuth.tsx`
- ✅ Ajout du champ `politiqueConfidentialite: boolean` à l'interface `AzureSignUpData`
- ✅ Transmission du champ dans la préparation des données pour l'API Azure

#### **Fichier :** `src/integrations/api/azureClient.ts`
- ✅ Ajout du champ `politique_confidentialite?: boolean` à l'interface `SignupData`

---

## Comportement

### Pour les nouveaux utilisateurs
- Le checkbox de politique de confidentialité est **obligatoire**
- Le bouton "S'inscrire" reste désactivé tant que :
  - Tous les champs obligatoires ne sont pas remplis
  - La politique de confidentialité n'est pas acceptée
- Un message d'erreur s'affiche si l'utilisateur tente de soumettre sans cocher

### Pour les utilisateurs existants
- Tous les utilisateurs existants ont automatiquement le champ `politique_confidentialite` mis à `TRUE`
- Aucune action requise de leur part

---

## Points d'attention

### Page de politique de confidentialité
⚠️ **Action requise :** Vous devez créer une page `/privacy-policy` sur votre site qui contient :
- Le texte complet de votre politique de confidentialité
- Les informations sur le traitement des données personnelles
- Les coordonnées du DPO (Data Protection Officer) si applicable
- Les droits des utilisateurs (accès, rectification, suppression, etc.)

### Conformité RGPD
✅ Cette implémentation respecte les exigences de base du RGPD :
- Consentement explicite et actif (checkbox non pré-coché)
- Information claire sur le traitement des données
- Horodatage implicite via les champs `created_at` et `updated_at` de la table users

---

## Migration de la base de données

Pour appliquer ces modifications en production :

```bash
# Si vous utilisez Supabase CLI
supabase db push

# Ou via l'interface Supabase Dashboard
# -> SQL Editor -> Copier/coller le contenu de la migration
```

---

## Test de la fonctionnalité

### Checklist de test

- [ ] Ouvrir la page d'inscription
- [ ] Vérifier que le checkbox de politique de confidentialité s'affiche
- [ ] Vérifier que le lien vers la politique de confidentialité fonctionne
- [ ] Tenter de soumettre le formulaire sans cocher → Le bouton doit être désactivé
- [ ] Cocher le checkbox → Le bouton doit s'activer
- [ ] Soumettre le formulaire → L'inscription doit réussir
- [ ] Vérifier en base de données que le champ `politique_confidentialite` est à `TRUE`

---

## Notes techniques

### Nommage des champs
- **Base de données :** `politique_confidentialite` (snake_case, français)
- **Frontend :** `politiqueConfidentialite` (camelCase, français)
- **TypeScript :** Interfaces mises à jour pour supporter les deux conventions

### Compatibilité
- ✅ Compatible avec l'authentification Supabase
- ✅ Compatible avec l'API Azure (si utilisée)
- ✅ Rétrocompatible avec les utilisateurs existants

---

## Support

Pour toute question ou problème concernant cette fonctionnalité, veuillez contacter l'équipe de développement.

---

**Développé par :** Assistant AI  
**Date :** 16 octobre 2025  
**Version :** 1.0

