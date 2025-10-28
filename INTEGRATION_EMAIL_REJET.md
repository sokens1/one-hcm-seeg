# 📧 Intégration de l'Email de Rejet de Candidature

**Date :** 31 janvier 2025  
**Fonctionnalité :** Envoi automatique d'un email de rejet aux candidats non retenus

---

## 📋 Résumé

Lorsqu'un candidat est **refusé** (soit au Protocole 1, soit au Protocole 2), un email de rejet professionnel et courtois lui est automatiquement envoyé, avec le format et les signatures standards de la plateforme.

---

## ✅ Fichiers Créés/Modifiés

### 1️⃣ **Nouvelle API d'Envoi d'Email de Rejet**
📁 `api/send-rejection-email.ts`

**Fonctionnalité :**
- Envoi d'email avec le contenu de rejet personnalisé
- Support SMTP (Nodemailer) + Fallback Resend
- Détection automatique du genre (Monsieur/Madame)
- Même format que tous les autres emails de la plateforme
- Log dans la table `email_logs` avec catégorie `'rejection'`

**Paramètres requis :**
```typescript
{
  to: string,                    // Email de destination
  candidateFullName: string,     // Nom complet du candidat
  candidateEmail: string,        // Email du candidat
  jobTitle: string,              // Titre du poste
  applicationId: string          // ID de la candidature
}
```

---

### 2️⃣ **Modification EvaluationDashboard (Protocole 1)**
📁 `src/components/evaluation/EvaluationDashboard.tsx`

**Fonction `handleRefuse` modifiée :**
- Récupère les infos du candidat (nom complet, email, poste)
- Appelle l'API `/api/send-rejection-email`
- Logs détaillés pour le debug
- Non bloquant : l'email n'empêche pas le refus en cas d'erreur

---

### 3️⃣ **Modification CandidateAnalysis (Protocole 2)**
📁 `src/pages/recruiter/CandidateAnalysis.tsx`

**Fonction `handleStatusChange` modifiée :**
- Détecte quand `newStatus === 'refuse'`
- Récupère les infos du candidat depuis `application.users` et `application.job_offers`
- Appelle l'API `/api/send-rejection-email`
- Toast de notification du succès/échec de l'envoi
- Non bloquant

---

## 📧 Contenu de l'Email

### Structure HTML :

```
Monsieur/Madame [NOM COMPLET],

Nous vous remercions pour l'intérêt que vous avez porté à rejoindre 
l'équipe dirigeante de la SEEG et pour le temps que vous avez consacré 
à votre candidature.

Après un examen approfondi de celle-ci, nous sommes au regret de vous 
informer que votre profil n'a malheureusement pas été retenu pour le 
poste de [NOM DU POSTE] au sein de la SEEG.

Nous vous souhaitons beaucoup de succès dans vos projets professionnels 
à venir et nous permettons de conserver votre dossier, au cas où une 
nouvelle opportunité en adéquation avec votre profil se présenterait.


Salutations distinguées.

L'équipe de recrutement
OneHCM | Talent source
https://www.seeg-talentsource.com

[Logo OneHCM]
```

### Sujet de l'email :
```
Candidature au poste de [NOM DU POSTE] – SEEG
```

---

## 🔄 Flux d'Envoi d'Email de Rejet

### Cas 1 : Rejet depuis le Protocole 1

```mermaid
1. Recruteur clique sur "Refuser" dans EvaluationDashboard
2. Dialogue de confirmation → "Confirmer le refus"
3. → handleRefuse() s'exécute
   ├─ Update statut en BD : status = 'refuse'
   ├─ Récupération infos candidat (nom, email, poste)
   └─ Appel API /api/send-rejection-email
       ├─ Construction email HTML avec le format standard
       ├─ Envoi via SMTP (ou Resend en fallback)
       └─ Log dans email_logs (catégorie: 'rejection')
4. Toast de confirmation
5. Propagation du changement de statut
```

### Cas 2 : Rejet depuis le Protocole 2

```mermaid
1. Recruteur clique sur "Refuser" dans Protocol2Dashboard
2. → handleDecision('refuse') → onStatusChange('refuse')
3. → handleStatusChange(newStatus='refuse') dans CandidateAnalysis
   ├─ Update statut en BD : status = 'refuse'
   ├─ Détection : newStatus === 'refuse'
   ├─ Récupération infos candidat depuis application
   └─ Appel API /api/send-rejection-email
       ├─ Construction email HTML
       ├─ Envoi via SMTP
       └─ Log dans email_logs
4. Toast de confirmation email envoyé
5. Rechargement des données
6. Navigation vers le pipeline
```

---

## 🎯 Points d'Envoi d'Email

| Endroit | Fichier | Fonction | Quand ? |
|---------|---------|----------|---------|
| **Protocole 1** | `EvaluationDashboard.tsx` | `handleRefuse()` | Clic sur "Refuser" |
| **Protocole 2** | `CandidateAnalysis.tsx` | `handleStatusChange()` | Décision "Refuser" |

---

## 🔐 Variables d'Environnement

**Aucune nouvelle variable**. Utilise les variables SMTP existantes :

```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=support@seeg-talentsource.com
VITE_SMTP_PASSWORD=***
VITE_SMTP_FROM="One HCM - SEEG Talent Source <support@seeg-talentsource.com>"
```

---

