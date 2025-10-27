# Migration de l'API momo.com vers Azure Container Apps

## Résumé des changements

L'API momo.com a été remplacée par l'API Azure Container Apps officielle pour le traitement des données de candidats.

### Nouvelle API
- **URL de base**: `https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io`
- **Documentation**: https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io/docs

## Fichiers modifiés

### 1. Script de démonstration
- **Fichier**: `demo-send.js`
- **Changements**: 
  - URL mise à jour vers l'API Azure Container Apps
  - Messages de log adaptés

### 2. Service API
- **Fichier**: `src/integrations/azure-container-apps-api.ts` (nouveau)
- **Fonctionnalités**:
  - Vérification de connectivité (`checkConnection()`)
  - Envoi de données candidat (`sendCandidateData()`)
  - Récupération des candidats (`getCandidates()`)
  - Analyse de candidat (`analyzeCandidate()`)
  - Gestion des timeouts et erreurs

### 3. Page Observer
- **Fichier**: `src/pages/observer/Traitements_IA.tsx`
- **Changements**:
  - Import du nouveau service Azure Container Apps
  - Remplacement des références "momo.com" par "Azure Container Apps API"
  - Ajout de la fonction `handleSendToAPI()`
  - Ajout du bouton "Envoyer" dans l'interface
  - Ajout des états de gestion d'envoi (`isSending`, `sendStatus`, `sendMessage`)
  - Indicateur de statut d'envoi dans l'interface

### 4. Page Recruiter
- **Fichier**: `src/pages/recruiter/Traitements_IA.tsx`
- **Changements**:
  - Import du nouveau service Azure Container Apps
  - Remplacement des références "momo.com" par "Azure Container Apps API"
  - Ajout de la fonction `handleSendToAPI()`
  - Ajout des états de gestion d'envoi
  - Indicateur de statut d'envoi dans l'interface
  - Mise à jour de l'appel à `createColumns()` avec les nouveaux paramètres

### 5. Composant DataTable
- **Fichier**: `src/components/ai/columns.tsx`
- **Changements**:
  - Ajout de l'icône `Send` dans les imports
  - Modification de la fonction `createColumns()` pour accepter une fonction d'envoi
  - Ajout du bouton "Envoyer" dans la colonne Actions
  - Gestion de l'état d'envoi (`isSending`)

### 6. Hook de données
- **Fichier**: `src/hooks/useSEEGAIData.tsx`
- **Changements**:
  - Mise à jour du commentaire pour référencer l'API Azure Container Apps

## Fonctionnalités ajoutées

### Bouton d'envoi
- Bouton "Envoyer" disponible sur chaque candidat
- État de chargement pendant l'envoi
- Désactivation du bouton pendant l'envoi
- Indicateur visuel du statut d'envoi

### Gestion des erreurs
- Timeout de 30 secondes pour les requêtes
- Gestion des erreurs de réseau
- Messages d'erreur explicites
- Fallback en cas d'échec

### Interface utilisateur
- Indicateur de statut d'envoi (succès/erreur)
- Messages informatifs pour l'utilisateur
- Interface responsive (desktop et mobile)

## Structure des données envoyées

Les données sont envoyées au format suivant :

```json
{
  "id": "string|number",
  "Nom": "string",
  "Prénom": "string", 
  "cv": "string",
  "lettre_motivation": "string",
  "MTP": {
    "M": "string",
    "T": "string", 
    "P": "string"
  },
  "post": "string"
}
```

## Script de test

Un script de test a été créé : `test-azure-container-apps-api.js`

**Utilisation**:
```bash
node test-azure-container-apps-api.js
```

Le script teste :
- La connectivité à l'API (`/health`)
- L'envoi de données (`POST /api/candidats`)
- La récupération de données (`GET /api/candidats`)

## Endpoints API utilisés

- `GET /health` - Vérification de connectivité
- `POST /api/candidats` - Envoi de données candidat
- `GET /api/candidats` - Récupération des candidats
- `POST /api/candidats/{id}/analyze` - Analyse d'un candidat

## Authentification

L'API Azure Container Apps nécessite une clé d'authentification via l'en-tête `x-api-key`.

### Configuration

1. **Variable d'environnement** (recommandé) :
   ```env
   VITE_AZURE_CONTAINER_APPS_API_KEY=your-api-key-here
   ```

2. **Configuration programmatique** :
   ```typescript
   import { azureContainerAppsService } from '@/integrations/azure-container-apps-api';
   azureContainerAppsService.setApiKey('your-api-key-here');
   ```

### En-têtes d'authentification

Toutes les requêtes incluent automatiquement :
```http
x-api-key: your-api-key-here
Content-Type: application/json
```

## Notes importantes

1. **Compatibilité**: Le format des données reste identique à celui utilisé avec momo.com
2. **Sécurité**: Clé API requise pour l'authentification
3. **Performance**: Timeout de 30 secondes configuré
4. **Fallback**: L'application continue de fonctionner même si l'API est indisponible
5. **Logs**: Tous les envois sont loggés dans la console pour le debug
6. **Authentification**: Gestion automatique des erreurs 401/403

## Prochaines étapes

1. Tester l'intégration avec l'API réelle
2. Ajuster les endpoints si nécessaire selon la documentation officielle
3. Ajouter l'authentification si requise
4. Optimiser la gestion des erreurs selon les retours de l'API
