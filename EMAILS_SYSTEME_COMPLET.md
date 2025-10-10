# Système d'Emails Complet

## ✅ Emails Implémentés

### 1. **Email de Bienvenue** (Tous les candidats)
- **API** : `/api/send-welcome-email`
- **Destinataire** : Candidat inscrit
- **Sujet** : "Bienvenue sur OneHCM - SEEG Talent Source"
- **Sexe** : ✅ Détecté automatiquement (Monsieur/Madame)
- **Quand** : Après toute inscription réussie

### 2. **Email de Demande d'Accès** (Candidats internes sans email SEEG)
- **API** : `/api/send-access-request-email`
- **Destinataires** : Admin + Candidat
- **Sujets** : 
  - Admin: "🔔 Nouvelle Demande d'Accès - Candidat Interne"
  - Candidat: "Demande d'Accès en Attente de Validation"
- **Sexe** : ✅ Détecté automatiquement
- **Quand** : Inscription interne + checkbox "Pas d'email SEEG"

### 3. **Email d'Accès Validé** (Nouvellement créé)
- **API** : `/api/send-access-approved-email`
- **Destinataire** : Candidat approuvé
- **Sujet** : "✅ Votre Accès à OneHCM a été Validé"
- **Sexe** : ✅ Détecté automatiquement
- **Quand** : Admin approuve une demande d'accès

---

## 📧 Templates d'Emails

### Email de Bienvenue
```
De: One HCM - SEEG <support@seeg-talentsource.com>
À: candidat@example.com
Sujet: Bienvenue sur OneHCM - SEEG Talent Source

Monsieur/Madame Arthur CROWN,  ← Sexe détecté

Bienvenue sur la plateforme OneHCM - SEEG Talent Source !

Votre inscription a été effectuée avec succès.

Prochaines étapes :
• Consultez les offres d'emploi
• Postulez aux postes
• Suivez vos candidatures

Cordialement,
Équipe Support OneHCM
```

### Email d'Accès Validé
```
De: One HCM - SEEG <support@seeg-talentsource.com>
À: candidat@gmail.com
Sujet: ✅ Votre Accès à OneHCM a été Validé

Monsieur/Madame Arthur CROWN,  ← Sexe détecté

Nous avons le plaisir de vous informer que votre demande d'accès 
a été approuvée.

┌─────────────────────────────┐
│ ✅ Votre compte est actif   │
│ Vous pouvez vous connecter  │
└─────────────────────────────┘

Vos prochaines étapes :
• Connectez-vous avec votre email
• Complétez votre profil
• Consultez les offres
• Postulez aux postes

Bonne chance !

L'équipe OneHCM
```

---

## 🔄 Flux d'Approbation

### Scénario : Admin Approuve une Demande

```
1. Admin accède au dashboard
         ↓
2. Voit les demandes en attente (vue pending_access_requests)
         ↓
3. Clique sur "Approuver" pour une demande
         ↓
4. Frontend appelle : supabase.rpc('approve_access_request', { request_id: 'xxx' })
         ↓
5. Fonction SQL :
   - Met statut utilisateur à 'actif'
   - Met statut demande à 'approved'
   - Crée une entrée dans email_notifications
         ↓
6. Frontend récupère les infos et envoie l'email :
   POST /api/send-access-approved-email
   {
     userEmail: "candidat@gmail.com",
     firstName: "Arthur",
     lastName: "CROWN",
     sexe: "M"
   }
         ↓
7. Email envoyé au candidat
         ↓
8. Candidat peut maintenant se connecter
```

---

## 🛠️ Utilisation Frontend (Dashboard Admin)

