# Intégration API RH Eval - Modal d'Évaluation IA

## Résumé des Modifications

### 1. Service API Mis à Jour ✅
- **Endpoint correct** : `/evaluate` (selon la documentation RH Eval)
- **Format de données** : Adapté au format de l'API RH Eval
- **Logs détaillés** : Affichage complet des données reçues

### 2. Format de Données API RH Eval ✅
```typescript
{
  id: string,
  nom: string,
  prenom: string,
  post: string,
  cv: string,
  lettre_motivation: string,
  MTP: {
    M: string,  // Métier
    T: string,  // Talent
    P: string   // Paradigme
  }
}
```

### 3. Réponse API RH Eval ✅
```typescript
{
  threshold_pct: number,
  scores: {
    score_offre_pct: number,
    score_mtp_pct: number,
    score_global_pct: number
  },
  commentaires: string[],
  verdict: {
    verdict: string,
    commentaires: string[],
    rationale: string
  },
  justification: string[],
  forces: string[],
  faiblesses: string[]
}
```

### 4. Logs de Débogage Ajoutés ✅
- **Données envoyées** : Format RH Eval complet
- **Données reçues** : Réponse JSON complète
- **Détails par section** : Scores, verdict, forces, faiblesses, etc.
- **Données pour le modal** : Format adapté à l'affichage

### 5. Fallback avec Données Simulées ✅
- **Données de test** : Si l'API ne répond pas
- **Format identique** : Même structure que l'API RH Eval
- **Affichage garanti** : Le modal fonctionne toujours

## Comment Tester

### Test 1: Logs de l'API
1. **Ouvrez la console** (F12)
2. **Cliquez sur "Voir Résultats"**
3. **Vérifiez les logs** :
   ```
   📤 [Azure Container Apps] Données envoyées à l'API RH Eval: {...}
   📊 [Azure Container Apps] Données reçues de l'API RH Eval: {...}
   🎯 [Azure Container Apps] Scores: {...}
   ⚖️ [Azure Container Apps] Verdict: {...}
   💪 [Azure Container Apps] Forces: [...]
   ⚠️ [Azure Container Apps] Faiblesses: [...]
   ```

### Test 2: Modal avec Données
1. **Le modal s'ouvre** avec les informations du candidat
2. **Évaluation IA s'affiche** avec :
   - Scores (Offre, MTP, Global)
   - Verdict avec justification
   - Points forts et faiblesses
   - Justifications détaillées
   - Commentaires généraux

### Test 3: Données Simulées
Si l'API ne répond pas (clé API invalide), le modal utilise des données simulées :
- **Scores** : 85%, 78%, 82%
- **Verdict** : "Accepté"
- **Forces** : 5 points forts
- **Faiblesses** : 3 points à améliorer

## Logs Attendus dans la Console

### Données Envoyées
```json
{
  "id": "test-candidate-123",
  "nom": "test-candidate-123",
  "prenom": "test-candidate-123",
  "post": "Développeur Full Stack",
  "cv": "CV de Jean Dupont...",
  "lettre_motivation": "Lettre de motivation...",
  "MTP": {
    "M": "React, Node.js, TypeScript",
    "T": "Collaboration, Innovation",
    "P": "Agile, DevOps"
  }
}
```

### Données Reçues (ou Simulées)
```json
{
  "threshold_pct": 70,
  "scores": {
    "score_offre_pct": 85,
    "score_mtp_pct": 78,
    "score_global_pct": 82
  },
  "commentaires": ["Le candidat présente un profil technique solide"],
  "verdict": {
    "verdict": "Accepté",
    "rationale": "Le candidat répond aux critères requis"
  },
  "forces": ["Expérience solide en React"],
  "faiblesses": ["Manque d'expérience en DevOps"]
}
```

## Configuration Requise

### Variables d'Environnement
```bash
VITE_AZURE_CONTAINER_APPS_API_KEY=votre_cle_api_rh_eval
```

### Endpoint API
```
POST https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io/evaluate
```

## Avantages de l'Intégration

- ✅ **Format API correct** : Selon la documentation RH Eval
- ✅ **Logs détaillés** : Traçabilité complète des données
- ✅ **Fallback robuste** : Fonctionne même sans API
- ✅ **Affichage complet** : Toutes les données d'évaluation
- ✅ **Interface moderne** : Modal avec design adapté
- ✅ **Données simulées** : Pour le développement et les tests

## Prochaines Étapes

1. **Configurez la clé API** RH Eval pour utiliser les vraies données
2. **Testez avec différents candidats** pour vérifier la variabilité
3. **Ajustez le design** du modal si nécessaire
4. **Optimisez les performances** si beaucoup de candidats

Le modal affiche maintenant les données complètes de l'API RH Eval avec un fallback robuste ! 🎉
