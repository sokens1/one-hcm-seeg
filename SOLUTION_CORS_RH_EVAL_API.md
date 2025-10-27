# Solution CORS pour l'API RH Eval

## 🚨 Problème identifié

L'application frontend (localhost:8081) ne peut pas communiquer directement avec l'API RH Eval (`https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io`) à cause des restrictions CORS (Cross-Origin Resource Sharing).

**Erreur :**
```
Access to fetch at 'https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io/evaluate' 
from origin 'http://localhost:8081' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔧 Solution implémentée

### 1. **Proxy de développement dans Vite**

Ajout d'un proxy dans `vite.config.ts` pour rediriger les requêtes vers l'API RH Eval :

```typescript
server: {
  proxy: {
    '/api/rh-eval': {
      target: 'https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/rh-eval/, ''),
      configure: (proxy, _options) => {
        proxy.on('error', (err, _req, _res) => {
          console.log('proxy error', err);
        });
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log('Sending Request to the Target:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        });
      },
    },
  },
}
```

### 2. **Modification du service Azure Container Apps**

Modification de `src/integrations/azure-container-apps-api.ts` pour utiliser le proxy en développement :

```typescript
constructor() {
  // En développement, utiliser le proxy pour éviter les problèmes CORS
  if (import.meta.env.DEV) {
    this.baseUrl = '/api/rh-eval';
  } else {
    this.baseUrl = 'https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io';
  }
  this.timeout = 30000; // 30 secondes
  this.apiKey = import.meta.env.VITE_AZURE_CONTAINER_APPS_API_KEY || null;
}
```

## 🔄 Comment ça fonctionne

1. **En développement** (`npm run dev`) :
   - Les requêtes vers `/api/rh-eval/*` sont automatiquement redirigées vers l'API RH Eval
   - Le proxy Vite gère les en-têtes CORS et l'authentification
   - L'application frontend communique avec `localhost:8080/api/rh-eval` (même origine)

2. **En production** :
   - Les requêtes vont directement vers l'API RH Eval
   - Le serveur de production doit gérer les en-têtes CORS appropriés

## 🧪 Test de la solution

1. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Vérifier les logs** :
   - Les requêtes proxy devraient apparaître dans la console
   - Les réponses de l'API RH Eval devraient être visibles

3. **Tester l'évaluation IA** :
   - Ouvrir une modal de candidat dans "Avancé IA"
   - Cliquer sur "Voir les résultats"
   - Vérifier que les données de l'API RH Eval s'affichent

## 📝 Notes importantes

- **Cette solution ne fonctionne qu'en développement**
- **En production**, il faudra soit :
  - Configurer les en-têtes CORS sur l'API RH Eval
  - Utiliser un proxy côté serveur (Nginx, Apache, etc.)
  - Déployer l'application sur le même domaine que l'API

## 🔍 Debugging

Si le problème persiste :

1. **Vérifier les logs du proxy** dans la console du serveur de développement
2. **Vérifier la clé API** : `VITE_AZURE_CONTAINER_APPS_API_KEY`
3. **Tester l'API directement** avec curl ou Postman
4. **Vérifier les en-têtes** dans l'onglet Network des DevTools

## 🚀 Prochaines étapes

1. **Tester la solution** avec un candidat réel
2. **Vérifier l'affichage** des données dans les modales
3. **Documenter** la configuration pour la production
4. **Considérer** une solution permanente côté serveur
