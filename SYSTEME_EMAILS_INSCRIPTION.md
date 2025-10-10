# Système d'Emails d'Inscription

## 📧 Vue d'Ensemble

Le système envoie **automatiquement** des emails lors de l'inscription selon le type de candidat.

---

## 📋 Types d'Emails

### 1. **Email de Bienvenue** (TOUS les candidats)
- **Destinataire** : Candidat inscrit
- **Quand** : Après toute inscription réussie
- **Sujet** : "Bienvenue sur OneHCM - SEEG Talent Source"
- **API** : `/api/send-welcome-email`

### 2. **Email de Demande d'Accès** (Candidats internes sans email SEEG)
- **Destinataire 1** : Admin (`support@seeg-talentsource.com`)
- **Destinataire 2** : Candidat
- **Quand** : Candidat interne + checkbox "Pas d'email SEEG"
- **Sujet Admin** : "🔔 Nouvelle Demande d'Accès - Candidat Interne"
- **Sujet Candidat** : "Demande d'Accès en Attente de Validation"
- **API** : `/api/send-access-request-email`

---

## 🔄 Flux d'Inscription

### Cas 1 : Candidat Externe
```
Inscription réussie
  ↓
✉️ Email de bienvenue envoyé
  ↓
Connexion automatique
  ↓
Redirection /candidate/dashboard
```

### Cas 2 : Candidat Interne AVEC Email SEEG
```
Inscription réussie
  ↓
✉️ Email de bienvenue envoyé
  ↓
Connexion automatique
  ↓
Redirection /candidate/dashboard
```

### Cas 3 : Candidat Interne SANS Email SEEG
```
Inscription réussie
  ↓
✉️ Email de bienvenue envoyé
  +
✉️ Email à l'admin (demande d'accès)
  +
✉️ Email au candidat (en attente)
  ↓
Statut = 'en_attente'
  ↓
PAS de connexion automatique
  ↓
Message : "En attente de validation"
  ↓
Redirection vers onglet connexion
```

---

## 📁 Fichiers API

### 1. `/api/send-welcome-email.ts`

**Fonctionnalités :**
- ✅ Envoi via SMTP (prioritaire)
- ✅ Fallback via Resend
- ✅ Template professionnel
- ✅ Format identique à `send-interview-email.ts`
- ✅ Gestion robuste des erreurs

**Body Requis :**
```json
{
  "userEmail": "candidat@example.com",
  "firstName": "Arthur",
  "lastName": "CROWN",
  "candidateStatus": "externe"
}
```

**Template :**
```
Monsieur/Madame [Nom],

Bienvenue sur OneHCM - SEEG Talent Source !

Votre inscription a été effectuée avec succès.

Prochaines étapes :
- Consultez les offres d'emploi
- Postulez aux postes
- Suivez vos candidatures

Cordialement,
Équipe Support OneHCM
```

---

### 2. `/api/send-access-request-email.ts`

**Fonctionnalités :**
- ✅ Envoi via SMTP (prioritaire)
- ✅ Fallback via Resend
- ✅ **2 emails** : admin + candidat
- ✅ Format identique à `send-interview-email.ts`

**Body Requis :**
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

**Template Admin :**
```
Nouvelle Demande d'Accès - Candidat Interne

Un candidat interne sans email SEEG a créé un compte.

Informations :
- Nom : Arthur CROWN
- Email : candidat@gmail.com
- Téléphone : +241 08 78 85 46
- Matricule : 1234
- Date naissance : 10/10/2025
- Sexe : Homme
- Adresse : OWENDO

⚠️ Action requise : Valider dans le dashboard admin
```

**Template Candidat :**
```
Demande d'Accès en Attente

Bonjour Arthur CROWN,

Votre demande d'accès a bien été enregistrée.
Votre compte est en attente de validation.

Notre équipe va vérifier vos informations.
Vous recevrez un email de confirmation.

Cordialement,
L'équipe OneHCM
```

---

## 🔧 Intégration Frontend

### `src/pages/Auth.tsx`

```typescript
// Après inscription réussie
// 1. Email de bienvenue (TOUS)
fetch('/api/send-welcome-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userEmail: signUpData.email,
    firstName: signUpData.firstName,
    lastName: signUpData.lastName,
    candidateStatus: signUpData.candidateStatus,
  }),
}).catch(err => console.error('⚠️ Erreur email bienvenue'));

// 2. Si interne sans email SEEG, emails spécifiques
if (signUpData.candidateStatus === "interne" && signUpData.noSeegEmail) {
  sendAccessRequestNotification({
    userEmail: signUpData.email,
    firstName: signUpData.firstName,
    lastName: signUpData.lastName,
    phone: signUpData.phone,
    matricule: signUpData.matricule,
    dateOfBirth: signUpData.dateOfBirth,
    sexe: signUpData.sexe,
    adresse: signUpData.adresse,
  }).catch(err => console.error('⚠️ Erreur notifications'));
  
  // Message spécifique
  toast.success("Inscription réussie ! Votre demande d'accès est en attente.");
  toast.info("Vous recevrez un email une fois votre compte validé.");
  return; // Pas de connexion auto
}

// 3. Sinon, connexion automatique
// ... code existant
```

---

## 🧪 Tests

### Test 1 : Candidat Externe
1. S'inscrire comme externe
2. Vérifier la console :
   ```
   📧 [WELCOME EMAIL] Email envoyé via SMTP: <message-id>
   ```
3. Vérifier la boîte email du candidat
4. Vérifier la connexion automatique

