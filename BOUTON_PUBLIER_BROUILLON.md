# 🚀 Bouton "Publier l'offre" pour les brouillons

## ✅ Modification effectuée

**Fichier modifié** : `src/pages/recruiter/EditJob.tsx`

### Ajout du bouton "Publier l'offre"

Quand une offre est en brouillon (`status='draft'`), un nouveau bouton vert apparaît :
- 🟢 **"Publier l'offre"** - Valide tous les champs et publie
- Ce bouton est **conditionnel** : visible seulement pour les brouillons

---

## 🎨 Interface mise à jour

### Pour une offre BROUILLON

```
┌─────────────────────────────────────────────┐
│ [🗑️ Supprimer l'offre]                     │
│                                             │
│        [Annuler] [💾 Sauvegarder] [📤 Publier l'offre]│
│                      ↑ Garde en brouillon   ↑ Publie    │
└─────────────────────────────────────────────┘
```

### Pour une offre PUBLIÉE

```
┌─────────────────────────────────────────────┐
│ [🗑️ Supprimer l'offre]                     │
│                                             │
│                  [Annuler] [💾 Sauvegarder] │
│                             ↑ Met à jour    │
└─────────────────────────────────────────────┘
```

---

## 🔧 Logique de fonctionnement

### Bouton "Sauvegarder"

```typescript
// Si l'offre est un brouillon
if (jobOffer.status === 'draft') {
  status = 'draft'; // ✅ Garde en brouillon
}
// Sinon (offre publiée)
else {
  status = isActive ? 'active' : 'inactive'; // Utilise le switch
}
```

**Résultat** :
- Brouillon → Reste brouillon après sauvegarde
- Offre publiée → Status selon le switch "Activer l'offre"

### Bouton "Publier l'offre" (nouveau)

```typescript
// Validation complète
if (!allRequiredFields) {
  ❌ Erreur : "Veuillez remplir tous les champs obligatoires"
}

// Forcer le status à 'active'
status = 'active'; // ✅ Publie l'offre
```

**Résultat** :
- Brouillon → Devient actif (`'draft'` → `'active'`)
- Visible sur la vue publique immédiatement

---

## 📋 Workflows

### Workflow 1 : Créer et publier progressivement

```
Jour 1 :
1. Créer une offre
2. Saisir titre : "Directeur Marketing"
3. Sauvegarder le brouillon
   → Status = 'draft'
   → ❌ Pas visible public
   → ✅ Badge "Brouillon" pour recruteur

Jour 2 :
1. Modifier le brouillon
2. Compléter les champs manquants
3. Cliquer "Publier l'offre" (bouton vert)
   → Status = 'active'
   → ✅ Visible public
   → Badge "Brouillon" disparaît
```

### Workflow 2 : Modifier un brouillon sans publier

```
1. Modifier un brouillon existant
2. Ajouter/modifier des informations
3. Cliquer "Sauvegarder"
   → Status reste 'draft'
   → ❌ Toujours pas visible public
   → ✅ Badge "Brouillon" reste
```

### Workflow 3 : Modifier une offre publiée

```
1. Modifier une offre publiée (status='active')
2. Changer quelques champs
3. Cliquer "Sauvegarder"
   → Status reste 'active'
   → ✅ Toujours visible public
   → Modifications appliquées
```

---

## 🎯 Validation des champs

### Bouton "Sauvegarder"

```
Champs REQUIS : Aucun
(Peut sauvegarder même avec champs incomplets si c'est un brouillon)
```

### Bouton "Publier l'offre"

```
Champs REQUIS :
✅ Titre
✅ Lieu de travail
✅ Type de contrat
✅ Statut de l'offre (Interne/Externe)
✅ Missions principales
✅ Connaissances savoir et requis

Si incomplet :
❌ Bouton grisé
💬 Tooltip : "Veuillez remplir tous les champs obligatoires"
```

---

## 🔍 États du bouton "Publier l'offre"

### Visible uniquement si

```typescript
jobOffer?.status === 'draft'
```

### Désactivé si

```typescript
isUpdating ||          // Sauvegarde en cours
isDeleting ||          // Suppression en cours
!formData.title ||     // Titre manquant
!formData.location ||  // Lieu manquant
// ... autres champs requis
```

### Actif si

```
✅ Offre est un brouillon
✅ Tous les champs obligatoires remplis
✅ Aucune opération en cours
```

---

## 📊 Comparaison des boutons

| Bouton | Visible pour | Action | Validation | Status résultant |
|--------|--------------|--------|------------|------------------|
| **Sauvegarder** | Tous | Mettre à jour | Minimale | Garde le status actuel |
| **Publier l'offre** | Brouillons uniquement | Publier | Complète | Force 'active' |

---

## 🎨 Design du bouton

### Bouton "Publier l'offre"

```jsx
<Button 
  variant="success"  // ← Vert pour action positive
  className="gap-2"
>
  <Send className="w-4 h-4" />  // ← Icône d'envoi
  Publier l'offre
</Button>
```

**Couleur** : Vert (variant="success")  
**Icône** : Send (📤)  
**Position** : À droite, après "Sauvegarder"

---

## 🔄 Transition d'états

### Cycle de vie d'une offre

```
Création
  ↓
Sauvegarder brouillon → status='draft' → Badge 🟡
  ↓
Modifier brouillon → status='draft' (inchangé)
  ↓
Publier → status='active' → Badge disparaît, visible public ✅
  ↓
Modifier offre publiée → status='active' (inchangé)
  ↓
Désactiver (Switch OFF) → status='inactive' → Badge ⚫
  ↓
Réactiver (Switch ON) → status='active' → Visible public ✅
```

---

## 💡 Points clés

1. **"Sauvegarder"** ne change JAMAIS le status (garde 'draft', 'active', ou 'inactive')
2. **"Publier l'offre"** change toujours le status à `'active'` (publication forcée)
3. Le bouton "Publier" n'apparaît **que** pour les brouillons
4. Une fois publiée, l'offre ne peut plus redevenir brouillon (seulement inactive)

---

## 🚨 Prévention des erreurs

### Bouton grisé si incomplet

Si le recruteur clique "Publier l'offre" sans remplir tous les champs :
```
❌ Toast d'erreur : "Champs requis pour publication"
💬 Description : "Veuillez remplir tous les champs obligatoires avant de publier."
```

Le bouton est **automatiquement grisé** si des champs manquent.

---

## ✨ Résumé

**Problème** : Pas de bouton pour publier un brouillon  
**Solution** : Bouton "Publier l'offre" conditionnel  
**Résultat** : Workflow clair et intuitif  

**Le recruteur peut maintenant publier ses brouillons facilement !** 🎉

