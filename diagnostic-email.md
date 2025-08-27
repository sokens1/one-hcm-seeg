# 🔍 Diagnostic Email - SEEG Talent Flow

## 🚨 **Problème Identifié : Emails non reçus**

Si vous ne recevez pas d'emails après candidature, suivez ce guide de diagnostic étape par étape.

## 🔧 **Étape 1 : Vérifier la Configuration Supabase**

### **1.1 Vérifier les secrets configurés**
```bash
# Lister tous les secrets
supabase secrets list

# Vous devriez voir :
# RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK
# FROM_EMAIL=SEEG Recrutement <support@seeg-talentsource.com>
```

### **1.2 Si les secrets ne sont pas configurés**
```bash
# Configurer la clé API Resend
supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK

# Configurer l'email d'expédition
supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"

# Vérifier à nouveau
supabase secrets list
```

## 🔍 **Étape 2 : Vérifier le Déploiement de la Fonction**

### **2.1 Lister les fonctions déployées**
```bash
supabase functions list

# Vous devriez voir :
# send_application_confirmation | active
```

### **2.2 Si la fonction n'est pas déployée**
```bash
# Déployer la fonction
supabase functions deploy send_application_confirmation

# Vérifier le statut
supabase functions list
```

## 📊 **Étape 3 : Vérifier les Logs de la Fonction**

### **3.1 Logs en temps réel**
```bash
# Suivre les logs en temps réel
supabase functions logs send_application_confirmation --follow

# Puis soumettez une candidature dans une autre fenêtre
```

### **3.2 Logs des dernières 24h**
```bash
# Voir les logs récents
supabase functions logs send_application_confirmation --since 24h
```

## 🧪 **Étape 4 : Test Direct de la Fonction**

### **4.1 Tester la fonction localement**
```bash
# Démarrer Supabase localement
supabase start

# Servir la fonction
supabase functions serve send_application_confirmation

# Dans une autre fenêtre, tester avec curl
curl -X POST http://localhost:54321/functions/v1/send_application_confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "to": "votre-email@exemple.com",
    "firstName": "Test",
    "jobTitle": "Développeur"
  }'
```

### **4.2 Tester depuis le dashboard Resend**
1. Allez sur [resend.com/emails](https://resend.com/emails)
2. Connectez-vous
3. Cliquez sur "Send Email"
4. Testez l'envoi à votre email

## 🚨 **Problèmes Courants et Solutions**

### **Problème 1 : "RESEND_API_KEY not set"**
```bash
# Solution : Reconfigurer la clé
supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK
```

### **Problème 2 : "Function not found"**
```bash
# Solution : Redéployer la fonction
supabase functions deploy send_application_confirmation
```

### **Problème 3 : "Failed to send email"**
- Vérifiez que votre clé API est valide
- Vérifiez que votre domaine est configuré sur Resend
- Vérifiez les logs pour plus de détails

### **Problème 4 : Emails dans le spam**
- Vérifiez le dossier spam de votre email
- Vérifiez que votre domaine est vérifié sur Resend

## 📋 **Checklist de Diagnostic**

- [ ] Secrets Supabase configurés
- [ ] Fonction déployée et active
- [ ] Logs sans erreur
- [ ] Test local réussi
- [ ] Test Resend réussi
- [ ] Email reçu (vérifier spam)

## 🚀 **Solution Rapide**

Si vous voulez une solution immédiate, exécutez ce script :

```bash
# Sur Windows
.\deploy-email.ps1

# Sur Linux/Mac
./deploy-email.sh
```

## 📞 **Support Immédiat**

Si le problème persiste :
- **Email** : support@seeg-talentsource.com
- **Téléphone** : +241 076402886
- **Logs à partager** : `supabase functions logs send_application_confirmation --since 1h`

---

**🎯 Objectif** : Identifier et résoudre le problème d'envoi d'email en moins de 10 minutes !
