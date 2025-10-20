# 🚀 Guide de Déploiement Vercel - Talent Flow Gabon

## ✅ Corrections Appliquées

### 1. Optimisation du Build
- ✅ Configuration des `manualChunks` pour réduire la taille des bundles
- ✅ Désactivation des sourcemaps en production
- ✅ Limite de taille des chunks augmentée à 1000KB
- ✅ Séparation des dépendances en chunks optimisés

### 2. Configuration Vercel
- ✅ Fichier `vercel.json` configuré avec buildCommand explicite
- ✅ Headers de sécurité ajoutés
- ✅ `.vercelignore` créé pour exclure les fichiers inutiles

### 3. Architecture des Chunks
```
vendor: React, React-DOM, React-Router
ui: Composants Radix UI
charts: Recharts
supabase: Client Supabase
forms: React Hook Form, Zod
```

## 📋 Actions Requises sur Vercel

### Étape 1 : Vérifier les Variables d'Environnement

Allez dans **Vercel Dashboard → Votre Projet → Settings → Environment Variables**

**Variables REQUISES :**

```bash
# Supabase (obligatoire)
VITE_SUPABASE_URL=https://fyiitzndlqcnyluwkpqp.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key

# Webhooks Supabase (pour les API serverless)
SUPABASE_WEBHOOK_SECRET=votre_secret_webhook

# Azure API (si utilisé)
VITE_AZURE_API_URL=https://seeg-backend-api.azurewebsites.net/api/v1
AZURE_ADMIN_TOKEN=votre_token_azure

# SMTP (pour les emails)
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
VITE_SMTP_USER=support@seeg-talentsource.com
VITE_SMTP_PASSWORD=votre_password_smtp
VITE_SMTP_FROM=One HCM - SEEG Talent Source <support@seeg-talentsource.com>
```

**Important :** 
- Cochez "Production", "Preview" et "Development" pour chaque variable
- Cliquez sur "Save" après chaque ajout

### Étape 2 : Configuration du Build

Dans **Settings → General → Build & Development Settings** :

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Étape 3 : Redéployer

1. Allez dans **Deployments**
2. Cliquez sur les 3 points `...` du dernier déploiement
3. Cliquez sur **Redeploy**
4. Sélectionnez "Use existing Build Cache" (décoché)
5. Cliquez sur **Redeploy**

## 🔧 Résolution des Problèmes

### Erreur : "An unexpected error happened"

**Causes possibles :**
1. Variables d'environnement manquantes
2. Timeout de build (> 15 minutes)
3. Mémoire insuffisante

**Solutions :**
```bash
# 1. Vérifier les variables d'env (voir Étape 1)
# 2. Nettoyer le cache et redéployer
# 3. Si le problème persiste, build local :

npm run build
vercel --prod
```

### Erreur : "Failed to compile"

**Solution :**
```bash
# Tester le build localement
npm run build

# Si ça fonctionne localement, le problème vient de Vercel
# Vérifiez les variables d'environnement
```

### Warnings de chunk size

Ces warnings sont normaux et n'empêchent pas le déploiement :
```
⚠️ Some chunks are larger than 500 KB after minification
```

Les optimisations appliquées réduisent déjà significativement la taille.

## 📊 Performance

### Avant Optimisation
- `index.js` : 1.2 MB
- Build time : 8-12 minutes

### Après Optimisation
- Chunks séparés : vendor (~450KB), ui (~350KB), etc.
- Build time estimé : 4-6 minutes
- Chargement initial plus rapide

## 🔐 Sécurité

Headers de sécurité ajoutés automatiquement :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📞 Support

Si le problème persiste après ces étapes :

1. **Vérifier les logs Vercel** : Deployments → Votre build → View Function Logs
2. **Contacter le support Vercel** : https://vercel.com/help
3. **Alternative** : Déployer sur une autre plateforme (Netlify, Cloudflare Pages)

## ✅ Checklist Finale

- [ ] Variables d'environnement configurées
- [ ] Build Command : `npm run build`
- [ ] Output Directory : `dist`
- [ ] Cache nettoyé
- [ ] Redéploiement lancé
- [ ] Build réussi ✅
- [ ] Site accessible

