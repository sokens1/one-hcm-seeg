# Configuration API SEEG AI

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env` :

```env
# Configuration API SEEG AI
VITE_SEEG_AI_API_URL=https://seeg-ai-api.azurewebsites.net
VITE_SEEG_AI_API_KEY=your_api_key_here
```

## Fonctionnalités implémentées

### 1. Service API SEEG AI
- **Fichier**: `src/integrations/seeg-ai-api.ts`
- **Fonctionnalités**:
  - Recherche de candidats par nom
  - Analyse IA de candidats
  - Récupération des données de traitement IA
  - Traitement IA de candidats spécifiques
  - Vérification de la connectivité

### 2. Hook personnalisé
- **Fichier**: `src/hooks/useSEEGAIData.tsx`
- **Fonctionnalités**:
  - Gestion de l'état de connexion
  - Recherche en temps réel
  - Analyse de candidats
  - Traitement IA

### 3. Configuration
- **Fichier**: `src/config/seeg-ai.ts`
- **Contient**:
  - URL de base de l'API
  - Endpoints disponibles
  - Types TypeScript
  - Configuration des timeouts

### 4. Pages modifiées
- **Observer**: `src/pages/observer/Traitements_IA.tsx`
- **Recruiter**: `src/pages/recruiter/Traitements_IA.tsx`

**Nouvelles fonctionnalités**:
- Recherche en temps réel avec debounce
- Indicateur de statut de connexion API
- Indicateur de recherche en cours
- Fallback vers données statiques si API indisponible

### 5. Boutons activés
- Bouton "Traitement IA" dans `EvaluationDashboard.tsx`
- Bouton "Avancé (IA)" dans `DashboardToggle.tsx`

## Utilisation

1. **Recherche de candidats**: Tapez un nom dans la barre de recherche
2. **Statut API**: Vérifiez l'indicateur de connexion en haut de la page
3. **Traitement IA**: Utilisez le bouton "Traitement IA" pour analyser un candidat

## Endpoints API attendus

- `GET /api/candidates/search?q={searchTerm}&page={page}&limit={limit}`
- `POST /api/candidates/analyze/{candidateId}`
- `GET /api/ai-data`
- `POST /api/candidates/process/{candidateId}`
- `GET /health`

## Gestion d'erreurs

- Fallback automatique vers données statiques si API indisponible
- Messages d'erreur utilisateur
- Logs détaillés dans la console
- Indicateurs visuels de statut
