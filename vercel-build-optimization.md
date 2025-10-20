# 🚀 Optimisation Build Vercel

## Problèmes courants et solutions

### 1. Erreur "An unexpected error happened"

**Causes possibles :**
- Timeout de build (> 15 minutes)
- Mémoire insuffisante
- Variables d'environnement manquantes
- Dependencies trop lourdes

### 2. Solutions

#### A. Optimiser les chunks (recommandé)
Ajouter dans `vite.config.ts` :

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          charts: ['recharts'],
          utils: ['date-fns', 'lodash']
        }
      }
    }
  }
})
```

#### B. Variables d'environnement requises
Vérifier dans Vercel Dashboard → Settings → Environment Variables :

```
SUPABASE_WEBHOOK_SECRET=your_secret
AZURE_ADMIN_TOKEN=your_token
VITE_AZURE_API_URL=https://seeg-backend-api.azurewebsites.net/api/v1
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
SMTP_FROM=One HCM <noreply@example.com>
```

#### C. Réduire la taille des chunks
Les warnings montrent des chunks > 500KB :
- `index-Bh2ZJaJF.js` : 565.70 kB
- `CandidateAnalysis-Csp9Ottn.js` : 481.81 kB

### 3. Actions immédiates

1. **Vérifier les variables d'env** dans Vercel
2. **Redeploy** manuellement
3. **Si ça échoue encore** : Optimiser vite.config.ts

### 4. Alternative : Build local + Deploy

Si Vercel continue d'échouer :
```bash
npm run build
vercel --prod
```
