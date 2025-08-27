# Configuration Email - SEEG Talent Flow

## Vue d'ensemble

Le système d'envoi d'email de confirmation de candidature est entièrement configuré et fonctionnel. Il utilise l'API Resend pour envoyer des emails professionnels aux candidats après soumission de leur candidature.

## Configuration requise

### 1. Variables d'environnement Supabase

#### Étape 1 : Installer Supabase CLI
```bash
# Avec npm
npm install -g supabase

# Avec yarn
yarn global add supabase

# Avec Homebrew (macOS)
brew install supabase/tap/supabase
```

#### Étape 2 : Se connecter à votre projet Supabase
```bash
# Se connecter à votre compte Supabase
supabase login

# Lier votre projet local au projet distant
supabase link --project-ref VOTRE_PROJECT_REF
```

**Trouver votre PROJECT_REF :**
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans les paramètres du projet, copiez le "Reference ID"

#### Étape 3 : Configurer la clé API Resend
```bash
# Remplacez VOTRE_CLE_API_RESEND par la clé obtenue sur Resend
supabase secrets set RESEND_API_KEY=VOTRE_CLE_API_RESEND

# Exemple concret :
supabase secrets set RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz
```

#### Étape 4 : Configurer l'email d'expédition (optionnel)
```bash
# Email personnalisé d'expédition
supabase secrets set FROM_EMAIL="SEEG Recrutement <recrutement@seeg.ga>"

# Ou utiliser l'email par défaut du chatbot
supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"
```

#### Étape 5 : Vérifier la configuration
```bash
# Lister tous les secrets configurés
supabase secrets list

# Vous devriez voir :
# RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz
# FROM_EMAIL=SEEG Recrutement <recrutement@seeg.ga>
```

### 2. Configuration Resend

#### Étape 1 : Créer un compte Resend
1. Allez sur [Resend.com](https://resend.com)
2. Cliquez sur "Get Started" ou "Sign Up"
3. Créez votre compte avec votre email professionnel

#### Étape 2 : Obtenir votre clé API
1. **Connectez-vous** à votre dashboard Resend
2. **Allez dans "API Keys"** (clés API) dans le menu de gauche
3. **Cliquez sur "Create API Key"** (créer une clé API)
4. **Donnez un nom** à votre clé (ex: "SEEG-TalentFlow-Production")
5. **Sélectionnez les permissions** :
   - ✅ `emails:send` (envoyer des emails)
   - ✅ `domains:read` (lire les domaines)
6. **Cliquez sur "Create"** (créer)
7. **Copiez la clé API** qui s'affiche (elle commence par `re_...`)

⚠️ **Important** : Cette clé ne s'affichera qu'une seule fois ! Sauvegardez-la immédiatement.

#### Étape 3 : Configurer votre domaine d'envoi
1. **Allez dans "Domains"** dans le menu de gauche
2. **Cliquez sur "Add Domain"** (ajouter un domaine)
3. **Entrez votre domaine** (ex: `seeg-talentsource.com` ou `seeg.ga`)
4. **Suivez les instructions DNS** pour configurer les enregistrements :
   - Ajoutez les enregistrements DKIM, SPF et DMARC
   - Ces enregistrements améliorent la délivrabilité des emails
5. **Attendez la vérification** (peut prendre jusqu'à 24h)

#### Étape 4 : Tester l'envoi d'email
1. **Allez dans "API Keys"**
2. **Cliquez sur "Test"** à côté de votre clé
3. **Envoyez un email de test** pour vérifier que tout fonctionne

## Fonctionnalités implémentées

### ✅ Envoi automatique d'email
- **Déclencheur** : Soumission réussie d'une candidature
- **Destinataire** : Email du candidat (depuis le formulaire ou le profil utilisateur)
- **Expéditeur** : support@seeg-talentsource.com (email du chatbot)
- **Non-bloquant** : L'échec de l'envoi d'email n'empêche pas la candidature

### ✅ Template d'email professionnel
- **Design moderne** avec en-tête SEEG
- **Informations complètes** : prénom, poste, contacts
- **Responsive** et compatible tous clients email
- **Version texte** pour compatibilité maximale

### ✅ Gestion des erreurs
- Logs détaillés en cas d'échec
- Notifications utilisateur appropriées
- Fallback gracieux

## Structure des emails

### Sujet
```
Confirmation de candidature – [Titre du poste]
```

### Contenu
- Salutation personnalisée
- Confirmation de réception
- Détails du poste
- Informations de contact
- Signature SEEG

## Fichiers impliqués

- `supabase/functions/send_application_confirmation/index.ts` - Fonction Supabase
- `src/components/forms/ApplicationForm.tsx` - Intégration dans le formulaire
- `src/config/email.ts` - Configuration centralisée

## Test et déploiement

### Test local
```bash
# Démarrer Supabase localement
supabase start

# Tester la fonction
supabase functions serve send_application_confirmation
```

### Déploiement production
```bash
# Déployer la fonction
supabase functions deploy send_application_confirmation

# Vérifier les secrets
supabase secrets list
```

## Monitoring

- Logs disponibles dans le dashboard Supabase
- Métriques d'envoi via Resend
- Notifications d'erreur dans la console

## 🔧 **Dépannage et FAQ**

### **Problèmes courants et solutions**

#### 1. **Erreur "RESEND_API_KEY not set"**
```bash
# Solution : Vérifiez que la clé est bien configurée
supabase secrets list

# Si elle n'apparaît pas, reconfigurez-la :
supabase secrets set RESEND_API_KEY=VOTRE_CLE_API_RESEND
```

#### 2. **Erreur "Failed to send email"**
- ✅ Vérifiez que votre clé API Resend est valide
- ✅ Vérifiez que votre domaine est bien configuré sur Resend
- ✅ Vérifiez les logs dans le dashboard Supabase

#### 3. **Emails non reçus par les candidats**
- ✅ Vérifiez le dossier spam des candidats
- ✅ Vérifiez que votre domaine est vérifié sur Resend
- ✅ Testez l'envoi depuis le dashboard Resend

#### 4. **Problème de déploiement de la fonction**
```bash
# Redéployez la fonction
supabase functions deploy send_application_confirmation

# Vérifiez les logs
supabase functions logs send_application_confirmation
```

### **FAQ**

#### Q: Combien coûte Resend ?
**R:** Resend propose un plan gratuit avec 3 000 emails/mois, puis $0.80 pour 1 000 emails supplémentaires.

#### Q: Puis-je utiliser Gmail ou Outlook à la place ?
**R:** Non, pour la production, il est recommandé d'utiliser un service d'email transactionnel comme Resend pour une meilleure délivrabilité.

#### Q: Comment tester avant la production ?
**R:** Utilisez `supabase functions serve send_application_confirmation` en local, ou testez directement depuis le dashboard Resend.

#### Q: Les emails sont-ils sécurisés ?
**R:** Oui, Resend utilise TLS/SSL et respecte les standards de sécurité email (SPF, DKIM, DMARC).

## 📞 **Support**

Pour toute question technique :
- 📧 **Email** : support@seeg-talentsource.com
- 📞 **Téléphone** : +241 076402886
- 🌐 **Documentation Resend** : [docs.resend.com](https://docs.resend.com)
- 🔧 **Support Supabase** : [supabase.com/support](https://supabase.com/support)
