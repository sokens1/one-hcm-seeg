# ⏰ Filtrage automatique des offres expirées

## ✅ Modifications effectuées

### 1. **Hook useJobOffers** (`src/hooks/useJobOffers.tsx`)
Ajout d'un filtre qui masque les offres expirées pour le public et les candidats.

### 2. **Compteur CompanyContext** (`src/pages/candidate/CompanyContext.tsx`)
Le compteur d'offres exclut maintenant les offres expirées.

---

## 🎯 Logique de filtrage

### Pour le **PUBLIC** et les **CANDIDATS**

```typescript
// Vérifier si la date limite est dépassée
const deadline = new Date(offer.date_limite);
if (now > deadline) {
  return false; // ❌ Masquer l'offre
}
return true; // ✅ Afficher l'offre
```

**Résultat** :
- ✅ Offres avec `date_limite` dans le futur → **Visibles**
- ❌ Offres avec `date_limite` dans le passé → **Masquées**
- ✅ Offres sans `date_limite` → **Toujours visibles**

### Pour les **RECRUTEURS**

```typescript
if (isRecruiter) {
  return true; // ✅ Voir toutes les offres (même expirées)
}
```

**Résultat** :
- ✅ Toutes les offres visibles (actives, inactives, expirées)

---

## 📊 Scénarios concrets

### Scénario 1 : Le 15 octobre 2025

**Offres disponibles** :
- Offre A (Campagne 2) - Date limite : 21/10/2025 → ✅ **Visible** (encore valide)
- Offre B (Campagne 3) - Date limite : 03/11/2025 → ✅ **Visible** (encore valide)
- Offre C (Campagne 1) - Date limite : 11/09/2025 → ❌ **Masquée** (campagne historique)

### Scénario 2 : Le 22 octobre 2025

**Offres disponibles** :
- Offre A (Campagne 2) - Date limite : 21/10/2025 → ❌ **Masquée** (date dépassée)
- Offre B (Campagne 3) - Date limite : 03/11/2025 → ✅ **Visible** (encore valide)
- Offre C (Campagne 1) - Date limite : 11/09/2025 → ❌ **Masquée** (campagne historique)

### Scénario 3 : Le 5 novembre 2025

**Offres disponibles** :
- Offre A (Campagne 2) - Date limite : 21/10/2025 → ❌ **Masquée** (date dépassée)
- Offre B (Campagne 3) - Date limite : 03/11/2025 → ❌ **Masquée** (date dépassée)
- Offre D (Campagne 3) - Date limite : 15/11/2025 → ✅ **Visible** (encore valide)

---

## 🔍 Logs de debug

Dans la console du navigateur :

```
✅ [CAMPAIGN FILTER] "Directeur DSI" (Campagne 2) - Visible
⏰ [DATE FILTER] "Offre expirée" - Date limite dépassée (2025-09-11) - Masquée
📊 [FILTER DATE] Offres visibles après filtrage date: 5/6
✅ [FINAL] Offres affichées: 5 offres
```

---

## 🎨 Impact sur l'affichage

### Page d'accueil / Catalogue

**Avant** :
```
- Toutes les offres des campagnes 2 et 3 (même expirées)
```

**Maintenant** :
```
- Seulement les offres valides (date_limite non dépassée)
- Les offres expirées disparaissent automatiquement
```

### Page Contexte (Texte)

**Le compteur affiche maintenant** :
```
5 profils recherchés pour une mission d'intérêt national
```
(Au lieu de 8 si 3 offres sont expirées)

---

## 📝 Comportement détaillé

### Campagne avec plusieurs offres

**Campagne 2** :
- Offre 1 : Date limite 15/10/2025 → Masquée après le 15/10
- Offre 2 : Date limite 21/10/2025 → Masquée après le 21/10
- Offre 3 : Pas de date limite → Toujours visible

**Campagne 3** :
- Offre 4 : Date limite 03/11/2025 → Masquée après le 03/11
- Offre 5 : Date limite 15/11/2025 → Masquée après le 15/11

### Transition automatique

Le 22 octobre à 00h00 :
- ❌ Campagne 2 disparaît (toutes les dates limites dépassées)
- ✅ Campagne 3 continue (dates limites futures)

---

## 🔒 Pour les recruteurs

### Dashboard recruteur

**Les recruteurs voient toujours TOUT** :
- ✅ Offres actives
- ✅ Offres expirées (pour archivage)
- ✅ Offres de toutes les campagnes

**Indication visuelle** :
- Les offres expirées peuvent être marquées avec un badge "Expirée" (si implémenté)
- Pas de disparition automatique

---

## 🎯 Avantages

1. ✅ **Automatique** : Pas besoin de désactiver manuellement les offres
2. ✅ **Précis** : Se base sur la date_limite exacte
3. ✅ **Propre** : Les candidats ne voient que les offres valides
4. ✅ **Flexible** : Les recruteurs gardent l'accès complet

---

## ⚙️ Configuration

### Définir une date limite pour une offre

Lors de la création/édition d'une offre :
```
Date limite de candidature *
┌──────────────┐
│ 21/10/2025   │  ← Après cette date, l'offre disparaît de la vue publique
└──────────────┘
```

### Offre sans date limite

Si vous laissez `date_limite` vide :
- ✅ L'offre restera visible indéfiniment
- ⚠️ À utiliser avec précaution

---

## 🚀 C'est actif maintenant !

**Les offres expirées sont automatiquement masquées de la vue publique !**

- ✅ Basé sur `date_limite` de chaque offre
- ✅ Masquage automatique à minuit le jour suivant
- ✅ Recruteurs gardent la visibilité complète

**Le système gère maintenant automatiquement le cycle de vie des offres !** ⏰

