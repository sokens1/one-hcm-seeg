# Configuration CORS Azure API

## ⚠️ Erreur CORS Actuelle

### Erreur Console
```
Access to fetch at 'https://seeg-backend-api.azurewebsites.net/api/v1/auth/login' 
from origin 'http://localhost:8080' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Explication
Cette erreur est **normale en développement local** et ne peut être corrigée que **côté backend Azure**.

---

## 🔧 Solution : Configuration CORS Backend

### Option 1 : Via Azure Portal

1. **Accéder à l'API Azure** :
   - Ouvrir https://portal.azure.com
   - Aller sur l'App Service : `seeg-backend-api`

2. **Configurer CORS** :
   - Menu latéral : `CORS`
   - Ajouter les origines autorisées :
     ```
     http://localhost:8080
     http://localhost:5173
     http://localhost:3000
     https://www.seeg-talentsource.com
     https://one-hcm-seeg-testprod.vercel.app
     ```

3. **Cocher** : 
   - ✅ Enable Access-Control-Allow-Credentials

4. **Sauvegarder**

### Option 2 : Via Code Python (FastAPI)

Dans le fichier backend (FastAPI) :

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Liste des origines autorisées
origins = [
    "http://localhost:8080",      # Dev local Vite
    "http://localhost:5173",       # Dev local Vite (port alternatif)
    "http://localhost:3000",       # Dev local React
    "https://www.seeg-talentsource.com",
    "https://one-hcm-seeg-testprod.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Option 3 : Via Variables d'Environnement

Modifier la variable `ALLOWED_ORIGINS` dans Azure App Service :

```bash
ALLOWED_ORIGINS="http://localhost:8080,http://localhost:5173,https://www.seeg-talentsource.com,https://one-hcm-seeg-testprod.vercel.app"
```

Puis dans le code backend :
```python
import os

origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 Vérifier la Configuration

### Test 1 : Console DevTools
Après configuration, la requête devrait passer sans erreur CORS.

### Test 2 : Network Tab
Vérifier les headers de réponse :
```
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: *
```

### Test 3 : Requête OPTIONS (Preflight)
Une requête OPTIONS doit précéder chaque POST/PUT/DELETE et retourner 200.

---

## 🚫 Contournement Temporaire (Développement)

### Option A : Extension Chrome "CORS Unblock"
1. Installer l'extension
2. Activer pour `localhost:8080`
3. **⚠️ Uniquement pour développement !**

### Option B : Désactiver la sécurité Chrome (Non recommandé)
```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\chrome-dev"

# Mac
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome-dev"
```
**⚠️ Ne jamais utiliser en production !**

### Option C : Proxy Vite (Recommandé pour dev)

Modifier `vite.config.ts` :
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://seeg-backend-api.azurewebsites.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

Puis dans le code frontend :
```typescript
// AVANT
const API_BASE_URL = 'https://seeg-backend-api.azurewebsites.net';

// APRÈS (en dev)
const API_BASE_URL = import.meta.env.DEV 
  ? '' // Utilise le proxy Vite
  : 'https://seeg-backend-api.azurewebsites.net';
```

---

## 📋 Checklist Configuration

### Backend Azure
- [ ] Origines autorisées configurées dans CORS
- [ ] `Access-Control-Allow-Credentials: true`
- [ ] Middleware CORS activé dans le code FastAPI
- [ ] Variable `ALLOWED_ORIGINS` configurée
- [ ] Redémarrage de l'App Service après modifications

### Frontend
- [ ] URLs des API configurées correctement
- [ ] Proxy Vite configuré (optionnel pour dev)
- [ ] Test de connexion réussi
- [ ] Test d'inscription réussi

---

## 🎯 Recommandation

**Pour l'instant (développement) :**
1. ✅ Configurer le proxy Vite (solution la plus propre)
2. ✅ Demander à l'équipe backend d'ajouter `localhost:8080` aux origines

**Pour la production :**
1. ✅ Configurer uniquement les domaines de production
2. ✅ Ne jamais autoriser `*` (wildcard)
3. ✅ Utiliser HTTPS uniquement

---

## 📞 Contact Backend

Pour résoudre le problème CORS, contactez l'équipe backend avec cette demande :

```
Bonjour,

Pouvez-vous ajouter les origines suivantes dans la configuration CORS 
de l'API Azure (seeg-backend-api.azurewebsites.net) ?

Développement :
- http://localhost:8080
- http://localhost:5173

Production :
- https://www.seeg-talentsource.com
- https://one-hcm-seeg-testprod.vercel.app

Configuration requise :
- Allow-Credentials: true
- Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
- Allow-Headers: *

Merci !
```

---

## ✅ Une fois CORS configuré

L'authentification Azure fonctionnera correctement et vous verrez dans la console :
```
🔐 Tentative de connexion avec Azure API...
✅ Connexion réussie: { id: "...", email: "...", role: "candidate" }
```

Au lieu de :
```
❌ Erreur connexion: Failed to fetch
```
