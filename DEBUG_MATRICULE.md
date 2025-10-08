# Debug Vérification Matricule

## 🐛 Problèmes Corrigés

### Problème 1 : Timer lancé mais pas de vérification
**Cause :** La variable `MATRICULE_REQUIRED = false` validait automatiquement le matricule sans faire de requête.

**Solution :** 
- Retiré la logique `MATRICULE_REQUIRED`
- Validation basée uniquement sur `candidateStatus`

### Problème 2 : "Matricule vérifié" affiché sans vérification
**Cause :** `isMatriculeValid` était mis à `true` automatiquement au chargement.

**Solution :**
- Condition stricte : afficher uniquement si `lastVerifiedMatricule === matricule actuel`
- Ajout d'un loader pendant la vérification

### Problème 3 : Champs non désactivés après matricule
**À implémenter**

---

## ✅ Nouveau Comportement

### Étape 1 : Saisie du Matricule
```
Utilisateur tape: "1234"
↓
Console: ⏱️ Timer de vérification du matricule démarré (1s)...
↓
Affichage: [Loader] Vérification en cours...
```

### Étape 2 : Vérification (après 1s)
```
Console: 🔍 Vérification du matricule: 1234
↓
Requête RPC: supabase.rpc('verify_matricule', { p_matricule: '1234' })
↓
Console: ✅ Réponse vérification: { isValid: true }
```

### Étape 3 : Résultat
**Si valide :**
```
Console: ✅ Matricule valide
↓
Affichage: [✓] Matricule vérifié (bordure verte)
↓
Champs suivants: Débloqués
```

**Si invalide :**
```
Console: ❌ Matricule invalide
↓
Affichage: [⚠] Ce matricule n'est pas autorisé... (bordure rouge)
↓
Champs suivants: Bloqués
```

---

## 🔍 Logs Attendus dans la Console

### Scénario Complet
```javascript
// 1. Sélection candidat interne
// (aucun log)

// 2. Saisie matricule "1234"
⏱️ Timer de vérification du matricule démarré (1s)...

// 3. Après 1 seconde
🔍 Vérification du matricule: 1234

// 4. Réponse API
✅ Réponse vérification: { isValid: true, error: null }

// 5. Validation
✅ Matricule valide

// 6. Si on modifie le matricule
⏱️ Timer de vérification du matricule démarré (1s)...
🔍 Vérification du matricule: 5678
✅ Réponse vérification: { isValid: false, error: null }
❌ Matricule invalide
```

---

## 🧪 Test Manuel

### Test 1 : Matricule Valide
1. Ouvrir la console (F12)
2. Sélectionner "Candidat Interne"
3. Saisir un matricule valide (ex: "1234")
4. **Vérifier :**
   - [ ] Console affiche `⏱️ Timer...`
   - [ ] Message "Vérification en cours..." avec loader
   - [ ] Après 1s : `🔍 Vérification...`
   - [ ] Requête dans Network tab vers Supabase
   - [ ] Console affiche `✅ Matricule valide`
   - [ ] Message change pour "Matricule vérifié" avec bordure verte
   - [ ] Champs suivants débloqués

### Test 2 : Matricule Invalide
1. Saisir un matricule invalide (ex: "9999")
2. **Vérifier :**
   - [ ] Loader pendant 1 seconde
   - [ ] Requête vers Supabase
   - [ ] Message d'erreur rouge
   - [ ] Champs suivants bloqués

### Test 3 : Candidat Externe
1. Sélectionner "Candidat Externe"
2. **Vérifier :**
   - [ ] Pas de champ matricule affiché
   - [ ] Tous les champs actifs
   - [ ] Pas de logs de vérification

---

## 🔧 Code Modifié

### 1. Réinitialisation de la Validation
```typescript
useEffect(() => {
  // Réinitialiser la validation quand le matricule change
  if (signUpData.candidateStatus === "interne" && signUpData.matricule) {
    // Ne pas auto-valider, attendre la vérification
    setIsMatriculeValid(false);
    setMatriculeError("");
  } else if (signUpData.candidateStatus === "externe") {
    // Pour les externes, pas de matricule requis
    setIsMatriculeValid(true);
    setMatriculeError("");
  }
}, [signUpData.matricule, signUpData.candidateStatus]);
```

