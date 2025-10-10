# Migration vers l'API Azure Backend

## 📋 Configuration des Variables d'Environnement

### 1. Variables Frontend (Vite)

Ajoutez ces variables dans votre fichier `.env.local` ou `.env` :

```bash
# Configuration Azure API Backend
VITE_API_BASE_URL=https://seeg-backend-api.azurewebsites.net
VITE_API_VERSION=v1

# Configuration Supabase (pour la transition)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Variables Backend (Vercel)

Pour les fonctions serverless Vercel, ajoutez ces variables dans votre dashboard Vercel :

```bash
# Configuration Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=support@seeg-talentsource.com
SMTP_PASSWORD=njev urja zsbc spfn
SMTP_TLS=true
SMTP_SSL=false
MAIL_FROM_NAME="One HCM - SEEG Talent Source"
MAIL_FROM_EMAIL=support@seeg-talentsource.com
PUBLIC_APP_URL=https://www.seeg-talentsource.com

# Configuration Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=c8e910e3-d2bb-4ad3-9b3b-f90dfe956f55;IngestionEndpoint=https://francecentral-1.in.applicationinsights.azure.com/;LiveEndpoint=https://francecentral.livediagnostics.monitor.azure.com/;ApplicationId=af694a89-62bb-40dc-8dba-3c2047d376b4

# Configuration Base de données (pour les fonctions backend)
DATABASE_URL=postgresql+asyncpg://Sevan:Sevan%40Seeg@seeg-postgres-server.postgres.database.azure.com:5432/postgres
SECRET_KEY=your-super-secret-key-here-change-in-production
ALLOWED_ORIGINS=https://www.seeg-talentsource.com,https://seeg-hcm.vercel.app/
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
```

## 🔄 Migration du Formulaire d'Inscription

### Champs Ajoutés

Le formulaire d'inscription a été mis à jour avec les nouveaux champs :

1. **Date de naissance** (`dateOfBirth`) - Champ date
2. **Sexe** (`sexe`) - Select avec options "Homme" (M) / "Femme" (F)
3. **Poste actuel** (`posteActuel`) - Champ texte
4. **Années d'expérience** (`anneesExperience`) - Champ numérique
5. **Adresse** (`adresse`) - Champ texte

### Structure des Données API

L'API attend les données au format suivant :

```json
{
  "email": "new.candidate@seeg.ga",
  "password": "Password#2025",
  "first_name": "Aïcha",
  "last_name": "Mouketou",
  "matricule": 123456,
  "phone": "+24106223344",
  "date_of_birth": "1994-06-12",
  "sexe": "F"
}
```

## 🛠️ Intégration

### Option 1 : Utiliser le nouveau Hook Azure

```tsx
import { useAzureAuth, AzureAuthProvider } from "@/hooks/useAzureAuth";

// Dans votre composant
const { signUp, signIn, signOut, user } = useAzureAuth();

// Inscription
const handleSignUp = async (data) => {
  const { error, success } = await signUp(data);
  if (success) {
    // Redirection ou notification de succès
  }
};
```

### Option 2 : Migration Progressive

1. **Phase 1** : Utiliser l'API Azure pour les nouvelles inscriptions
2. **Phase 2** : Migrer les connexions existantes
3. **Phase 3** : Désactiver complètement Supabase Auth

## 🔧 Configuration Vercel

### Variables d'Environnement Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur "Settings" → "Environment Variables"
3. Ajoutez toutes les variables listées ci-dessus
4. Redéployez votre application

### Configuration des Domaines

Assurez-vous que votre domaine est autorisé dans `ALLOWED_ORIGINS` :
- `https://www.seeg-talentsource.com`
- `https://seeg-hcm.vercel.app`

## 📊 Monitoring

L'application utilise Azure Application Insights pour le monitoring :
- Métriques de performance
- Logs d'erreurs
- Analytics d'utilisation

## 🔒 Sécurité

### Variables Sensibles

- `SECRET_KEY` : Changez en production
- `DATABASE_URL` : Gardez confidentiel
- `SMTP_PASSWORD` : Utilisez un mot de passe d'application

### CORS

L'API est configurée pour accepter uniquement les domaines autorisés.

## 🚀 Déploiement

1. Configurez les variables d'environnement
2. Testez en local avec `npm run dev`
3. Déployez sur Vercel avec `vercel --prod`
4. Vérifiez les logs dans Azure Application Insights

## 📞 Support

En cas de problème :
1. Vérifiez les logs Azure Application Insights
2. Vérifiez les variables d'environnement
3. Testez l'API directement sur https://seeg-backend-api.azurewebsites.net/docs
