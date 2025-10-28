# Configuration API Réelle - Sans Fallback Automatique

## 🎯 Objectif

Cette configuration désactive le fallback automatique vers des données simulées et force l'utilisation de l'API Azure Container Apps réelle en production.

## 🔧 Modifications apportées

### 1. Fichier `src/integrations/azure-container-apps-api.ts`

**Constructeur modifié :**
```typescript
constructor() {
  // Configuration pour utiliser l'API réelle en production
  if (import.meta.env.DEV) {
    this.baseUrl = '/api/rh-eval';
  } else {
    // En production, utiliser l'URL directe de l'API Azure Container Apps
    this.baseUrl = 'https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io';
  }
  this.timeout = 30000; // 30 secondes
  this.apiKey = import.meta.env.VITE_AZURE_CONTAINER_APPS_API_KEY || 'test-key-12345';
}
```

**Gestion d'erreur simplifiée :**
```typescript
} catch (error) {
  console.error('❌ [Azure Container Apps] Erreur lors de l\'évaluation:', error);
  
  // Retourner l'erreur réelle sans fallback automatique
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Timeout: L\'API n\'a pas répondu dans les temps',
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
  
  return {
    success: false,
    error: 'Erreur inconnue lors de l\'évaluation',
  };
}
```

## ⚠️ Conséquences

### ✅ Avantages
- **Données réelles** : Utilisation de l'API Azure Container Apps
- **Transparence** : Les erreurs sont visibles et débogables
- **Contrôle total** : Pas de fallback automatique masquant les problèmes

### ❌ Inconvénients
- **Erreurs CORS** : Peuvent bloquer l'évaluation en production
- **Dépendance réseau** : L'application dépend de la disponibilité de l'API
- **Expérience utilisateur** : Les erreurs peuvent interrompre le workflow

## 🚀 Déploiement

### Option 1 : Déploiement direct
```bash
npm run build
# Déployer sur votre plateforme (Vercel, Netlify, etc.)
```

### Option 2 : Script de déploiement
```bash
chmod +x deploy-api-reelle.sh
./deploy-api-reelle.sh
```

## 🔧 Solutions en cas d'erreur CORS

### 1. Configurer CORS sur l'API Azure Container Apps
Ajouter les en-têtes CORS suivants :
```
Access-Control-Allow-Origin: https://www.seeg-talentsource.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key
```

### 2. Utiliser un proxy serveur
- **Vercel** : Déployer le proxy `api/rh-eval-proxy.ts`
- **Nginx** : Configurer un proxy_pass
- **Apache** : Configurer un ProxyPass

### 3. Réactiver le fallback automatique
Si nécessaire, remettre le code de fallback dans `azure-container-apps-api.ts`

## 📝 Tests

### Test de configuration
```bash
node test-config-api-reelle.js
```

### Test en production
1. Déployer la configuration
2. Tester l'évaluation automatique
3. Vérifier les logs de la console
4. Ajuster selon les résultats

## 🎯 Résultat attendu

Avec cette configuration :
- ✅ L'application utilise l'API Azure Container Apps réelle
- ✅ Les données d'évaluation sont authentiques
- ✅ Les erreurs sont visibles et débogables
- ⚠️ Les erreurs CORS peuvent bloquer l'évaluation

## 📞 Support

En cas de problème :
1. Vérifier les logs de la console
2. Tester la connectivité à l'API
3. Configurer CORS ou utiliser un proxy
4. Réactiver le fallback si nécessaire
