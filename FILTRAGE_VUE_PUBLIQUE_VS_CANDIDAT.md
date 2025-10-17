# 👁️ Distinction Vue Publique vs Vue Candidat

## 🎯 Nouvelle logique de filtrage

### Vue PUBLIQUE (non connectés)
✅ **Masque les campagnes terminées**  
✅ **Masque les offres expirées**

### Vue CANDIDAT (connectés)
✅ **Affiche campagnes 2 et 3 (même terminées)**  
✅ **Masque les offres expirées**

### Vue RECRUTEUR
✅ **Affiche tout (toutes campagnes, même expirées)**

---

## 📊 Tableau comparatif

| Critère | Vue Publique | Vue Candidat | Vue Recruteur |
|---------|--------------|--------------|---------------|
| **Campagne 1** | ❌ Masquée | ❌ Masquée | ✅ Visible |
| **Campagne 2 en cours** | ✅ Visible | ✅ Visible | ✅ Visible |
| **Campagne 2 terminée** | ❌ Masquée | ✅ Visible | ✅ Visible |
| **Campagne 3 en cours** | ✅ Visible | ✅ Visible | ✅ Visible |
| **Offre date limite OK** | ✅ Visible | ✅ Visible | ✅ Visible |
| **Offre date limite passée** | ❌ Masquée | ❌ Masquée | ✅ Visible |

---

## 🗓️ Scénarios avec les nouvelles dates

### Scénario 1 : Le 15 octobre 2025

**Situation** :
- Campagne 2 : En cours (fin le 17/10)
- Campagne 3 : Pas encore commencée (début le 17/10)

#### Vue PUBLIQUE (non connecté)
```
✅ Offre A (Campagne 2, date limite 17/10) - Visible
✅ Offre B (Campagne 2, date limite 20/10) - Visible
✅ Offre C (Campagne 3, date limite 03/11) - Visible
❌ Offre D (Campagne 1, date limite 11/09) - Masquée (campagne historique)

Total affiché : 3 offres
```

#### Vue CANDIDAT (connecté)
```
✅ Offre A (Campagne 2, date limite 17/10) - Visible
✅ Offre B (Campagne 2, date limite 20/10) - Visible
✅ Offre C (Campagne 3, date limite 03/11) - Visible
❌ Offre D (Campagne 1, date limite 11/09) - Masquée (campagne historique)

Total affiché : 3 offres
```

---

### Scénario 2 : Le 18 octobre 2025

**Situation** :
- Campagne 2 : Terminée (fin le 17/10) ⏰
- Campagne 3 : En cours (début le 17/10)

#### Vue PUBLIQUE (non connecté)
```
❌ Offre A (Campagne 2, date limite 17/10) - Masquée (campagne terminée)
❌ Offre B (Campagne 2, date limite 20/10) - Masquée (campagne terminée)
✅ Offre C (Campagne 3, date limite 03/11) - Visible
❌ Offre D (Campagne 1, date limite 11/09) - Masquée (campagne historique)

Total affiché : 1 offre
```

#### Vue CANDIDAT (connecté)
```
❌ Offre A (Campagne 2, date limite 17/10) - Masquée (date limite passée)
✅ Offre B (Campagne 2, date limite 20/10) - Visible (campagne terminée mais date OK)
✅ Offre C (Campagne 3, date limite 03/11) - Visible
❌ Offre D (Campagne 1, date limite 11/09) - Masquée (campagne historique)

Total affiché : 2 offres
```

#### Vue RECRUTEUR
```
✅ Offre A (Campagne 2, date limite 17/10) - Visible (archive)
✅ Offre B (Campagne 2, date limite 20/10) - Visible
✅ Offre C (Campagne 3, date limite 03/11) - Visible
✅ Offre D (Campagne 1, date limite 11/09) - Visible (archive)

Total affiché : 4 offres (tout)
```

---

### Scénario 3 : Le 22 octobre 2025

**Situation** :
- Campagne 2 : Terminée
- Campagne 3 : En cours

#### Vue PUBLIQUE (non connecté)
```
❌ Toute la Campagne 2 masquée (campagne terminée)
✅ Offre C (Campagne 3, date limite 03/11) - Visible
✅ Offre E (Campagne 3, date limite 15/11) - Visible

Total affiché : 2 offres (Campagne 3 uniquement)
```

#### Vue CANDIDAT (connecté)
```
❌ Offre A (Campagne 2, date limite 17/10) - Masquée (date dépassée)
❌ Offre B (Campagne 2, date limite 20/10) - Masquée (date dépassée)
✅ Offre C (Campagne 3, date limite 03/11) - Visible
✅ Offre E (Campagne 3, date limite 15/11) - Visible

Total affiché : 2 offres
```

---

## 🔍 Logique de code

### Vue PUBLIQUE (non connecté)

```typescript
if (!isAuthenticated) {
  // Vérifier si la campagne est terminée
  if (campaign.endDate && now > campaign.endDate) {
    return false; // ❌ Masquer toute la campagne
  }
  
  // Vérifier si la date limite est dépassée
  if (dateLimite && now > deadline) {
    return false; // ❌ Masquer l'offre
  }
  
  return true; // ✅ Afficher
}
```

### Vue CANDIDAT (connecté)

```typescript
if (isAuthenticated && isCandidate) {
  // Afficher campagnes 2 et 3 (même terminées)
  if (![2, 3].includes(campaignId)) {
    return false; // ❌ Masquer campagne 1
  }
  
  // Vérifier uniquement la date limite de l'offre
  if (dateLimite && now > deadline) {
    return false; // ❌ Masquer si date dépassée
  }
  
  return true; // ✅ Afficher
}
```

---

## 💡 Pourquoi cette distinction ?

### Vue PUBLIQUE
**Objectif** : Montrer uniquement les opportunités **actuellement disponibles**
- Les visiteurs non inscrits ne devraient voir que les offres "fraîches"
- Évite la confusion avec des campagnes anciennes
- Focus sur les opportunités immédiates

### Vue CANDIDAT
**Objectif** : Permettre aux candidats de **postuler jusqu'à la dernière minute**
- Un candidat connecté peut voir une offre de Campagne 2 même après le 17/10
- Tant que la `date_limite` de l'offre n'est pas passée
- Plus de flexibilité pour les candidats engagés

---

## 🎯 Cas d'usage concret

### Offre avec date limite étendue

**Configuration** :
- Campagne : 2
- Date limite : 20/10/2025 (3 jours après la fin de la campagne)

**Affichage le 18 octobre** :
- ❌ **Public** : Offre masquée (campagne terminée)
- ✅ **Candidat** : Offre visible (date limite pas encore passée)
- ✅ **Recruteur** : Offre visible

**Avantage** : Les candidats connectés peuvent finir leur dossier même si la campagne est officiellement "fermée".

---

## 📊 Compteur "X profils recherchés"

### Page Contexte

Le compteur suit la logique **VUE PUBLIQUE** :
- Compte uniquement les campagnes en cours
- Exclut les campagnes terminées
- Exclut les offres dont date_limite passée

**Résultat** : Le nombre affiché est toujours pertinent pour un visiteur non connecté.

---

## ✨ Résumé

**Double filtrage pour le public** :
1. Campagne terminée → ❌ Masquer
2. Date limite passée → ❌ Masquer

**Filtrage unique pour les candidats** :
1. Date limite passée → ❌ Masquer
2. Campagne terminée → ✅ Afficher quand même

**Aucun filtrage pour les recruteurs** :
- Tout est visible (archivage et gestion)

---

## 🚀 C'est actif !

La distinction entre vue publique et vue candidat est maintenant opérationnelle ! 🎉

