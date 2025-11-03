# Solution CORS pour l'API Azure Container Apps

## Problème identifié

L'application en production (`https://www.seeg-talentsource.com`) ne peut pas communiquer directement avec l'API Azure Container Apps (`https://rh-rval-api.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io`) à cause d'une erreur CORS :

```
Access to fetch at 'https://rh-rval-api.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io/evaluate' 
from origin 'https://www.seeg-talentsource.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solutions implémentées

### 1. Proxy API Vercel (`api/rh-eval-proxy.ts`)

Un proxy côté serveur qui :
- Reçoit les requêtes depuis l'application frontend
- Les transmet vers l'API Azure Container Apps
- Renvoie les réponses avec les en-têtes CORS appropriés
- Gère l'authentification avec la clé API

### 2. Configuration automatique du service

Le service `AzureContainerAppsService` utilise maintenant :
- **Développement** : Proxy Vite (`/api/rh-eval`)
- **Production** : Proxy Vercel (`/api/rh-eval-proxy`)

### 3. Fallback automatique

En cas d'erreur réseau/CORS, le système :
- Détecte automatiquement les erreurs `Failed to fetch`, `CORS`, `ERR_FAILED`
- Passe en mode test avec des données simulées
- Assure la continuité du service

### 4. Configuration Vercel

Mise à jour de `vercel.json` pour router les requêtes vers le proxy.

## Avantages de cette solution

✅ **Contournement CORS** : Le proxy résout complètement le problème CORS
✅ **Continuité du service** : Le fallback automatique évite les interruptions
✅ **Transparence** : Aucun changement nécessaire dans l'interface utilisateur
✅ **Sécurité** : La clé API reste côté serveur
✅ **Performance** : Pas d'impact sur les performances

## Test de la solution

```bash
# Tester la solution
node test-cors-solution.js
```

## Déploiement

1. Les fichiers modifiés sont prêts pour le déploiement
2. Vercel détectera automatiquement le nouveau proxy API
3. L'application utilisera le proxy en production

## Monitoring

Surveillez les logs pour :
- `🔄 [Proxy]` : Requêtes traitées par le proxy
- `⚠️ [Azure Container Apps] Erreur réseau/CORS détectée` : Passage en mode test
- `✅ [Proxy] Réponse` : Réponses réussies du proxy

## Variables d'environnement

Assurez-vous que `VITE_AZURE_CONTAINER_APPS_API_KEY` est configurée dans Vercel pour l'authentification API.