# Processus de Récupération et d'Envoi d'Email - SEEG Talent Flow

## Vue d'ensemble

Ce document décrit le processus complet de récupération de l'email du candidat et d'envoi automatique de l'email de confirmation de candidature.

## 🔄 **Flux de récupération de l'email**

### 1. **Sources d'email avec priorité**

Le système récupère l'email du candidat selon cette hiérarchie :

```
Priorité 1: Email du formulaire (formData.email)
    ↓
Priorité 2: Email de l'utilisateur authentifié (user.email)
    ↓
Priorité 3: Email depuis la base de données (users.email)
```

### 2. **Processus de récupération**

```typescript
// Dans ApplicationForm.tsx - handleSubmit()
let toEmail = '';

// Récupérer l'email depuis la base de données si nécessaire
let dbEmail = '';
if (user?.id && !formData.email && !user.email) {
  const { data: dbUser } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .maybeSingle();
  
  if (dbUser?.email) {
    dbEmail = dbUser.email;
  }
}

// Utiliser l'utilitaire pour récupérer l'email avec priorité
toEmail = getCandidateEmail(formData.email, user?.email, dbEmail);
```

## ✅ **Validation de l'email**

### 1. **Validation en temps réel**

- **onChange** : Validation immédiate lors de la saisie
- **onBlur** : Validation lors de la perte de focus
- **Regex** : `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### 2. **Validation avant soumission**

```typescript
const validateStep1 = () => {
  const isEmailValid = isValidEmail(formData.email);
  
  return (
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    isEmailValid && // ← Validation email
    // ... autres validations
  );
};
```

### 3. **Messages d'erreur contextuels**

```typescript
const getEmailErrorMessage = (email: string): string | null => {
  if (!email.trim()) {
    return "L'email est requis pour recevoir la confirmation de candidature";
  }
  
  if (!isValidEmail(email)) {
    return "Veuillez saisir un email valide (ex: nom@entreprise.com)";
  }
  
  return null;
};
```

## 📧 **Envoi de l'email de confirmation**

### 1. **Déclenchement automatique**

L'email est envoyé automatiquement après :
- ✅ Sauvegarde réussie de la candidature
- ✅ Upload des documents
- ✅ Validation de tous les champs

### 2. **Appel de la fonction Supabase**

```typescript
await supabase.functions.invoke('send_application_confirmation', {
  body: {
    to: toEmail,           // Email du candidat
    firstName: formData.firstName,
    jobTitle,              // Titre du poste
    applicationId: applicationIdForDocs,
  },
});
```

### 3. **Gestion des erreurs**

- **Non-bloquant** : L'échec de l'email n'empêche pas la candidature
- **Logs détaillés** : Toutes les erreurs sont enregistrées
- **Notifications utilisateur** : Messages appropriés selon le résultat

## 🛠️ **Utilitaires de validation**

### 1. **Fichier : `src/utils/emailValidation.ts`**

```typescript
// Validation d'email
export const isValidEmail = (email: string): boolean

// Récupération avec priorité
export const getCandidateEmail = (
  formEmail?: string,
  userEmail?: string,
  dbEmail?: string
): string | null

// Messages d'erreur
export const getEmailErrorMessage = (email: string): string | null
```

### 2. **Utilisation dans le formulaire**

```typescript
import { 
  getCandidateEmail, 
  isValidEmail, 
  getEmailErrorMessage 
} from "@/utils/emailValidation";

// Validation
const isEmailValid = isValidEmail(formData.email);

// Récupération
const toEmail = getCandidateEmail(formData.email, user?.email, dbEmail);

// Messages d'erreur
const errorMessage = getEmailErrorMessage(email);
```

## 🔍 **Débogage et tests**

### 1. **Composant de test**

`src/components/forms/EmailValidationTest.tsx` permet de tester :
- Validation d'email
- Logique de priorité
- Messages d'erreur

### 2. **Logs de console**

```typescript
console.log('Confirmation email sent successfully to:', toEmail);
console.warn('Confirmation email skipped: no valid recipient email found');
console.warn('Failed to send confirmation email (non-blocking):', mailErr);
```

## 📋 **Cas d'usage**

### 1. **Candidat avec email valide**
```
✅ Email récupéré depuis le formulaire
✅ Validation réussie
✅ Email de confirmation envoyé
✅ Notification de succès affichée
```

### 2. **Candidat sans email dans le formulaire**
```
⚠️ Email non trouvé dans le formulaire
✅ Email récupéré depuis l'authentification
✅ Validation réussie
✅ Email de confirmation envoyé
```

### 3. **Candidat sans email valide**
```
❌ Aucun email valide trouvé
⚠️ Candidature sauvegardée
⚠️ Avertissement affiché à l'utilisateur
```

## 🚀 **Déploiement**

### 1. **Configuration requise**

```bash
# Clé API Resend
supabase secrets set RESEND_API_KEY=votre_clé_api_resend

# Email d'expédition (optionnel)
supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"
```

### 2. **Déploiement de la fonction**

```bash
supabase functions deploy send_application_confirmation
```

## 📊 **Monitoring**

### 1. **Métriques disponibles**
- Nombre d'emails envoyés avec succès
- Nombre d'échecs d'envoi
- Emails sans destinataire valide
- Temps de traitement

### 2. **Logs Supabase**
- Dashboard Supabase > Functions > Logs
- Erreurs détaillées avec stack trace
- Métriques de performance

## 🔧 **Maintenance**

### 1. **Vérifications régulières**
- Test de la fonction Supabase
- Validation des templates d'email
- Vérification des clés API
- Monitoring des taux de livraison

### 2. **Mises à jour**
- Templates d'email
- Logique de validation
- Gestion des erreurs
- Configuration des priorités

---

**Note** : Ce processus garantit que chaque candidat reçoit une confirmation de sa candidature, améliorant ainsi l'expérience utilisateur et la professionnalité de la plateforme SEEG.