### Code Exemple
```typescript
// Dans le dashboard admin
const handleApproveAccess = async (requestId: string) => {
  try {
    // 1. Récupérer les infos du candidat
    const { data: request } = await supabase
      .from('access_requests')
      .select(`
        user_id,
        users!inner(email, first_name, last_name, sexe)
      `)
      .eq('id', requestId)
      .single();

    if (!request) {
      toast.error('Demande non trouvée');
      return;
    }

    // 2. Approuver la demande
    const { error } = await supabase.rpc('approve_access_request', {
      request_id: requestId
    });

    if (error) {
      toast.error('Erreur lors de l\'approbation');
      return;
    }

    // 3. Envoyer l'email de validation
    await fetch('/api/send-access-approved-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: request.users.email,
        firstName: request.users.first_name,
        lastName: request.users.last_name,
        sexe: request.users.sexe,
      }),
    });

    toast.success('Demande approuvée ! Email envoyé au candidat.');
  } catch (error) {
    console.error('Erreur:', error);
    toast.error('Une erreur est survenue');
  }
};
```

---

## 📊 Détection du Sexe

### Dans tous les emails
```typescript
const title = sexe === 'F' ? 'Madame' : 'Monsieur';
```

**Résultat :**
- `sexe = 'F'` → "Madame Arthur CROWN"
- `sexe = 'M'` → "Monsieur Arthur CROWN"
- `sexe = null` → "Monsieur Arthur CROWN" (par défaut)

### Body des Requêtes
```json
{
  "userEmail": "candidat@example.com",
  "firstName": "Arthur",
  "lastName": "CROWN",
  "sexe": "M"  // ← Toujours inclure
}
```

---

## 🗂️ Table `email_notifications` (Optionnelle)

Pour tracker les emails à envoyer :

```sql
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  email_type TEXT, -- 'access_approved', 'access_rejected', etc.
  recipient_email TEXT,
  data JSONB, -- Données pour le template
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);
```

---

## 🧪 Tests

### Test 1 : Email de Bienvenue
```
1. S'inscrire comme externe (Homme)
2. Vérifier l'email reçu
3. Doit afficher : "Monsieur Arthur CROWN"
```

### Test 2 : Email de Bienvenue (Femme)
```
1. S'inscrire comme externe (Femme)
2. Vérifier l'email reçu
3. Doit afficher : "Madame Marie DUPONT"
```

### Test 3 : Email d'Accès Validé
```
1. Inscription interne sans email SEEG (Homme)
2. Admin approuve la demande
3. Email envoyé
4. Doit afficher : "Monsieur Arthur CROWN"
5. Contenu : "✅ Votre compte est maintenant actif"
```

---

## 📁 Fichiers Modifiés

### API (Production - Vercel)
1. ✅ `api/send-welcome-email.ts` - Détection sexe
2. ✅ `api/send-access-request-email.ts` - Déjà OK
3. ✅ `api/send-access-approved-email.ts` - **Nouveau** avec détection sexe

### Middlewares (Dev - Vite)
1. ✅ `vite.config.ts` - `/api/send-welcome-email` avec détection sexe
2. ✅ `vite.config.ts` - `/api/send-access-request-email` - Déjà OK
3. ✅ `vite.config.ts` - `/api/send-access-approved-email` - **Nouveau**

### Migration
1. ✅ `supabase/migrations/20250110000001_update_internal_candidate_status.sql` - Fonction d'approbation mise à jour

### Frontend
1. ✅ `src/pages/Auth.tsx` - Envoie le sexe dans l'email de bienvenue

---

## ⚠️ Redémarrage Requis

**Les nouveaux middlewares nécessitent un redémarrage :**
```bash
Ctrl + C
npm run dev
```

---

## ✅ Résumé

| Email | Destinataire | Sexe Détecté | Status |
|-------|-------------|--------------|--------|
| Bienvenue | Candidat | ✅ Oui | ✅ Opérationnel |
| Demande d'accès (Admin) | Admin | ❌ Non (pas nécessaire) | ✅ Opérationnel |
| Demande d'accès (Candidat) | Candidat | ✅ Oui | ✅ Opérationnel |
| Accès validé | Candidat | ✅ Oui | ✅ **Nouveau** |

**Tous les emails détectent maintenant le sexe correctement !** 🎯✨
