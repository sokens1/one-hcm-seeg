# 🚀 Guide de Démarrage Rapide - Email de Confirmation SEEG

## ⏱️ **Configuration en 5 minutes**

### **Étape 1 : Créer un compte Resend (2 min)**
1. Allez sur [resend.com](https://resend.com)
2. Cliquez sur "Get Started"
3. Créez votre compte avec votre email professionnel
4. **Connectez-vous** à votre dashboard

### **Étape 2 : Obtenir votre clé API (1 min)**
1. Dans le menu de gauche, cliquez sur **"API Keys"**
2. Cliquez sur **"Create API Key"**
3. Donnez un nom : `SEEG-TalentFlow`
4. Sélectionnez : `emails:send` et `domains:read`
5. Cliquez sur **"Create"**
6. **Copiez la clé** qui commence par `re_...`

### **Étape 3 : Configurer Supabase (2 min)**
```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet (remplacez VOTRE_PROJECT_REF)
supabase link --project-ref VOTRE_PROJECT_REF

# Configurer votre clé API Resend
supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK

# Configurer l'email d'expédition
supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"

# Vérifier la configuration
supabase secrets list
```

### **Étape 4 : Déployer la fonction**
```bash
# Déployer la fonction d'envoi d'email
supabase functions deploy send_application_confirmation
```

## ✅ **Vérification**

Après configuration, testez en soumettant une candidature :
1. Remplissez le formulaire de candidature
2. Soumettez la candidature
3. Vérifiez que l'email de confirmation est reçu
4. Vérifiez les logs dans Supabase

## 🚀 **Déploiement Automatisé**

### **Option 1 : Script automatique (recommandé)**
```bash
# Sur Windows (PowerShell)
.\deploy-email.ps1

# Sur Linux/Mac
chmod +x deploy-email.sh
./deploy-email.sh
```

### **Option 2 : Commandes manuelles**
```bash
# Configuration des secrets
supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK
supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"

# Déploiement
supabase functions deploy send_application_confirmation

# Vérification
supabase secrets list
supabase functions list
```

## 🔧 **En cas de problème**

### **Erreur "RESEND_API_KEY not set"**
```bash
# Vérifiez que la clé est configurée
supabase secrets list

# Si elle n'apparaît pas, reconfigurez
supabase secrets set RESEND_API_KEY=VOTRE_CLE_API
```

### **Emails non reçus**
- Vérifiez le dossier spam
- Testez depuis le dashboard Resend
- Vérifiez les logs Supabase

## 📞 **Aide rapide**

- **Email** : support@seeg-talentsource.com
- **Téléphone** : +241 076402886
- **Documentation complète** : `EMAIL_CONFIGURATION.md`

---

**🎯 Objectif** : Avoir un système d'email de confirmation fonctionnel en moins de 5 minutes !