### Test 2 : Candidat Interne avec Email SEEG
1. S'inscrire comme interne
2. Email @seeg.com
3. Vérifier :
   - ✉️ Email de bienvenue reçu
   - ✅ Connexion automatique
   - ✅ Statut = 'actif'

### Test 3 : Candidat Interne SANS Email SEEG
1. S'inscrire comme interne
2. Cocher "Pas d'email SEEG"
3. Email non-SEEG (ex: @gmail.com)
4. Vérifier :
   - ✉️ Email de bienvenue reçu par le candidat
   - ✉️ Email de demande reçu par l'admin
   - ✉️ Email "en attente" reçu par le candidat
   - ❌ Pas de connexion automatique
   - ✅ Statut = 'en_attente'

---

## 📊 Tableau Récapitulatif

| Type Candidat | Email SEEG | Emails Envoyés | Statut | Connexion Auto |
|---------------|------------|----------------|--------|----------------|
| Externe | - | 1 (Bienvenue) | actif | ✅ Oui |
| Interne | ✅ Oui | 1 (Bienvenue) | actif | ✅ Oui |
| Interne | ❌ Non | 3 (Bienvenue + Admin + Attente) | en_attente | ❌ Non |

---

## 🔍 Debugging

### Vérifier les Logs Console

**Email de bienvenue :**
```
📧 [WELCOME EMAIL] Données reçues: { userEmail: "...", firstName: "..." }
✅ [WELCOME EMAIL] Email envoyé via SMTP: <message-id>
```

**Email de demande d'accès :**
```
📧 [ACCESS REQUEST] Données reçues: { userEmail: "...", firstName: "..." }
📧 [ACCESS REQUEST] Configuration SMTP: { host: 'configured', user: 'configured', ... }
✅ [ACCESS REQUEST] Email admin envoyé via SMTP: <message-id>
✅ [ACCESS REQUEST] Email candidat envoyé via SMTP: <message-id>
```

### Vérifier l'Onglet Network

**Requêtes attendues :**
1. `POST /api/send-welcome-email` → 200 OK
2. `POST /api/send-access-request-email` → 200 OK (si interne sans SEEG)

### Vérifier les Variables d'Environnement

```bash
# .env.local
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=support@seeg-talentsource.com
VITE_SMTP_PASSWORD=njev urja zsbc spfn
VITE_SMTP_SECURE=false
```

**Si aucun email n'est envoyé :**
```
❌ [WELCOME EMAIL] Configuration SMTP: { 
  host: 'missing', 
  user: 'missing', 
  pass: 'missing' 
}
```
→ Vérifier les variables d'environnement

---

## ✅ Résultat Final

### Email de Bienvenue
```
De: One HCM - SEEG Talent Source <support@seeg-talentsource.com>
À: candidat@example.com
Sujet: Bienvenue sur OneHCM - SEEG Talent Source

Monsieur Arthur CROWN,

Bienvenue sur la plateforme OneHCM - SEEG Talent Source !

Votre inscription a été effectuée avec succès.

Prochaines étapes :
• Consultez les offres d'emploi disponibles
• Postulez aux postes qui correspondent à votre profil
• Suivez l'évolution de vos candidatures

Nous vous souhaitons bonne chance !

Cordialement,
Équipe Support OneHCM
```

### Email Admin (Demande d'Accès)
```
De: One HCM - SEEG Talent Source <support@seeg-talentsource.com>
À: support@seeg-talentsource.com
Sujet: 🔔 Nouvelle Demande d'Accès - Candidat Interne

Nouvelle Demande d'Accès - Candidat Interne

Un candidat interne sans email professionnel SEEG a créé un compte.

Informations du Candidat :
━━━━━━━━━━━━━━━━━━━━
Nom complet : Arthur CROWN
Email : arthur@gmail.com
Téléphone : +241 08 78 85 46
Matricule : 1234
Date de naissance : 10/10/2025
Sexe : Homme
Adresse : OWENDO

⚠️ Action requise :
Veuillez vérifier et valider cette demande dans le dashboard.
```

### Email Candidat (En Attente)
```
De: One HCM - SEEG Talent Source <support@seeg-talentsource.com>
À: arthur@gmail.com
Sujet: Demande d'Accès en Attente de Validation

Bonjour Arthur CROWN,

Votre demande d'accès a bien été enregistrée.
En tant que candidat interne sans email SEEG, votre compte
est en attente de validation.

Vos Informations :
━━━━━━━━━━━━━━━
Email : arthur@gmail.com
Téléphone : +241 08 78 85 46
Matricule : 1234

⏳ Prochaines étapes :
Notre équipe va vérifier vos informations.
Vous recevrez un email une fois votre compte activé.

Cordialement,
L'équipe OneHCM
```

---

## 📁 Fichiers Créés

1. ✅ `api/send-welcome-email.ts` - Email de bienvenue
2. ✅ `api/send-access-request-email.ts` - Emails demande d'accès (corrigé)
3. ✅ `src/hooks/useAccessRequestNotification.ts` - Hook React
4. ✅ `src/pages/Auth.tsx` - Intégration complète

---

## 🚀 Déploiement

### Développement Local
Les emails fonctionnent directement avec les variables `VITE_SMTP_*` dans `.env.local`.

### Production (Vercel)
Configurer les variables :
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@seeg-talentsource.com
SMTP_PASSWORD=njev urja zsbc spfn
SMTP_SECURE=false
```

---

**Le système d'emails est maintenant complet et fonctionne comme `send-interview-email.ts` !** 🎯✨
