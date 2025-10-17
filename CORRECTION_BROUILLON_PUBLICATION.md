# 🔒 Correction : Brouillon ne doit pas être publié

## ❌ Problème identifié

**Symptôme** : Cliquer sur "Sauvegarder le brouillon" publie l'offre sur la vue publique

**Cause** : Le statut était toujours déterminé par le switch `isActive` (true par défaut), donc :
```typescript
// AVANT (INCORRECT)
const mappedStatus = isActive ? 'active' : 'inactive';
// → Brouillon créé avec status='active' → Visible public ❌
```

---

## ✅ Solution appliquée

### Fichiers modifiés

1. **src/pages/recruiter/CreateJob.tsx** - Logique de statut corrigée
2. **src/hooks/useJobOffers.tsx** - Filtrage des brouillons pour le public

### Corrections

#### 1. Logique de statut lors de la sauvegarde

```typescript
// APRÈS (CORRECT)
const mappedStatus = status === 'draft' 
  ? 'draft'                           // Brouillon → status='draft'
  : (isActive ? 'active' : 'inactive'); // Publication → selon switch
```

**Résultat** :
- **"Sauvegarder le brouillon"** → `status='draft'` ✅
- **"Publier l'offre"** + Switch ON → `status='active'` ✅
- **"Publier l'offre"** + Switch OFF → `status='inactive'` ✅

#### 2. Filtrage des offres pour le public

```typescript
// Public et candidats : seulement les offres actives
if (isCandidate || !isAuthenticated) {
  query = query.eq('status', 'active'); // ✅ Exclut 'draft' et 'inactive'
}

// Recruteurs : toutes les offres
else if (isRecruiter) {
  // Pas de filtre → Voir draft, active, inactive
}
```

---

## 📊 Tableau des statuts

| Status | Valeur DB | Vue Public | Vue Candidat | Vue Recruteur | Badge |
|--------|-----------|------------|--------------|---------------|-------|
| **Brouillon** | `'draft'` | ❌ Masqué | ❌ Masqué | ✅ Visible | 🟡 Brouillon |
| **Active** | `'active'` | ✅ Visible | ✅ Visible | ✅ Visible | - |
| **Inactive** | `'inactive'` | ❌ Masqué | ❌ Masqué | ✅ Visible | ⚫ Inactive |

---

## 🎯 Workflow correct

### Créer un brouillon

```
1. Créer une offre
2. Saisir le titre : "Directeur Marketing"
3. Remplir quelques champs (optionnel)
4. Cliquer "Sauvegarder le brouillon"
   ↓
   Status enregistré : 'draft'
   ↓
   ❌ PAS visible sur vue publique
   ✅ Visible pour recruteur avec badge 🟡 "Brouillon"
```

### Publier une offre

**Option A : Publication directe**
```
1. Créer une offre
2. Remplir TOUS les champs obligatoires
3. Switch "Activer l'offre" : ON ✅
4. Cliquer "Publier l'offre"
   ↓
   Status enregistré : 'active'
   ↓
   ✅ Visible sur vue publique
   ✅ Candidats peuvent postuler
```

**Option B : Publication après brouillon**
```
1. Avoir un brouillon existant
2. Modifier et compléter tous les champs
3. Switch "Activer l'offre" : ON ✅
4. Cliquer "Publier l'offre"
   ↓
   Status mis à jour : 'draft' → 'active'
   ↓
   ✅ Maintenant visible sur vue publique
```

**Option C : Publication désactivée**
```
1. Créer une offre complète
2. Switch "Activer l'offre" : OFF ❌
3. Cliquer "Publier l'offre"
   ↓
   Status enregistré : 'inactive'
   ↓
   ❌ PAS visible sur vue publique
   ✅ Visible pour recruteur avec badge ⚫ "Inactive"
```

---

## 🔍 Différence Brouillon vs Inactive

| Caractéristique | Brouillon (`draft`) | Inactive (`inactive`) |
|----------------|---------------------|----------------------|
| **Complétude** | Peut être incomplet | Complet |
| **Intention** | En cours de création | Temporairement désactivée |
| **Bouton utilisé** | "Sauvegarder le brouillon" | "Publier" + Switch OFF |
| **Modification** | Facile (incomplet OK) | Facile |
| **Réactivation** | Publier quand prêt | Switch ON + Sauvegarder |
| **Badge** | 🟡 Brouillon | ⚫ Inactive |
| **Vue public** | ❌ Masqué | ❌ Masqué |

---

## 💡 Cas d'usage

### Scénario 1 : Brouillon progressif

```
Jour 1 :
- Créer offre, titre "Chef Dept. RH"
- Sauvegarder le brouillon
- → Status='draft', pas visible public ✅

Jour 2 :
- Modifier le brouillon
- Compléter tous les champs
- Publier
- → Status='active', visible public ✅
```

### Scénario 2 : Offre future

```
13 octobre :
- Créer offre complète pour Campagne 3
- Sauvegarder le brouillon
- → Status='draft', pas visible public ✅

17 octobre :
- Modifier le brouillon (si besoin)
- Publier
- → Status='active', visible public ✅
```

### Scénario 3 : Désactivation temporaire

```
Offre publiée :
- Status='active', visible public ✅

Besoin de pause :
- Switch "Activer l'offre" : OFF
- Sauvegarder (bouton "Modifier l'offre")
- → Status='inactive', masquée public ✅

Réactivation :
- Switch "Activer l'offre" : ON
- Sauvegarder
- → Status='active', visible public ✅
```

---

## 🔒 Protection du public

### Filtre appliqué

```typescript
// Pour public et candidats
query = query.eq('status', 'active');

// Résultat :
// ✅ Offres actives affichées
// ❌ Brouillons masqués
// ❌ Offres inactives masquées
```

### Impact

- Les visiteurs ne voient **jamais** les brouillons
- Les candidats ne voient **jamais** les brouillons
- Seuls les recruteurs voient les brouillons (pour gestion)

---

## 📝 Validation des champs

### Pour "Sauvegarder le brouillon"

```
Champs REQUIS :
✅ Titre uniquement

Résultat :
→ Status = 'draft'
→ Pas visible public
→ Badge "Brouillon" pour recruteur
```

### Pour "Publier l'offre"

```
Champs REQUIS :
✅ Titre
✅ Lieu de travail
✅ Type de contrat
✅ Statut de l'offre (Interne/Externe)
✅ Missions principales
✅ Connaissances savoir et requis

Switch "Activer l'offre" :
→ ON : Status = 'active' (visible public)
→ OFF : Status = 'inactive' (masqué public)
```

---

## ✨ Résumé

**Avant** :
- ❌ "Sauvegarder le brouillon" → Offre visible public
- ❌ Confusion entre brouillon et publication
- ❌ Switch "Activer" affectait les brouillons

**Maintenant** :
- ✅ "Sauvegarder le brouillon" → `status='draft'` → Masqué public
- ✅ "Publier l'offre" → `status='active'` ou `'inactive'` → Selon switch
- ✅ Distinction claire brouillon vs publication
- ✅ Brouillons jamais visibles par le public

---

## 🎯 Workflow final

```
Créer → Sauvegarder brouillon → Masqué public ✅
       ↓
Modifier → Compléter → Publier → Visible public ✅
```

**Le système de brouillons fonctionne maintenant correctement !** 🎉

