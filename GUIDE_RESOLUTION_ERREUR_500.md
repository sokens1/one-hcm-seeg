# 🚨 Guide de Résolution de l'Erreur 500 - Fonction Supabase

## 📋 **Problème Identifié**
- **Erreur** : `500 Internal Server Error` lors de l'appel à `send_application_confirmation`
- **Statut** : Fonction déployée mais retourne une erreur 500
- **Payload** : Correctement reçu par la fonction

## 🔍 **Diagnostic Effectué**

### **1. Test Direct de la Fonction**
- ✅ **Fonction accessible** : URL correcte et accessible
- ❌ **Erreur 401** : Problème d'authentification JWT
- ❌ **Erreur 500** : Problème interne de la fonction

### **2. Analyse des Erreurs**
- **401 Unauthorized** : Problème d'authentification
- **500 Internal Server Error** : Problème dans le code de la fonction
- **Timeout réseau** : Problème de connectivité

## 🛠️ **Solutions à Appliquer**

### **Solution 1 : Vérification de la Configuration Supabase**

#### **A. Accédez au Dashboard Supabase**
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet : `fyiitzndlqcnyluwkpqp`
3. Allez dans **Settings** → **API**

#### **B. Vérifiez les Clés API**
- ✅ **URL** : `https://fyiitzndlqcnyluwkpqp.supabase.co`
- ✅ **anon public** : Doit être présente
- ✅ **service_role** : Doit être présente

### **Solution 2 : Vérification des Secrets**

#### **A. Dans le Dashboard Supabase**
1. Allez dans **Settings** → **Edge Functions**
2. Vérifiez que `send_application_confirmation` est listée
3. Cliquez sur la fonction pour voir les détails

#### **B. Vérifiez les Variables d'Environnement**
```bash
# Dans votre terminal local
supabase secrets list
```

Vous devriez voir :
- ✅ `RESEND_API_KEY`
- ✅ `FROM_EMAIL`

### **Solution 3 : Test de la Fonction depuis le Dashboard**

#### **A. Test Direct dans Supabase**
1. Dans **Edge Functions**, cliquez sur `send_application_confirmation`
2. Cliquez sur **"Invoke"** ou **"Test"**
3. Entrez ce payload de test :
```json
{
  "to": "test@example.com",
  "firstName": "Test",
  "jobTitle": "Développeur Test"
}
```

#### **B. Vérifiez les Logs**
- Les logs devraient s'afficher en temps réel
- Identifiez l'erreur exacte

### **Solution 4 : Correction de la Configuration**

#### **A. Si Problème d'Authentification**
```bash
# Redéployez la fonction avec la bonne configuration
supabase functions deploy send_application_confirmation --no-verify-jwt
```

#### **B. Si Problème de Secrets**
```bash
# Vérifiez et reconfigurez les secrets
supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK
supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"
```

## 🧪 **Tests à Effectuer**

### **Test 1 : Page HTML de Test**
1. Ouvrez `test-email-simple.html` dans votre navigateur
2. Saisissez votre clé anon Supabase
3. Testez la connexion d'abord
4. Testez l'envoi d'email

### **Test 2 : Page d'Accueil**
1. Allez sur votre page d'accueil
2. Utilisez la section "Test d'Envoi d'Email"
3. Vérifiez les erreurs affichées

### **Test 3 : Dashboard Supabase**
1. Testez directement depuis le dashboard
2. Vérifiez les logs en temps réel

## 🔧 **Résolution des Erreurs Communes**

### **Erreur : "Invalid JWT"**
- **Cause** : Problème d'authentification
- **Solution** : Utilisez `--no-verify-jwt` lors du déploiement

### **Erreur : "RESEND_API_KEY not configured"**
- **Cause** : Secret manquant
- **Solution** : Configurez le secret avec `supabase secrets set`

### **Erreur : "Failed to send email"**
- **Cause** : Problème avec l'API Resend
- **Solution** : Vérifiez votre clé API Resend

## 📊 **Surveillance et Debug**

### **1. Logs en Temps Réel**
```bash
# Si votre CLI fonctionne
supabase functions logs send_application_confirmation --follow
```

### **2. Dashboard Supabase**
- Allez dans **Edge Functions** → **Logs**
- Surveillez les appels en temps réel

### **3. Console du Navigateur**
- Ouvrez les outils de développement
- Vérifiez la console pour les erreurs détaillées

## 🎯 **Actions Immédiates**

### **Maintenant (5 minutes)**
1. **Accédez au dashboard Supabase**
2. **Vérifiez la fonction** `send_application_confirmation`
3. **Testez directement** depuis le dashboard

### **Dans les 15 minutes**
1. **Vérifiez les secrets** avec `supabase secrets list`
2. **Testez depuis votre page d'accueil**
3. **Analysez les erreurs** affichées

### **Dans l'heure**
1. **Corrigez la configuration** si nécessaire
2. **Redéployez la fonction** si besoin
3. **Validez le bon fonctionnement**

## 🚨 **En Cas d'Échec Persistant**

### **1. Support Supabase**
- Créez un ticket dans le dashboard
- Fournissez les logs d'erreur

### **2. Alternative Temporaire**
- Utilisez un webhook pour les notifications
- Implémentez un système de notification in-app

---

## 📞 **Support Immédiat**

**Prochaine étape** : Accédez immédiatement au dashboard Supabase et testez la fonction directement depuis l'interface.

**Résultat attendu** : Identification précise de l'erreur et résolution immédiate.

**🚀 Votre fonction est déployée et accessible - il suffit de corriger la configuration !**
