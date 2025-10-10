# ✅ Mode Campagne Activé - Guide de Vérification

**Date** : 9 octobre 2025, 17h15
**Statut** : ✅ Mode campagne ACTIVÉ

---

## 🎯 Comment ça fonctionne

### Offres affichées en mode campagne :

#### 1. 📋 Offres de campagne (3 postes)
- Directeur Juridique, Communication & RSE
- Directeur des Systèmes d'Information
- Directeur Audit & Contrôle interne
- ✅ **Toujours affichées**

#### 2. 🆕 Offres récentes (dernières 24 heures)
- Toute offre **créée** dans les dernières 24h
- Toute offre **modifiée** dans les dernières 24h
- ✅ **Automatiquement affichées** (même si le titre ne correspond pas à la campagne)

---

## 🧪 Test maintenant (2 minutes)

### 1. Rafraîchissez la page (Ctrl+F5)

### 2. Ouvrez la console (F12)

### 3. Cherchez ces logs pour votre offre "directeur des exploits"

**Vous devriez voir :**

```javascript
🕐 [CAMPAIGN] Détection offres récentes - Seuil: 2025-10-09T13:15:00.000Z

🔍 [CAMPAIGN DEBUG] "directeur des exploits": {
  created: "2025-10-09T15:30:00.000Z",  ← Date de création
  updated: "2025-10-09T15:30:00.000Z",  ← Date de modification
  threshold: "2025-10-09T13:15:00.000Z" ← Seuil (il y a 24h)
}

🆕 [CAMPAIGN] "directeur des exploits" - ✅ AFFICHÉE (créée récemment)
```

**Résumé final :**
```
✅ [CAMPAIGN] Offres affichées: 4
   - Offres de campagne: 3
   - Offres récentes (24h): 1
```

---

## ✅ Vérifications

### Si vous voyez `✅ AFFICHÉE (créée récemment)`

**→ L'offre DOIT apparaître dans la liste !**

**Si elle n'apparaît pas malgré ce log :**
1. Videz le cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Vérifiez que vous êtes sur la bonne page

### Si vous voyez `❌ MASQUÉE`

**Votre offre a plus de 24h.**

**Solutions :**

**A. Modifier l'offre pour réinitialiser le compteur**
1. Allez dans le dashboard recruteur
2. Cliquez "Modifier" sur votre offre
3. Changez n'importe quoi (même juste ajouter un espace)
4. Sauvegardez
5. ✅ L'offre apparaît maintenant pendant 24h

**B. Ajouter le titre à la liste de campagne**

Fichier : `src/config/campaign.ts`

```typescript
export const CAMPAIGN_JOBS = [
  "Directeur Juridique, Communication & RSE",
  "Directeur des Systèmes d'Information", 
  "Directeur Audit & Contrôle interne",
  "directeur des exploits"  // ← Ajoutez votre titre (EXACT)
];
```

---

## 📊 Logs attendus dans la console

### Pour les offres de campagne (anciennes)

```
🔍 [CAMPAIGN DEBUG] "Directeur Juridique, Communication & RSE": {
  created: "2025-09-15T10:00:00.000Z",  ← Ancienne
  updated: "2025-09-20T12:00:00.000Z",  ← Ancienne
  threshold: "2025-10-09T13:15:00.000Z"
}
📋 [CAMPAIGN] "Directeur Juridique, Communication & RSE" - ✅ CAMPAGNE
```

### Pour votre nouvelle offre (récente)

```
🔍 [CAMPAIGN DEBUG] "directeur des exploits": {
  created: "2025-10-09T15:30:00.000Z",  ← Aujourd'hui
  updated: "2025-10-09T15:30:00.000Z",  ← Aujourd'hui
  threshold: "2025-10-09T13:15:00.000Z" ← Il y a 24h
}
🆕 [CAMPAIGN] "directeur des exploits" - ✅ AFFICHÉE (créée récemment)
```

### Résumé final

```
✅ [CAMPAIGN] Offres affichées: 4
   - Offres de campagne: 3
   - Offres récentes (24h): 1
```

---

## 🔧 Comprendre le seuil de 24 heures

**Le seuil est calculé ainsi :**
```
Maintenant = 2025-10-09 17:15:00
Seuil (24h avant) = 2025-10-09 17:15:00 - 24h = 2025-10-08 17:15:00
```

**Une offre est "récente" si :**
- `created_at` >= Seuil (créée après le seuil)
- **OU** `updated_at` >= Seuil (modifiée après le seuil)

---

## 🎯 Astuce : Garder une offre visible

**Si vous voulez qu'une offre reste toujours visible :**

**Option 1 : La modifier régulièrement**
- Modifiez-la tous les jours → `updated_at` se met à jour
- Elle reste dans la fenêtre de 24h

**Option 2 : L'ajouter à CAMPAIGN_JOBS** (permanent)
```typescript
export const CAMPAIGN_JOBS = [
  "Directeur Juridique, Communication & RSE",
  "Directeur des Systèmes d'Information", 
  "Directeur Audit & Contrôle interne",
  "directeur des exploits"  // Permanent
];
```

**Option 3 : Changer le seuil à 7 jours** (pour toutes)

Fichiers à modifier :
- `src/hooks/useJobOffers.tsx` (ligne ~154)
- `src/hooks/useRecruiterDashboard.tsx` (ligne ~113)

```typescript
// Changer de 24h à 7 jours
const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
```

---

## ✅ Vérification finale

**Rafraîchissez (Ctrl+F5) et cherchez dans la console :**

```
🆕 [CAMPAIGN] "directeur des exploits" - ✅ AFFICHÉE (créée récemment)
```

**Si vous voyez ça → Votre offre est visible !** 🎉

---

**Rafraîchissez maintenant et dites-moi ce que vous voyez dans la console !** 🔍