## 🧪 Tests à Effectuer

### ✅ Test 1 : Rejet depuis Protocole 1
1. Ouvrir un candidat en évaluation Protocole 1
2. Cliquer sur "Refuser" → Confirmer
3. Vérifier :
   - ✅ Le statut passe à "Refusé"
   - ✅ Toast de confirmation
   - ✅ Email reçu par le candidat
   - ✅ Log dans `email_logs` avec category='rejection'

### ✅ Test 2 : Rejet depuis Protocole 2
1. Ouvrir un candidat incubé (Protocole 2)
2. Cliquer sur "Refuser"
3. Vérifier :
   - ✅ Le statut passe à "Refusé"
   - ✅ Toast "Email envoyé"
   - ✅ Email reçu par le candidat
   - ✅ Redirection vers le pipeline

### ✅ Test 3 : Vérification du Contenu de l'Email
1. Ouvrir l'email reçu
2. Vérifier :
   - ✅ Titre correct (Monsieur/Madame)
   - ✅ Nom complet du candidat
   - ✅ Nom du poste mentionné
   - ✅ Texte complet présent
   - ✅ Signature "L'équipe de recrutement"
   - ✅ Logo OneHCM affiché

### ✅ Test 4 : Gestion d'Erreur
1. Désactiver temporairement le SMTP
2. Refuser un candidat
3. Vérifier :
   - ✅ Le refus fonctionne quand même
   - ✅ Toast d'erreur "Email non envoyé" (seulement dans CandidateAnalysis)
   - ✅ Logs d'erreur dans la console

---

## 📊 Logs dans la Base de Données

Chaque email de rejet est enregistré dans la table `email_logs` :

```sql
INSERT INTO email_logs (
  to,
  subject,
  html,
  application_id,
  category,
  provider_message_id,
  sent_at
) VALUES (
  'candidat@example.com',
  'Candidature au poste de Directeur Technique – SEEG',
  '<html>...</html>',
  'uuid-application-id',
  'rejection',
  'message-id-from-smtp',
  '2025-01-31T10:30:00.000Z'
);
```

**Catégorie :** `'rejection'`  
Permet de filtrer facilement tous les emails de rejet envoyés.

---

## 🔍 Débogage

### Logs à Surveiller :

**Dans la console navigateur :**
```javascript
📧 [REJECTION] Envoi email de rejet...
📧 [REJECTION] Envoi email de rejet à: candidat@example.com
📧 [REJECTION] Email de rejet envoyé avec succès: { ok: true, messageId: '...' }
```

**En cas d'erreur :**
```javascript
❌ Erreur lors de l'envoi de l'email de rejet: Error...
📧 [REJECTION] Échec envoi email: 500 { error: '...' }
```

**Logs serveur (API) :**
```javascript
📧 [REJECTION EMAIL DEBUG] Données reçues: { candidateFullName, jobTitle, ... }
✅ [REJECTION EMAIL] Email envoyé via SMTP: message-id
```

---

## 🚀 Déploiement

### Étapes pour la mise en production :

1. **Vérifier les variables SMTP** sur l'hébergement
2. **Déployer les fichiers** :
   - `api/send-rejection-email.ts` (nouvelle API)
   - `src/components/evaluation/EvaluationDashboard.tsx` (modifié)
   - `src/pages/recruiter/CandidateAnalysis.tsx` (modifié)
3. **Tester** avec un candidat de test
4. **Surveiller les logs** `email_logs` dans Supabase

---

## 📝 Notes Importantes

- ✅ **Non bloquant** : Si l'email échoue, le rejet du candidat fonctionne quand même
- ✅ **Automatique** : Aucune action manuelle requise
- ✅ **Professionnel** : Ton courtois et encourageant
- ✅ **Traçable** : Tous les emails sont loggés dans `email_logs`
- ✅ **Compatible** : Fonctionne avec SMTP et Resend
- ✅ **Adaptatif** : Détecte automatiquement le genre (Monsieur/Madame)

---

## 🎨 Aperçu de l'Email

```
┌────────────────────────────────────────────────┐
│  Madame Sophie MARTIN,                         │
│                                                 │
│  Nous vous remercions pour l'intérêt que vous  │
│  avez porté à rejoindre l'équipe dirigeante    │
│  de la SEEG et pour le temps que vous avez     │
│  consacré à votre candidature.                 │
│                                                 │
│  Après un examen approfondi de celle-ci, nous  │
│  sommes au regret de vous informer que votre   │
│  profil n'a malheureusement pas été retenu     │
│  pour le poste de Directeur Technique au sein  │
│  de la SEEG.                                   │
│                                                 │
│  Nous vous souhaitons beaucoup de succès dans  │
│  vos projets professionnels à venir et nous    │
│  permettons de conserver votre dossier, au     │
│  cas où une nouvelle opportunité en adéquation │
│  avec votre profil se présenterait.            │
│                                                 │
│  Salutations distinguées.                      │
│                                                 │
│  L'équipe de recrutement                       │
│  OneHCM | Talent source                        │
│  https://www.seeg-talentsource.com             │
│                                                 │
│  [Logo OneHCM]                                 │
└────────────────────────────────────────────────┘
```

---

## 👤 Auteur

Développé par l'équipe technique SEEG Talent Source  
Date : 31 janvier 2025

---

**Fonctionnalité prête pour les tests ! 🎉**

