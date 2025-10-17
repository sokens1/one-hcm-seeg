# 🎯 Guide : Sélection manuelle de campagne lors de la création d'offre

## ✅ Modifications effectuées

### 📝 Nouveau système de sélection manuelle

**Avant** : Le système déterminait automatiquement la campagne selon la date de création  
**Maintenant** : Le recruteur **choisit manuellement** la campagne lors de la création/édition

---

## 🎨 Interface mise à jour

### Formulaire de création (`src/pages/recruiter/CreateJob.tsx`)

**Nouveau champ ajouté** :
```
Campagne de recrutement *
┌──────────────────────────┐
│ Campagne 2             ▼ │  ← Select avec 3 options
└──────────────────────────┘

Options :
- Campagne 1
- Campagne 2 (par défaut)
- Campagne 3
```

### Formulaire d'édition (`src/pages/recruiter/EditJob.tsx`)

- ✅ Même champ ajouté
- ✅ Lors de l'édition, affiche la campagne actuelle de l'offre
- ✅ Permet de changer la campagne d'une offre existante

---

## 🔧 Logique de fonctionnement

### 1. **Création d'une nouvelle offre**

```typescript
// Le recruteur choisit manuellement
campaign_id: formData.campaignId // "1", "2" ou "3"
```

### 2. **Fallback si non spécifié**

```typescript
// Si aucune campagne n'est choisie (ne devrait pas arriver)
const campaignId = jobData.campaign_id ?? CAMPAIGN_CONFIG.ACTIVE_CAMPAIGN_ID;
```

### 3. **Édition d'une offre**

```typescript
// Charge la campagne actuelle de l'offre
campaignId: jobOffer.campaign_id ? String(jobOffer.campaign_id) : "2"
```

---

## 🎯 Cas d'usage : Offres internes pendant Campagne 2

### Scénario
Vous êtes le **15 octobre 2025**, en pleine **Campagne 2**.  
Vous voulez créer une offre **réservée aux internes** pour cette campagne.

### Étapes

1. **Créer une nouvelle offre**
2. **Remplir les champs** :
   - Titre : "Chef de Département Technique"
   - Type de contrat : CDI
   - **Statut de l'offre** : **"Interne"** ⭐
   - **Campagne de recrutement** : **"Campagne 2"** ⭐
   - Date d'embauche : 01/02/2026
   - Date limite : 21/10/2025
3. **Publier l'offre**

### Résultat automatique

| Type | Voit l'offre ? | Badge affiché | Campagne |
|------|----------------|---------------|----------|
| **Candidat interne** | ✅ Oui | 🔵 Interne | Campagne 2 |
| **Candidat externe** | ❌ Non | - | - |
| **Recruteur** | ✅ Oui | 🔵 Interne | Filtrable par Campagne 2 |

---

## 🔄 Avantages du nouveau système

### ✅ **Flexibilité**
- Créer des offres pour une campagne future
- Corriger le campaign_id d'une offre existante
- Pas de dépendance aux dates

### ✅ **Clarté**
- Le recruteur voit exactement à quelle campagne appartient l'offre
- Pas de calcul automatique "magique"
- Modification explicite possible

### ✅ **Robustesse**
- Si les dates des campagnes changent, pas d'impact sur les offres existantes
- Le campaign_id reste fixe une fois défini
- Pas de recalcul nécessaire

---

## 📊 Impact sur les vues recruteur

### Dashboard recruteur
Le sélecteur de campagne filtre maintenant par `campaign_id` exact :
- **Vue globale** : Toutes les offres de toutes les campagnes
- **Campagne 1** : Uniquement les offres avec `campaign_id = 1`
- **Campagne 2** : Uniquement les offres avec `campaign_id = 2`
- **Campagne 3** : Uniquement les offres avec `campaign_id = 3`

### Candidatures par campagne
Les candidatures sont automatiquement associées à la campagne de l'offre.

---

## 🚀 Migration des offres existantes

### Offres avec campaign_id NULL

Si des offres ont `campaign_id = NULL`, elles seront :
- Toujours visibles dans la **vue globale**
- Pas visibles dans les filtres de campagne spécifiques

### Recommandation
Éditez les offres existantes pour leur assigner une campagne si nécessaire.

---

## 🔍 Logs de debug

Les logs console affichent maintenant :
```
📊 [CreateJobOffer] Création d'offre avec campaign_id: 2 (manuel: true)
```

Cela permet de vérifier que le campaign_id manuel est bien utilisé.

---

## ✨ Résumé

**Le système ne dépend plus des dates pour déterminer la campagne !**

- ✅ Sélection manuelle dans le formulaire
- ✅ Modifiable à tout moment
- ✅ Plus flexible et explicite
- ✅ Compatible avec les offres internes/externes

**Vous pouvez maintenant créer des offres pour n'importe quelle campagne, indépendamment de la date actuelle !** 🎉

