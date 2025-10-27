# Contenu du fichier .env

## Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Configuration de l'API Azure Container Apps
VITE_AZURE_CONTAINER_APPS_API_KEY=your-api-key-here
```

## Instructions

1. **Créez le fichier** : Créez un fichier nommé `.env` à la racine du projet (même niveau que `package.json`)

2. **Ajoutez la clé API** : Remplacez `your-api-key-here` par votre vraie clé API

3. **Exemple complet** :
```env
# Configuration de l'API Azure Container Apps
VITE_AZURE_CONTAINER_APPS_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
```

## Variables d'environnement disponibles

| Variable | Description | Requis | Défaut |
|----------|-------------|--------|--------|
| `VITE_AZURE_CONTAINER_APPS_API_KEY` | Clé API pour l'authentification | ✅ Oui | - |
| `VITE_AZURE_CONTAINER_APPS_API_URL` | URL de base de l'API | ❌ Non | `https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io` |

## Sécurité

⚠️ **Important** :
- Ne commitez jamais le fichier `.env` dans Git
- Ajoutez `.env` à votre `.gitignore`
- Partagez la clé API de manière sécurisée
- Utilisez des clés différentes pour le développement et la production

## Utilisation

Une fois le fichier `.env` créé, redémarrez votre serveur de développement :

```bash
npm run dev
```

L'application utilisera automatiquement la clé API pour toutes les requêtes vers l'API Azure Container Apps.
