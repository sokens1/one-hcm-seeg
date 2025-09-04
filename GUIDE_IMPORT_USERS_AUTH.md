# 🔐 Guide d'importation des utilisateurs dans Supabase Auth

## Problème identifié
Les utilisateurs ont été importés dans la table `users` via CSV, mais ils n'existent pas dans la section Authentication de Supabase, ce qui empêche la connexion.

## Solution

### 📊 Données disponibles
- **207 utilisateurs** dans la table `users`
- **1 utilisateur** dans `auth.users` (vous)
- **Fichier CSV généré** : `users-to-import-2025-09-04.csv`

### 🚀 Méthode 1 : Import via Dashboard Supabase (Recommandée)

#### Étape 1 : Accéder au Dashboard
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `ndkkrsjgaekdrobpntjr`
3. Allez dans **Authentication** > **Users**

#### Étape 2 : Créer les utilisateurs
1. Cliquez sur **"Add user"**
2. Pour chaque utilisateur, utilisez les informations du fichier CSV :
   - **Email** : L'email de l'utilisateur
   - **Password** : Le mot de passe temporaire généré
   - **Email Confirm** : ✅ Cochez cette case
   - **User Metadata** : Ajoutez les informations supplémentaires

#### Étape 3 : Métadonnées utilisateur
Pour chaque utilisateur, ajoutez dans **User Metadata** :
```json
{
  "first_name": "Prénom",
  "last_name": "Nom",
  "phone": "Téléphone",
  "matricule": "Matricule",
  "role": "candidat|recruteur|admin|observateur"
}
```

### 🔧 Méthode 2 : Script automatisé (Avancée)

Si vous avez accès à la clé API Admin, vous pouvez utiliser le script `sync-users-to-auth.js` :

```bash
# Installer les dépendances si nécessaire
npm install

# Exécuter le script de synchronisation
node sync-users-to-auth.js
```

### 📋 Liste des utilisateurs à créer

Le fichier `users-to-import-2025-09-04.csv` contient tous les utilisateurs avec :
- **Email** : Adresse email de connexion
- **Password** : Mot de passe temporaire (format: `Temp{8caractères}!`)
- **first_name** : Prénom
- **last_name** : Nom
- **phone** : Téléphone
- **matricule** : Matricule SEEG
- **role** : Rôle (candidat, recruteur, admin, observateur)

### 🎯 Utilisateurs prioritaires à créer

#### Administrateurs
- `jessy@cnx4-0.com` - Jessy Mac (admin)
- `jessymac33@gmail.com` - Jessy Mac Modifié (observateur)

#### Recruteurs
- `jessicamengue935@gmail.com` - Jessica Mengue (recruteur)
- `moussavoufrancis1@gmail.com` - Jessy leroi (recruteur)
- `sokensgroup@gmail.com` - Uno Recruteur (recruteur)

#### Observateurs
- `akapitho.ozimo@gmail.com` - Alain KAPITHO OZIMO (observateur)
- `odillon2017@gmail.com` - Nathalie BINGAGAOYE (observateur)
- `slegnongo@seeg-gabon.com` - Steeve Saurel LEGNONGO (observateur)

### ⚠️ Notes importantes

1. **Mots de passe temporaires** : Les utilisateurs devront changer leur mot de passe lors de la première connexion
2. **Confirmation email** : Cochez "Email Confirm" pour éviter les problèmes de connexion
3. **Métadonnées** : Assurez-vous d'ajouter les métadonnées pour chaque utilisateur
4. **Rôles** : Respectez les rôles définis dans le CSV

### 🔄 Après l'importation

1. **Tester la connexion** avec quelques utilisateurs
2. **Vérifier les permissions** selon les rôles
3. **Informer les utilisateurs** des mots de passe temporaires
4. **Supprimer le fichier CSV** pour des raisons de sécurité

### 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que l'email n'existe pas déjà dans `auth.users`
2. Assurez-vous que le mot de passe respecte les critères de sécurité
3. Vérifiez que les métadonnées sont correctement formatées

## ✅ Résultat attendu

Après l'importation, tous les utilisateurs pourront :
- Se connecter avec leur email et mot de passe temporaire
- Accéder à la plateforme selon leur rôle
- Changer leur mot de passe lors de la première connexion
- Utiliser toutes les fonctionnalités de la plateforme
