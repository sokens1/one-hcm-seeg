# 📋 Instructions pour les recruteurs : Gestion des campagnes

## 🎯 Nouveau système de campagnes

Depuis aujourd'hui, **vous choisissez manuellement** la campagne lors de la création d'une offre.

---

## 📝 Créer une offre pour la Campagne 2

### Formulaire de création

1. **Aller sur** : Créer une offre d'emploi
2. **Remplir les informations** :

```
┌─────────────────────────────────────────┐
│ Intitulé du poste *                     │
│ Ex: Chef de Département Technique       │
├─────────────────────────────────────────┤
│ Type de contrat *                       │
│ CDI ▼                                   │
├─────────────────────────────────────────┤
│ Statut de l'offre *                     │
│ Interne ▼  ou  Externe ▼                │ ← Choisir Interne ou Externe
├─────────────────────────────────────────┤
│ Campagne de recrutement *               │
│ Campagne 2 ▼                            │ ← Choisir la campagne !
├─────────────────────────────────────────┤
│ Date d'embauche                         │
│ 01/02/2026                              │
├─────────────────────────────────────────┤
│ Date limite de candidature *            │
│ 21/10/2025                              │
└─────────────────────────────────────────┘
```

3. **Publier** → L'offre sera créée avec `campaign_id = 2`

---

## 🔵 Offres Internes vs 🟢 Offres Externes

### Offre Interne (Campagne 2)

**Configuration** :
- Statut de l'offre : **"Interne"**
- Campagne : **"Campagne 2"**

**Visibilité** :
- ✅ Candidats internes : Voient l'offre avec badge 🔵 "Interne"
- ❌ Candidats externes : Ne voient PAS l'offre (filtrée)
- ✅ Public : Voit l'offre avec badge 🔵 "Interne"
- ✅ Recruteurs : Voient tout

**Résultat** :
```
┌──────────────────────────────────────┐
│ Chef Dép. Technique      [Interne]  │ ← Badge bleu
│ 📍 Libreville                       │
│ 💼 CDI                              │
│ Campagne 2                          │
└──────────────────────────────────────┘
```

### Offre Externe (Campagne 2)

**Configuration** :
- Statut de l'offre : **"Externe"**
- Campagne : **"Campagne 2"**

**Visibilité** :
- ✅ Candidats internes : Voient l'offre avec badge 🟢 "Externe"
- ✅ Candidats externes : Voient l'offre avec badge 🟢 "Externe"
- ✅ Public : Voit l'offre avec badge 🟢 "Externe"
- ✅ Recruteurs : Voient tout

**Résultat** :
```
┌──────────────────────────────────────┐
│ Consultant RH            [Externe]  │ ← Badge vert
│ 📍 Port-Gentil                      │
│ 💼 CDD                              │
│ Campagne 2                          │
└──────────────────────────────────────┘
```

---

## 🔍 Filtrage dans le Dashboard recruteur

### Sélecteur de campagne

En haut du dashboard, vous verrez :

```
┌──────────────────────────────────────┐
│ Vue globale ▼                        │
│  - Vue globale (toutes campagnes)    │
│  - Campagne 1                        │
│  - Campagne 2                        │ ← Filtrer par campagne
│  - Campagne 3                        │
└──────────────────────────────────────┘
```

**Résultat du filtre** :
- **Vue globale** : Affiche toutes les offres de toutes les campagnes
- **Campagne 2** : Affiche uniquement les offres avec `campaign_id = 2`

---

## 🎯 Scénarios courants

### Scénario 1 : Créer 3 offres identiques pour Campagne 1 et Campagne 2

**Option A : Manuellement** (recommandé)
1. Créer la 1ère offre avec "Campagne 2"
2. Créer la 2ème offre avec "Campagne 2"
3. Créer la 3ème offre avec "Campagne 2"

**Option B : Par SQL** (plus rapide)
1. Utiliser le script `dupliquer_offres_campagne2.sql` (déjà créé)
2. Modifier les campaign_id si nécessaire

### Scénario 2 : Corriger le campaign_id d'une offre

1. Aller sur **Mes offres d'emploi**
2. Cliquer sur **Modifier** sur l'offre concernée
3. Changer **"Campagne de recrutement"** vers la bonne campagne
4. Sauvegarder

### Scénario 3 : Mélanger offres internes et externes dans Campagne 2

**Tout est dans le même formulaire !**
- Offre 1 : Interne, Campagne 2
- Offre 2 : Externe, Campagne 2
- Offre 3 : Interne, Campagne 2

Les candidats verront uniquement les offres compatibles avec leur statut.

---

## 🚨 Points d'attention

### ⚠️ Cohérence des dates

Assurez-vous que les dates correspondent à la campagne :
- **Campagne 1** : Date limite avant 11/09/2025
- **Campagne 2** : Date limite 21/10/2025
- **Campagne 3** : Date limite après 21/10/2025

### ⚠️ Statut de l'offre obligatoire

Le champ **"Statut de l'offre"** (Interne/Externe) est **obligatoire**.  
Si vous ne le remplissez pas, l'offre ne pourra pas être publiée.

### ⚠️ Campaign_id obligatoire

Le champ **"Campagne de recrutement"** est **obligatoire**.  
Par défaut, il est pré-rempli avec "Campagne 2".

---

## 📊 Tableau récapitulatif

| Champ | Valeur | Impact |
|-------|--------|--------|
| **Statut de l'offre** | Interne | Visible uniquement par internes |
| **Statut de l'offre** | Externe | Visible par tous |
| **Campagne** | 1, 2 ou 3 | Filtre dans le dashboard recruteur |
| **Date limite** | 21/10/2025 | Candidatures bloquées après |
| **Activer l'offre** | ON/OFF | Active ou inactive |

---

## ✨ Avantages du nouveau système

1. **Plus de flexibilité** : Créer des offres pour n'importe quelle campagne
2. **Plus de contrôle** : Le recruteur décide explicitement
3. **Plus simple** : Pas de calcul de dates automatique
4. **Plus robuste** : Si les dates changent, les offres ne sont pas impactées
5. **Plus clair** : On voit immédiatement à quelle campagne appartient une offre

---

## 🎓 Formation rapide

### Pour créer une offre "Interne only" pour Campagne 2 :

```
1. Créer une offre
2. Statut : Interne
3. Campagne : Campagne 2
4. Dates : 01/02/2026 (embauche) et 21/10/2025 (limite)
5. Publier
✅ C'est fait !
```

### Vérification

- Badge 🔵 "Interne" visible sur la carte
- Filtre "Campagne 2" dans le dashboard → L'offre apparaît
- Candidat externe → Ne voit pas l'offre
- Candidat interne → Voit l'offre

---

## 🚀 C'est prêt !

Le système est maintenant **100% opérationnel** avec sélection manuelle de campagne !

**Bonne gestion des campagnes !** 🎉

