# Validation du matricule - Ajout vérification CDD

## 🎯 Objectif

Empêcher les agents SEEG en CDD de s'inscrire pour candidater.

## ✅ Nouvelle vérification ajoutée

La fonction `verify_matricule` vérifie maintenant **3 choses** dans cet ordre :

### 1️⃣ Vérification dans `seeg_agents`
Le matricule existe-t-il dans la base des agents SEEG ?
- ❌ **NON** → Refuser : *"Ce matricule n'existe pas dans la base SEEG"*
- ✅ **OUI** → Continuer à l'étape 2

### 2️⃣ Vérification CDD (NOUVEAU) ⚠️
Le matricule est-il dans la table `cdd_matricules` ?
- ❌ **OUI** → Refuser : *"Étant actuellement en CDD, vous ne pouvez candidater dans le cadre de cette campagne"*
- ✅ **NON** → Continuer à l'étape 3

### 3️⃣ Vérification campagne 1
Le matricule a-t-il déjà postulé lors de la campagne 1 ?
- ❌ **OUI** → Refuser : *"Le titulaire de ce matricule a déjà postulé lors de la campagne 1"*
- ✅ **NON** → Matricule valide ✅

## 📊 Ordre de priorité des messages

1. **Matricule inexistant** (n'existe pas dans `seeg_agents`)
2. **Agent en CDD** (existe dans `cdd_matricules`) ← **NOUVEAU**
3. **Déjà candidaté en campagne 1** (a postulé en campagne 1)
4. **Matricule valide** ✅

## 🗄️ Table `cdd_matricules`

Structure :
```sql
- MLE (bigint) : Matricule de l'agent
- NOM (text) : Nom
- PRÉNOM (text) : Prénom
- Type de contrat (text) : Type de contrat
- Libellé Unité (text) : Unité
- ... autres champs
```

## 📝 Retour de la fonction

```json
{
  "exists_in_agents": true/false,
  "is_cdd": true/false,
  "already_used": true/false,
  "is_valid": true/false,
  "message": "Message explicatif"
}
```

## 🧪 Scénarios de test

### Scénario 1 : Agent CDI valide ✅
1. Matricule **6789** existe dans `seeg_agents` ✅
2. Matricule **6789** n'est PAS dans `cdd_matricules` ✅
3. Matricule **6789** n'a pas postulé en campagne 1 ✅
4. **Résultat** : Inscription autorisée

### Scénario 2 : Agent en CDD ❌
1. Matricule **7030** existe dans `seeg_agents` ✅
2. Matricule **7030** est dans `cdd_matricules` ❌
3. **Résultat** : Inscription refusée
4. **Message** : "Étant actuellement en CDD, vous ne pouvez candidater dans le cadre de cette campagne"

### Scénario 3 : Agent ayant déjà postulé en campagne 1 ❌
1. Matricule **6042** existe dans `seeg_agents` ✅
2. Matricule **6042** n'est PAS dans `cdd_matricules` ✅
3. Matricule **6042** a postulé en campagne 1 ❌
4. **Résultat** : Inscription refusée
5. **Message** : "Le titulaire de ce matricule a déjà postulé lors de la campagne 1"

### Scénario 4 : Matricule invalide ❌
1. Matricule **9999** n'existe pas dans `seeg_agents` ❌
2. **Résultat** : Inscription refusée
3. **Message** : "Ce matricule n'existe pas dans la base SEEG"

## 🚀 Déploiement

### Fichier SQL à exécuter
```
supabase/migrations/20251017000003_verify_matricule_simple.sql
```

### Dans Supabase SQL Editor
1. Copier le contenu complet du fichier
2. Exécuter la migration
3. La fonction `verify_matricule(text)` sera recréée avec la vérification CDD

## ⚙️ Code frontend

Aucune modification nécessaire dans le code frontend ! Le code existant dans `src/pages/Auth.tsx` récupère automatiquement le champ `message` du JSON retourné et l'affiche à l'utilisateur.

## 🎯 Avantages

1. ✅ **Protection automatique** : Les CDD ne peuvent pas s'inscrire
2. ✅ **Message clair** : L'utilisateur sait pourquoi son inscription est refusée
3. ✅ **Ordre logique** : Les vérifications sont faites du plus basique au plus spécifique
4. ✅ **Pas de modification frontend** : Tout est géré côté serveur
5. ✅ **Facilement maintenable** : Ajout/suppression de matricules CDD via la table

## 📌 Note importante

Pour ajouter ou retirer des agents CDD de la liste, il suffit de :
1. Ajouter/supprimer des lignes dans la table `cdd_matricules`
2. Aucune modification de code nécessaire

