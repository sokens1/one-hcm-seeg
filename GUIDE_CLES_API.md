# 🔑 Guide pour récupérer les clés API Supabase

## Problème identifié
La clé API actuelle n'est pas valide, ce qui empêche la récupération des données.

## Solution

### 1. Accéder au Dashboard Supabase
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous avec votre compte
3. Sélectionnez votre projet `ndkkrsjgaekdrobpntjr`

### 2. Récupérer les clés API
1. Dans le menu de gauche, cliquez sur **Settings** (Paramètres)
2. Cliquez sur **API** dans le menu des paramètres
3. Vous verrez deux clés importantes :

#### Clé "anon public" (pour le frontend)
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### URL du projet
```
VITE_SUPABASE_URL=https://ndkkrsjgaekdrobpntjr.supabase.co
```

### 3. Mettre à jour le fichier .env
Créez ou modifiez le fichier `.env` à la racine de votre projet :

```env
VITE_SUPABASE_URL=https://ndkkrsjgaekdrobpntjr.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_public_complète_ici
```

### 4. Vérifier la configuration
- Assurez-vous que la clé est complète (généralement très longue)
- Pas d'espaces ou de caractères supplémentaires
- Pas de guillemets autour de la clé

### 5. Redémarrer l'application
```bash
npm run dev
```

## Vérification
Une fois les clés mises à jour, l'application devrait pouvoir :
- ✅ Se connecter à la base de données
- ✅ Récupérer les données des utilisateurs
- ✅ Afficher les candidatures
- ✅ Fonctionner sans erreurs

## Note importante
Les clés API sont sensibles et ne doivent pas être partagées publiquement. Gardez votre fichier `.env` privé et ajoutez-le à votre `.gitignore`.
