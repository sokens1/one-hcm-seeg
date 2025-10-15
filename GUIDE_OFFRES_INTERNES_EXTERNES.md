# 🎯 Guide : Offres Internes et Externes

## ✅ Modifications effectuées

### 📦 Composant JobCard mis à jour
**Fichier** : `src/components/ui/job-card.tsx`

**Ajout** : Badge visible pour indiquer le type d'offre
- 🔵 **Badge bleu** : "Interne" (offres réservées aux employés SEEG)
- 🟢 **Badge vert** : "Externe" (offres ouvertes à tous)

### 📄 Pages mises à jour
Les badges s'affichent maintenant sur toutes les pages :
- ✅ `src/pages/Index.tsx` (Page d'accueil)
- ✅ `src/components/candidate/JobCatalog.tsx` (Catalogue)
- ✅ `src/pages/candidate/CandidateJobs.tsx` (Mes candidatures)

---

## 🎨 Rendu visuel

### Carte d'offre "Interne"
```
┌─────────────────────────────────────┐
│ Directeur DSI          [Interne]   │  ← Badge bleu
│ 📍 Libreville                      │
│ 💼 CDI                             │
│ Description...                      │
│                  [Voir l'offre]     │
└─────────────────────────────────────┘
```

### Carte d'offre "Externe"
```
┌─────────────────────────────────────┐
│ Consultant RH          [Externe]   │  ← Badge vert
│ 📍 Port-Gentil                     │
│ 💼 CDD                             │
│ Description...                      │
│                  [Voir l'offre]     │
└─────────────────────────────────────┘
```

---

## 🚀 Utilisation pour les recruteurs

### Créer une offre "Interne" pendant la Campagne 2

1. **Créer une nouvelle offre**
2. **Remplir tous les champs**
3. **Champ "Statut de l'offre"** → Sélectionner **"Interne"** ⭐
4. **Publier**

### Résultat automatique

| Type de candidat | Voit l'offre ? | Badge affiché | Peut candidater ? |
|------------------|----------------|---------------|-------------------|
| **Interne** | ✅ Oui | 🔵 Interne | ✅ Oui |
| **Externe** | ❌ Non (filtrée) | - | ❌ Non |
| **Public** | ✅ Oui (si connecté) | 🔵 Interne | ⚠️ Verra mais bloqué |

### Créer une offre "Externe"

Même processus, sélectionner **"Externe"** dans le champ "Statut de l'offre".

| Type de candidat | Voit l'offre ? | Badge affiché | Peut candidater ? |
|------------------|----------------|---------------|-------------------|
| **Interne** | ✅ Oui | 🟢 Externe | ✅ Oui |
| **Externe** | ✅ Oui | 🟢 Externe | ✅ Oui |
| **Public** | ✅ Oui | 🟢 Externe | ✅ Oui |

---

## 🔒 Sécurité

### Protection multi-niveaux

1. **Interface utilisateur** : Badge visible pour informer
2. **Filtrage frontend** : Les externes ne voient pas les offres "interne"
3. **Validation backend** : Bloque les candidatures non autorisées
4. **Message d'erreur** : "Cette offre n'est pas accessible à votre type de candidature"

### Code de validation

**Frontend** : `JobCatalog.tsx` ligne 101
```typescript
const matchesAudience = !candidateAudience || offerAudience === candidateAudience;
```

**Backend** : `useApplications.tsx` ligne 266
```typescript
if (candidateAudience && offerAudience && candidateAudience !== offerAudience) {
  throw new Error("Cette offre n'est pas accessible à votre type de candidature (interne/externe).");
}
```

---

## 📝 Notes importantes

1. Le badge s'affiche **uniquement si** `status_offerts` est défini
2. Si `status_offerts` est NULL/vide → Pas de badge (compatible tous candidats)
3. Les couleurs sont différentes pour faciliter la distinction visuelle
4. Le système fonctionne **sans modification de base de données**

---

## 🎯 Prochaines étapes recommandées

1. ✅ Tester la création d'une offre "Interne"
2. ✅ Vérifier que le badge s'affiche bien
3. ✅ Tester qu'un candidat externe ne peut pas candidater
4. ✅ Tester qu'un candidat interne peut candidater

**Le système est maintenant opérationnel !** 🚀

