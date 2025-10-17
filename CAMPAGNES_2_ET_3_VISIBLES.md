# 📢 Vue publique : Campagnes 2 ET 3 visibles

## ✅ Modification effectuée

**Fichier modifié** : `src/config/campaigns.ts`

### Avant
```typescript
// Les candidats voient uniquement la campagne active
return allCampaigns.filter(id => id !== activeCampaign);
```

### Après  
```typescript
// Les campagnes 2 et 3 sont toujours visibles
return [2, 3]; // Seule la campagne 1 est masquée
```

---

## 🎯 Nouvelle logique de visibilité

### Pour le **PUBLIC** et les **CANDIDATS**

| Campagne | Visible ? | Raison |
|----------|-----------|--------|
| **Campagne 1** | ❌ Non | Campagne historique (masquée) |
| **Campagne 2** | ✅ Oui | Campagne en cours |
| **Campagne 3** | ✅ Oui | Campagne future/en cours |

### Pour les **RECRUTEURS**

| Campagne | Visible ? | Raison |
|----------|-----------|--------|
| **Campagne 1** | ✅ Oui | Vue complète (toutes campagnes) |
| **Campagne 2** | ✅ Oui | Vue complète (toutes campagnes) |
| **Campagne 3** | ✅ Oui | Vue complète (toutes campagnes) |

---

## 📊 Impact sur l'affichage

### Page d'accueil / Catalogue des offres

**Avant** (15 octobre 2025) :
- Uniquement les offres de la Campagne 2 (campagne active)

**Maintenant** (15 octobre 2025) :
- ✅ Toutes les offres de la Campagne 2
- ✅ Toutes les offres de la Campagne 3
- ❌ Offres de la Campagne 1 (masquées)

### Exemple visuel

```
┌──────────────────────────────────────┐
│ Directeur DSI        [Interne]      │  Campagne 2
│ 📍 Libreville  💼 CDI               │
│                    [Voir l'offre]    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Consultant RH        [Externe]      │  Campagne 3
│ 📍 Port-Gentil  💼 CDD              │
│                    [Voir l'offre]    │
└──────────────────────────────────────┘

(Les offres de Campagne 1 ne s'affichent PAS)
```

---

## 🔄 Comportement selon la date

### Avant le 21/10/2025 (pendant Campagne 2)

**Public voit** :
- ✅ Offres de Campagne 2 (actives, pas expirées)
- ✅ Offres de Campagne 3 (actives, futures)

### Après le 21/10/2025 (pendant Campagne 3)

**Public voit** :
- ✅ Offres de Campagne 2 (marquées "Expirée" si date_limite dépassée)
- ✅ Offres de Campagne 3 (actives)

---

## 🎯 Cas d'usage concret

### Scénario : Nous sommes le 15 octobre 2025

**Situation** :
- Campagne 2 : Date limite 21/10/2025 (dans 6 jours)
- Campagne 3 : Démarre le 21/10/2025 (dans 6 jours)

**Ce que voit le public** :
1. ✅ **Offres Campagne 2** : Encore ouvertes (date limite non dépassée)
2. ✅ **Offres Campagne 3** : Déjà visibles (anticipation)

**Pourquoi c'est utile ?**
- Les candidats peuvent découvrir les offres de Campagne 3 **en avance**
- Transition fluide entre Campagne 2 et 3
- Pas de "trou" dans les offres visibles

---

## 🔒 Sécurité et filtrage

### Filtrage par statut Interne/Externe

**IMPORTANT** : Le filtrage interne/externe reste actif !

- Candidat **interne** :
  - ✅ Voit offres "Interne" de Campagne 2
  - ✅ Voit offres "Externe" de Campagne 2
  - ✅ Voit offres "Interne" de Campagne 3
  - ✅ Voit offres "Externe" de Campagne 3

- Candidat **externe** :
  - ❌ Ne voit PAS offres "Interne" de Campagne 2
  - ✅ Voit offres "Externe" de Campagne 2
  - ❌ Ne voit PAS offres "Interne" de Campagne 3
  - ✅ Voit offres "Externe" de Campagne 3

### Protection des candidatures

- Un externe ne peut **jamais** candidater à une offre "Interne"
- Message d'erreur si tentative : "Cette offre n'est pas accessible à votre type de candidature"

---

## 📝 Logs de debug

Dans la console du navigateur, vous verrez :

```
✅ [CAMPAIGN FILTER] "Directeur DSI" (Campagne 2) - Visible
✅ [CAMPAIGN FILTER] "Chef Dép. Tech" (Campagne 3) - Visible
🚫 [CAMPAIGN FILTER] "Ancienne offre" (Campagne 1) - Masquée
```

---

## 🎓 Résumé pour les recruteurs

### Créer une offre pour Campagne 3 (avant le 21/10)

**Pourquoi ?** Pour que les candidats puissent la voir en avance

**Comment ?**
1. Créer une offre
2. **Campagne de recrutement** → **"Campagne 3"**
3. **Date limite** → Après le 21/10/2025 (ex: 03/11/2025)
4. Publier

**Résultat** :
- ✅ L'offre est visible immédiatement sur le site public
- ✅ Badge visible "Interne" ou "Externe"
- ✅ Les candidats peuvent candidater dès maintenant

---

## ✨ Avantages

1. **Continuité** : Pas de période sans offres visibles
2. **Anticipation** : Les candidats voient les offres futures
3. **Flexibilité** : Possibilité de publier en avance
4. **Transparence** : Le public voit tout ce qui est disponible

---

## 🚀 C'est actif maintenant !

**Les campagnes 2 ET 3 sont maintenant visibles sur la vue publique !** 🎉

La Campagne 1 reste masquée (historique).

