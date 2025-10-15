# 🏷️ Badge "Brouillon" pour les offres

## ✅ Modification effectuée

**Fichier modifié** : `src/pages/recruiter/RecruiterJobs.tsx`

### Ajout du badge "Brouillon"

Pour les offres avec `status = 'draft'` :
- 🟡 Badge orange/ambre : **"Brouillon"**
- Opacité réduite de la carte
- Bordure en pointillés

---

## 🎨 Badges disponibles

### Status des offres

| Status | Badge | Couleur | Signification |
|--------|-------|---------|---------------|
| `'active'` | - | Normal | Offre publiée et visible |
| `'draft'` | 🟡 Brouillon | Ambre | Offre en brouillon (non publiée) |
| `'inactive'` | ⚫ Inactive | Gris | Offre désactivée |

---

## 🎨 Rendu visuel

### Vue grille (Grid)

```
┌────────────────────────────────────┐
│ Chef Dept. Tech    [Brouillon] 🟡 │ ← Badge ambre
│ 📍 Libreville  💼 CDI             │
│ [Campagne 2]                       │
│ 5 candidats                        │
│                                    │
│ [Voir le Pipeline]  [Modifier]     │
└────────────────────────────────────┘
(Carte avec opacité et bordure pointillée)
```

### Vue liste (List)

```
┌──────────────────────────────────────────────────┐
│ Titre                    │ Candidatures │ Actions │
├──────────────────────────┼──────────────┼─────────┤
│ Chef Dept. Tech [Brouillon] │      5      │ [Voir]  │
│ Libreville • CDI         │              │ [Modif] │
└──────────────────────────────────────────────────┘
(Ligne avec fond grisé)
```

---

## 🔧 Logique de code

### Vue grille

```tsx
const isDraft = job.status === 'draft';
const isInactive = job.status === 'inactive';

<Card className={`... ${isInactive || isDraft ? 'opacity-60 bg-gray-50 border-dashed' : ''}`}>
  <div className="flex flex-col gap-1">
    {isDraft && (
      <Badge className="bg-amber-50 text-amber-700 border-amber-300">
        Brouillon
      </Badge>
    )}
    {isInactive && !isDraft && (
      <Badge className="bg-gray-200 text-gray-600 border-gray-300">
        Inactive
      </Badge>
    )}
  </div>
</Card>
```

### Vue liste

```tsx
{isDraft && (
  <Badge className="bg-amber-50 text-amber-700 border-amber-300">
    Brouillon
  </Badge>
)}
{isInactive && !isDraft && (
  <Badge className="bg-gray-200 text-gray-600 border-gray-300">
    Inactive
  </Badge>
)}
```

---

## 📋 Workflow avec brouillons

### Créer un brouillon

1. **Créer une offre**
2. Saisir le titre : "Directeur Marketing"
3. Remplir quelques champs
4. Cliquer **"Sauvegarder le brouillon"**
5. Retour au dashboard

### Visualisation du brouillon

**Dans "Mes offres d'emploi"** :
```
┌────────────────────────────────────┐
│ Directeur Marketing  [Brouillon]  │ ← Visible avec badge
│ 📍 (vide)  💼 (vide)              │
│ 0 candidat                         │
│ [Voir le Pipeline]  [Modifier]     │
└────────────────────────────────────┘
```

### Compléter et publier

1. Cliquer sur **"Modifier"**
2. Compléter tous les champs
3. Activer le switch "Activer l'offre"
4. Cliquer **"Publier l'offre"**
5. Badge "Brouillon" disparaît ✅

---

## 🎯 Cas d'usage

### Scénario 1 : Brouillon partiel

**Situation** : Recruteur commence une offre mais n'a pas toutes les infos

```
1. Créer une offre
2. Titre : "Consultant IT"
3. Sauvegarder le brouillon
4. → Badge "Brouillon" visible dans la liste
5. Demander les infos manquantes
6. Revenir et modifier
7. Publier quand prêt
```

### Scénario 2 : Révision avant publication

**Situation** : Recruteur veut faire relire l'offre avant publication

```
1. Créer une offre complète
2. Sauvegarder le brouillon
3. → Badge "Brouillon" visible
4. Envoyer le lien à un collègue
5. Recevoir les retours
6. Modifier
7. Publier après validation
```

### Scénario 3 : Offres futures

**Situation** : Préparer des offres à l'avance pour Campagne 3

```
1. Créer 5 offres pour Campagne 3
2. Toutes en "Brouillon"
3. → 5 badges "Brouillon" visibles
4. Le 17/10 : Publier toutes les offres
5. → Badges disparaissent
```

---

## 🔍 Filtrage

### Offres affichées dans "Mes offres d'emploi"

```javascript
.filter(job => 
  job.status === 'active' || 
  job.status === 'draft' ||    ← Les brouillons sont affichés
  job.status === 'inactive'
)
```

**Résultat** :
- ✅ Offres actives (publiées)
- ✅ Offres brouillon (non publiées)
- ✅ Offres inactives (désactivées)

---

## 🎨 Styling

### Couleurs du badge

```css
/* Brouillon */
bg-amber-50 text-amber-700 border-amber-300

/* Inactive */
bg-gray-200 text-gray-600 border-gray-300
```

### Effet sur la carte

```css
/* Opacité réduite */
opacity-60

/* Fond grisé */
bg-gray-50

/* Bordure pointillée */
border-dashed
```

---

## 📊 Statistiques

### Compteur d'offres

**Dashboard** affiche :
```
Offres actives : 5
```

**Note** : Les brouillons ne sont PAS comptés dans "Offres actives"
- Seules les offres avec `status='active'` sont comptées
- Les brouillons sont visibles mais marqués différemment

---

## 🚨 Différence Brouillon vs Inactive

| Caractéristique | Brouillon | Inactive |
|----------------|-----------|----------|
| **Intention** | En cours de création | Désactivée temporairement |
| **Complétude** | Peut être incomplet | Complet |
| **Visibilité public** | ❌ Non | ❌ Non |
| **Visibilité recruteur** | ✅ Oui | ✅ Oui |
| **Badge** | 🟡 Brouillon | ⚫ Inactive |
| **Modification** | ✅ Recommandée | ✅ Possible |

---

## ✨ Avantages

1. **Visibilité claire** : Les recruteurs savent quelles offres sont publiées
2. **Organisation** : Distinction visuelle entre brouillons et offres actives
3. **Workflow** : Facilite le travail par étapes
4. **Sécurité** : Pas de publication accidentelle

---

## 🔍 Identification rapide

### Dans la liste des offres

Un recruteur peut rapidement identifier :
- ✅ Offres publiées (sans badge particulier)
- 🟡 Offres en brouillon (badge ambre)
- ⚫ Offres inactives (badge gris)
- 🔵 Campagne de l'offre (badge bleu/gris)

---

## 🚀 C'est actif !

**Le badge "Brouillon" est maintenant visible sur toutes les offres non publiées !**

Les recruteurs peuvent facilement identifier et gérer leurs brouillons. 🎉

