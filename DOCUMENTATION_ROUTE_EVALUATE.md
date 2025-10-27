# Utilisation de la route POST /evaluate

## Nouvelle fonctionnalité ajoutée

La route POST `/evaluate` de l'API Azure Container Apps a été intégrée pour permettre l'évaluation de candidats avec l'IA.

## Service API

### Méthode ajoutée
- **Fichier**: `src/integrations/azure-container-apps-api.ts`
- **Méthode**: `evaluateCandidate(evaluationData: EvaluationRequest)`

### Interfaces TypeScript

```typescript
export interface EvaluationRequest {
  candidate_id: string | number;
  job_title: string;
  cv_content: string;
  cover_letter_content: string;
  mtp_responses?: {
    metier: string[];
    talent: string[];
    paradigme: string[];
  };
}

export interface EvaluationResponse {
  score: number;
  verdict: string;
  comment: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
```

## Utilisation dans l'interface

### Page Observer (`src/pages/observer/Traitements_IA.tsx`)

#### Nouvelle fonction
- **Fonction**: `handleEvaluateCandidate(candidate: CandidateApplication)`
- **Bouton**: "Évaluer" (icône Brain)
- **Fonctionnalités**:
  - Vérification de la clé API
  - Préparation des données d'évaluation
  - Appel à l'API `/evaluate`
  - Affichage des résultats dans la console
  - Gestion des erreurs

#### Boutons d'action disponibles
1. **"Voir Résultats"** - Affiche les détails du candidat
2. **"Envoyer"** - Envoie les données vers `/api/candidats`
3. **"Évaluer"** - Évalue le candidat via `/evaluate` ✨ **NOUVEAU**

## Format des données envoyées

### Requête POST /evaluate
```json
{
  "candidate_id": 1,
  "job_title": "Data Scientist Senior",
  "cv_content": "Expériences solides en Data Science...",
  "cover_letter_content": "Très motivée par les projets data...",
  "mtp_responses": {
    "metier": ["Modèles supervisés", "Analyse de données"],
    "talent": ["Azure", "Python", "SQL"],
    "paradigme": ["Leadership", "Innovation"]
  }
}
```

### Réponse attendue
```json
{
  "score": 85.5,
  "verdict": "Favorable",
  "comment": "Candidat très qualifié avec une expérience solide...",
  "strengths": [
    "Expérience technique approfondie",
    "Compétences en IA et ML"
  ],
  "weaknesses": [
    "Manque d'expérience dans le secteur énergétique"
  ],
  "recommendations": [
    "Entretien technique approfondi",
    "Évaluation des compétences en leadership"
  ]
}
```

## Configuration requise

### Fichier .env
```env
VITE_AZURE_CONTAINER_APPS_API_KEY=your-api-key-here
```

### En-têtes d'authentification
```http
Content-Type: application/json
x-api-key: your-api-key-here
```

## Gestion des erreurs

- **401 Unauthorized** : Clé API invalide ou manquante
- **403 Forbidden** : Accès refusé
- **422 Unprocessable Entity** : Données d'évaluation invalides
- **500 Internal Server Error** : Erreur serveur

## Test de la fonctionnalité

### Script de test
- **Fichier**: `test-evaluate-api.js`
- **Utilisation**: `node test-evaluate-api.js`

### Tests inclus
1. **Évaluation complète** : Avec toutes les données (CV, lettre, MTP)
2. **Évaluation minimale** : Avec seulement les données obligatoires

## Logs et debug

### Console logs
- `🔍 ÉVALUATION DU CANDIDAT:` - Données envoyées
- `✅ Évaluation réussie:` - Résultats de l'API
- `📊 Score:` - Score obtenu
- `🎯 Verdict:` - Verdict de l'IA
- `💬 Commentaire:` - Commentaire détaillé
- `💪 Points forts:` - Liste des forces
- `⚠️ Points à améliorer:` - Liste des faiblesses
- `📝 Recommandations:` - Liste des recommandations

## Interface utilisateur

### Indicateurs de statut
- **Succès** : "Évaluation effectuée avec succès" (vert)
- **Erreur** : Message d'erreur spécifique (rouge)
- **Chargement** : Bouton désactivé pendant l'évaluation

### Boutons responsives
- **Desktop** : Texte complet ("Évaluer")
- **Mobile** : Texte abrégé ("Éval")
- **Chargement** : Texte de progression ("Éval...")

## Prochaines étapes

1. ✅ Intégration de la route `/evaluate`
2. ✅ Interface utilisateur avec bouton "Évaluer"
3. ✅ Gestion des erreurs et logs
4. ✅ Script de test
5. 🔄 Affichage des résultats dans l'interface (à implémenter)
6. 🔄 Sauvegarde des résultats d'évaluation (à implémenter)
7. 🔄 Comparaison des candidats (à implémenter)
