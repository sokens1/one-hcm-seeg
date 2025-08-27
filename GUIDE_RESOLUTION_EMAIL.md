# 🚨 Guide de Résolution des Problèmes d'Email

## 📋 **Problème Identifié**
Les candidats ne reçoivent pas d'email de confirmation après avoir soumis leur candidature.

## 🔍 **Diagnostic Complet**

### **1. Vérifications Préliminaires**
- ✅ **Fonction Supabase** : `send_application_confirmation` est active
- ✅ **Secrets configurés** : `RESEND_API_KEY` et `FROM_EMAIL` sont présents
- ✅ **Configuration Resend** : Clé API valide

### **2. Problèmes Potentiels Identifiés**

#### **A. Incohérences dans les Templates d'Email**
- **Problème** : Le template HTML utilisait `recrutement@seeg.ga` mais le template texte utilisait `support@seeg-talentsource.com`
- **Solution** : ✅ **CORRIGÉ** - Uniformisation des contacts dans les deux templates

#### **B. Variables Non Utilisées**
- **Problème** : Variables `SUPPORT_EMAIL` et `SUPPORT_PHONE` déclarées mais non utilisées
- **Solution** : ✅ **CORRIGÉ** - Suppression des variables inutiles

#### **C. Logs de Debug Manquants**
- **Problème** : Pas de visibilité sur ce qui se passe lors de l'envoi
- **Solution** : ✅ **AJOUTÉ** - Logs de debug pour tracer l'envoi

## 🧪 **Outils de Test Créés**

### **1. Page de Test sur l'Accueil**
- **Localisation** : Section verte "Test d'Envoi d'Email" sur la page d'accueil
- **Fonctionnalités** :
  - Saisie d'email de destination
  - Personnalisation du prénom et titre du poste
  - Test en temps réel de la fonction Supabase
  - Affichage des résultats et erreurs détaillées

### **2. Script de Diagnostic Complet**
- **Fichier** : `diagnostic-email-complet.ps1`
- **Fonctionnalités** :
  - Vérification de tous les composants
  - Test direct de la fonction
  - Analyse des logs
  - Recommandations personnalisées

## 🚀 **Actions à Effectuer**

### **Étape 1 : Test Immédiat**
1. **Allez sur votre page d'accueil**
2. **Trouvez la section "Test d'Envoi d'Email"** (carte verte)
3. **Entrez votre email personnel**
4. **Cliquez sur "Envoyer l'Email de Test"**

### **Étape 2 : Analyse des Résultats**
- **Si succès** : L'email arrive dans votre boîte de réception
- **Si échec** : Les détails de l'erreur s'affichent

### **Étape 3 : Diagnostic Automatique**
```powershell
.\diagnostic-email-complet.ps1
```

## 🔧 **Résolution des Erreurs Communes**

### **Erreur : "RESEND_API_KEY not set"**
```bash
supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK
```

### **Erreur : "FROM_EMAIL not set"**
```bash
supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"
```

### **Erreur : "Failed to send email"**
- Vérifiez que votre clé API Resend est valide
- Vérifiez que votre domaine est configuré sur Resend
- Vérifiez les logs Supabase pour plus de détails

### **Erreur : "Function not found"**
```bash
supabase functions deploy send_application_confirmation
```

## 📊 **Surveillance en Temps Réel**

### **Logs des Fonctions**
```bash
# Suivre les logs en temps réel
supabase functions logs send_application_confirmation --follow

# Logs de la dernière heure
supabase functions logs send_application_confirmation --since 1h
```

### **Test Direct de la Fonction**
```bash
supabase functions invoke send_application_confirmation --body '{"to":"test@email.com","firstName":"Test","jobTitle":"Test Poste"}'
```

## 🎯 **Points de Vérification**

### **1. Configuration Resend**
- [ ] Clé API valide et active
- [ ] Domaine `seeg-talentsource.com` vérifié
- [ ] Compte non en mode test
- [ ] Limites d'envoi non atteintes

### **2. Configuration Supabase**
- [ ] Fonction déployée et active
- [ ] Secrets correctement configurés
- [ ] Projet connecté et accessible
- [ ] Pas de restrictions CORS

### **3. Configuration Email**
- [ ] Email d'expédition valide
- [ ] Templates HTML et texte cohérents
- [ ] Pas de caractères spéciaux problématiques
- [ ] Format d'email conforme aux standards

## 🚨 **En Cas d'Échec Persistant**

### **1. Vérification Manuelle Resend**
- Allez sur https://resend.com/emails
- Vérifiez le statut de votre compte
- Testez l'envoi d'un email depuis l'interface Resend

### **2. Support Technique**
- **Supabase** : Vérifiez les logs et la configuration
- **Resend** : Contactez le support pour vérifier votre compte
- **Votre équipe** : Vérifiez les restrictions réseau/firewall

### **3. Alternative Temporaire**
- Utilisez un autre service d'email (SendGrid, Mailgun)
- Configurez un webhook pour les notifications
- Implémentez un système de notification in-app

## 📈 **Métriques de Succès**

- ✅ **Email reçu** dans la boîte de réception
- ✅ **Pas d'erreurs** dans les logs Supabase
- ✅ **Réponse 200** de l'API Resend
- ✅ **ID d'email** retourné par Resend

## 🎉 **Résultat Attendu**

Après ces corrections, chaque candidature devrait :
1. **Être enregistrée** dans la base de données
2. **Déclencher** l'envoi automatique de l'email
3. **Envoyer** un email de confirmation professionnel
4. **Confirmer** la réception au candidat

---

**💡 Conseil** : Testez d'abord avec votre propre email avant de tester avec de vrais candidats !
