# Configuration de la clé API Azure Container Apps

## Variables d'environnement requises

Pour utiliser l'API Azure Container Apps avec authentification, vous devez configurer la clé API suivante :

### Fichier .env

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Configuration de l'API Azure Container Apps
VITE_AZURE_CONTAINER_APPS_API_KEY=your-api-key-here
```

### Configuration alternative

Si vous ne souhaitez pas utiliser de fichier `.env`, vous pouvez définir la clé API directement dans le code :

```typescript
import { azureContainerAppsService } from '@/integrations/azure-container-apps-api';

// Définir la clé API
azureContainerAppsService.setApiKey('your-api-key-here');
```

## Utilisation

### 1. Vérification de la clé API

```typescript
import { azureContainerAppsService } from '@/integrations/azure-container-apps-api';

// Vérifier si la clé API est configurée
if (azureContainerAppsService.hasApiKey()) {
  console.log('Clé API configurée');
} else {
  console.log('Clé API manquante');
}
```

### 2. Envoi de données avec authentification

```typescript
const candidateData = {
  id: 1,
  Nom: "Doe",
  Prénom: "Jane",
  cv: "Contenu du CV...",
  lettre_motivation: "Lettre de motivation...",
  MTP: {
    M: "Métier",
    T: "Talent", 
    P: "Paradigme"
  },
  post: "Poste"
};

const result = await azureContainerAppsService.sendCandidateData(candidateData);
```

## En-têtes d'authentification

L'API utilise l'en-tête `x-api-key` pour l'authentification :

```http
POST /api/candidats HTTP/1.1
Host: rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io
Content-Type: application/json
x-api-key: your-api-key-here

{
  "id": 1,
  "Nom": "Doe",
  "Prénom": "Jane",
  ...
}
```

## Gestion des erreurs d'authentification

Le service gère automatiquement les erreurs d'authentification :

- **401 Unauthorized** : Clé API invalide ou manquante
- **403 Forbidden** : Accès refusé

## Test de l'API

Utilisez le script de test fourni :

```bash
# Définir la clé API comme variable d'environnement
export AZURE_CONTAINER_APPS_API_KEY=your-api-key-here

# Exécuter les tests
node test-azure-container-apps-api.js
```

## Sécurité

⚠️ **Important** : 
- Ne commitez jamais votre clé API dans le code source
- Utilisez toujours des fichiers `.env` pour les variables sensibles
- Ajoutez `.env` à votre `.gitignore`
- Partagez la clé API de manière sécurisée avec votre équipe
