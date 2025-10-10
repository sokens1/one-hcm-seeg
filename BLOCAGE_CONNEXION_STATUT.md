# Blocage de Connexion selon le Statut

## Implémentation Terminée

### Modifications Effectuées

#### 1. Hook `useAuth` (`src/hooks/useAuth.tsx`)
- Ajouté `userStatut: string | null` dans l'interface `AuthContextType`
- Ajouté l'état `const [userStatut, setUserStatut] = useState<string | null>(null)`
- Modifié la requête pour récupérer le statut : `.select('role, statut')`
- Mis à jour le realtime channel pour écouter les changements de statut
- Ajouté `userStatut` dans le return du Provider

#### 2. Page de Connexion (`src/pages/Auth.tsx`)
- Après authentification réussie, vérification du statut
- Si `statut !== 'actif'` :
  - Déconnexion automatique
  - Message d'erreur selon le statut
  - Arrêt du processus de connexion

#### 3. Routes Protégées
Vérification du statut ajoutée dans :
- `src/components/ProtectedRoute.tsx`
- `src/components/layout/ProtectedAdminRoute.tsx`
- `src/components/layout/ProtectedRecruiterRoute.tsx`
- `src/components/layout/ProtectedRecruiterReadRoute.tsx`

Affichage d'une page "Accès Restreint" si statut non-actif.

---

## Comportement

### Statuts et Messages

| Statut | Message | Connexion |
|--------|---------|-----------|
| `actif` | - | Autorisée |
| `en_attente` | "Votre compte est en attente de validation par notre équipe." | Bloquée |
| `inactif` | "Votre compte a été désactivé. Contactez l'administrateur." | Bloquée |
| `bloqué` | "Votre compte a été bloqué. Contactez l'administrateur." | Bloquée |
| `archivé` | "Votre compte a été archivé. Contactez l'administrateur." | Bloquée |

### Flux de Connexion

```
Utilisateur se connecte
  ↓
Authentification Supabase réussie
  ↓
Récupération role + statut
  ↓
Vérification statut
  ├─ statut = 'actif' → Connexion OK
  └─ statut ≠ 'actif' → Déconnexion + Message d'erreur
```

### Protection des Routes

```
Utilisateur tente d'accéder à une route protégée
  ↓
Vérification authentification
  ↓
Vérification statut
  ├─ statut = 'actif' → Accès autorisé
  └─ statut ≠ 'actif' → Page "Accès Restreint"
```

---

## Interface "Accès Restreint"

```
┌────────────────────────────────┐
│           ⚠️                   │
│                                │
│      Accès Restreint          │
│                                │
│  Votre compte est en attente   │
│  de validation par notre       │
│  équipe.                       │
│                                │
│  [Retour à l'accueil]         │
└────────────────────────────────┘
```

---

## Tests

### Test 1 : Candidat Actif
1. Statut = 'actif'
2. Connexion réussie
3. Redirection vers dashboard

### Test 2 : Candidat en Attente
1. Statut = 'en_attente'
2. Connexion bloquée
3. Message : "Votre compte est en attente de validation"
4. Déconnexion automatique

### Test 3 : Candidat Bloqué
1. Statut = 'bloqué'
2. Connexion bloquée
3. Message : "Votre compte a été bloqué"
4. Déconnexion automatique

### Test 4 : Accès Direct aux Routes
1. Utilisateur avec statut 'inactif' tente d'accéder à /candidate/dashboard
2. Page "Accès Restreint" affichée
3. Bouton "Retour à l'accueil"

---

## Fichiers Modifiés

1. `src/hooks/useAuth.tsx` - Ajout du statut dans le contexte
2. `src/pages/Auth.tsx` - Vérification lors de la connexion
3. `src/components/ProtectedRoute.tsx` - Protection par statut
4. `src/components/layout/ProtectedAdminRoute.tsx` - Protection par statut
5. `src/components/layout/ProtectedRecruiterRoute.tsx` - Protection par statut
6. `src/components/layout/ProtectedRecruiterReadRoute.tsx` - Protection par statut

---

## Avantages

- Sécurité renforcée : Impossible de contourner la vérification
- Messages clairs : L'utilisateur comprend pourquoi il ne peut pas se connecter
- Temps réel : Le statut est mis à jour en temps réel via Realtime
- Cohérent : Vérification à la connexion ET sur toutes les routes protégées

---

## Prochaine Étape

Pour tester, vous pouvez manuellement changer le statut d'un utilisateur :

```sql
UPDATE public.users 
SET statut = 'en_attente' 
WHERE email = 'test@example.com';
```

Puis essayer de se connecter avec cet utilisateur.