### 2. Fonction verifyMatricule
```typescript
const verifyMatricule = useCallback(async (): Promise<boolean> => {
  // Si externe, validation auto
  if (signUpData.candidateStatus === "externe") {
    return true;
  }

  // Vérifier le matricule vide
  if (!signUpData.matricule.trim()) {
    setMatriculeError("Le matricule est requis.");
    setIsMatriculeValid(false);
    return false;
  }

  // Cache: si déjà vérifié
  if (matricule === lastVerifiedMatricule && isMatriculeValid) {
    console.log('✅ Matricule déjà vérifié');
    return true;
  }

  // Vérification réelle
  setIsVerifyingMatricule(true);
  console.log('🔍 Vérification du matricule:', matricule);
  
  const { data: isValid, error } = await supabase.rpc('verify_matricule', {
    p_matricule: matricule,
  });
  
  // ... traitement de la réponse
}, [signUpData.matricule, signUpData.candidateStatus, lastVerifiedMatricule, isMatriculeValid]);
```

### 3. Timer de Vérification
```typescript
useEffect(() => {
  // Ne vérifier que pour candidats internes
  if (signUpData.candidateStatus !== "interne") return;
  if (!signUpData.matricule || signUpData.matricule.trim() === "") {
    setIsMatriculeValid(false);
    setMatriculeError("");
    return;
  }
  
  console.log('⏱️ Timer de vérification du matricule démarré (1s)...');
  const timer = setTimeout(() => {
    verifyMatricule();
  }, 1000);
  
  return () => clearTimeout(timer);
}, [signUpData.matricule, signUpData.candidateStatus, verifyMatricule]);
```

### 4. Affichage Conditionnel
```tsx
{/* Loader pendant vérification */}
{isVerifyingMatricule && (
  <p className="text-xs text-blue-600 flex items-center gap-1">
    <Loader2 className="w-3 h-3 animate-spin" />
    Vérification en cours...
  </p>
)}

{/* Succès uniquement si vraiment vérifié */}
{!isVerifyingMatricule && 
 isMatriculeValid && 
 signUpData.matricule.trim() === lastVerifiedMatricule && 
 !matriculeError && (
  <p className="text-xs text-green-600 flex items-center gap-1">
    <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
    Matricule vérifié
  </p>
)}
```

---

## ⚠️ Points d'Attention

### Si la console affiche seulement le timer
```
⏱️ Timer de vérification du matricule démarré (1s)...
⏱️ Timer de vérification du matricule démarré (1s)...
⏱️ Timer de vérification du matricule démarré (1s)...
```

**Cause possible :**
- Le callback `verifyMatricule` change à chaque render
- Créé une boucle infinie

**Solution :**
- Vérifier les dépendances du `useCallback`
- S'assurer que les états ne changent pas pendant la vérification

### Si aucune requête dans Network
**Causes possibles :**
1. Fonction `verify_matricule` n'existe pas dans Supabase
2. Erreur silencieuse dans le try/catch
3. Condition d'arrêt avant la requête

**Debug :**
```typescript
console.log('État avant requête:', {
  candidateStatus: signUpData.candidateStatus,
  matricule: signUpData.matricule,
  isVerifyingMatricule,
  isMatriculeValid,
  lastVerifiedMatricule
});
```

---

## ✅ Checklist de Validation

- [ ] Timer s'affiche dans la console
- [ ] Loader "Vérification en cours..." visible
- [ ] Après 1s, log `🔍 Vérification...`
- [ ] Requête visible dans Network tab
- [ ] Log de réponse API dans console
- [ ] Message "Matricule vérifié" ou erreur
- [ ] Champs suivants bloqués si matricule invalide

---

## 🚀 Prochaine Étape : Désactiver les Champs

Pour désactiver les champs suivants tant que le matricule n'est pas vérifié, les champs ont déjà la prop `disabled` :

```tsx
disabled={signUpData.candidateStatus === "interne" && !isMatriculeValid}
```

Cette condition est déjà en place pour :
- Téléphone
- Date de naissance
- Sexe
- Adresse
- Mot de passe
- Confirmation mot de passe

Donc les champs **sont déjà désactivés** tant que `isMatriculeValid === false` pour les candidats internes !
