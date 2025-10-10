# Configuration des API en Développement

## ✅ Middlewares Ajoutés à `vite.config.ts`

### API Configurées

| API | URL | Fonction |
|-----|-----|----------|
| Interview Email | `/api/send-interview-email` | Invitation entretien/simulation |
| Welcome Email | `/api/send-welcome-email` | Email de bienvenue inscription |
| Access Request | `/api/send-access-request-email` | Demande d'accès interne |

---

## 🔧 Configuration

### 1. `/api/send-welcome-email`
**Middleware :** `dev-api-send-welcome-email`

**Body :**
```json
{
  "userEmail": "candidat@example.com",
  "firstName": "Arthur",
  "lastName": "CROWN"
}
```

**Email envoyé à :** `userEmail` (le candidat)

**Contenu :**
```
Bienvenue sur OneHCM - SEEG Talent Source !

Votre inscription a été effectuée avec succès.

Prochaines étapes :
• Consultez les offres d'emploi
• Postulez aux postes
• Suivez vos candidatures
```

---

### 2. `/api/send-access-request-email`
**Middleware :** `dev-api-send-access-request-email`

**Body :**
```json
{
  "userEmail": "candidat@gmail.com",
  "firstName": "Arthur",
  "lastName": "CROWN",
  "phone": "+241 08 78 85 46",
  "matricule": "1234",
  "dateOfBirth": "2025-10-10",
  "sexe": "M",
  "adresse": "OWENDO"
}
```

**Emails envoyés :**
1. **Admin** (`support@seeg-talentsource.com`) : Demande d'accès avec détails candidat
2. **Candidat** (`userEmail`) : Confirmation en attente de validation

---

## 🔄 Flux d'Inscription

### Tous les Candidats
```
Inscription réussie
  ↓
✉️ POST /api/send-welcome-email
  ↓
Email de bienvenue envoyé
```

### Candidat Interne SANS Email SEEG
```
Inscription réussie
  ↓
✉️ POST /api/send-welcome-email
  ↓
✉️ POST /api/send-access-request-email
  ↓
2 emails envoyés (admin + candidat)
  ↓
Message : "Demande en attente de validation"
```

---

## ⚠️ IMPORTANT : Redémarrer le Serveur

Les nouveaux middlewares ne seront actifs qu'après redémarrage :

```bash
# 1. Arrêter le serveur
Ctrl + C

# 2. Redémarrer
npm run dev
```

---

## 🧪 Vérification

### Logs Console Attendus

**Après inscription (tous) :**
```
✅ [WELCOME EMAIL] Email envoyé via SMTP: <message-id>
```

**Si interne sans email SEEG (en plus) :**
```
📧 Envoi des notifications pour candidat interne sans email SEEG...
📧 Envoi des notifications de demande d'accès...
✅ [ACCESS REQUEST] Email admin envoyé
✅ [ACCESS REQUEST] Email candidat envoyé
```

### Onglet Network
- `POST /api/send-welcome-email` → 200 OK
- `POST /api/send-access-request-email` → 200 OK (si interne sans SEEG)

---

## 📧 Configuration SMTP (Hardcodée pour Dev)

```javascript
const smtpHost = 'smtp.gmail.com';
const smtpPort = 587;
const smtpSecure = false;
const smtpUser = 'support@seeg-talentsource.com';
const smtpPass = 'njev urja zsbc spfn';
```

**Note :** Hardcodé dans `vite.config.ts` pour éviter les problèmes de variables d'environnement en dev.

---

## 🚀 Production (Vercel)

En production, Vercel utilisera les fichiers dans `/api/` :
- `api/send-welcome-email.ts`
- `api/send-access-request-email.ts`
- `api/send-interview-email.ts`

Avec les variables d'environnement Vercel :
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@seeg-talentsource.com
SMTP_PASSWORD=njev urja zsbc spfn
```

---

## ✅ Checklist

- [x] Middlewares ajoutés à `vite.config.ts`
- [x] Configuration SMTP hardcodée
- [x] Templates HTML créés
- [x] Intégration dans `Auth.tsx`
- [ ] **Redémarrer le serveur** (Ctrl+C puis npm run dev)
- [ ] Tester inscription candidat externe
- [ ] Tester inscription candidat interne avec email SEEG
- [ ] Tester inscription candidat interne sans email SEEG
- [ ] Vérifier réception des emails

---

**Redémarrez le serveur maintenant pour que les API fonctionnent !** 🚀✨
