# Optimisation du Formulaire d'Inscription

## ✅ Modifications Effectuées

### 1. 🎯 Sélection du Type de Candidat

Ajout d'un sélecteur visuel permettant de choisir entre :
- **Candidat Interne** : Employé SEEG
- **Candidat Externe** : Hors SEEG

### 2. 📧 Validation Email Dynamique

#### Pour les Candidats Internes :
- **Email professionnel SEEG requis** : Le domaine `@seeg.com` est obligatoire
- **Pattern de validation** : `.*@seeg\.com$`
- **Message d'erreur** : "L'email doit être un email professionnel SEEG (@seeg.com)"
- **Checkbox "Je n'ai pas d'email professionnel SEEG"** :
  - Permet aux internes sans email SEEG d'utiliser une adresse classique
  - Réinitialise automatiquement le champ email lors du cochage

#### Pour les Candidats Externes :
- Email classique accepté (tout domaine)
- Pas de validation spécifique sur le domaine

### 3. 🔢 Gestion du Matricule

#### Affichage Conditionnel :
- **Candidat Interne** : Champ matricule **affiché et requis**
- **Candidat Externe** : Champ matricule **masqué**

#### Fonctionnalités :
- Vérification automatique en base de données après 1 seconde
- Indicateur visuel de validation (bordure verte + message "Matricule vérifié")
- Message d'erreur en cas de matricule invalide ou inexistant
- Icône de chargement pendant la vérification
- Désactivation des champs suivants tant que le matricule n'est pas validé (pour les internes)

### 4. 🗑️ Champs Retirés

Les champs suivants ont été supprimés du formulaire :
- ❌ Poste actuel
- ❌ Années d'expérience à la SEEG ou secteur similaire

### 5. ✅ Champs Conservés

Les champs suivants sont présents pour tous les types de candidats :
- Prénom
- Nom
- Email (avec validation dynamique)
- Téléphone
- Date de naissance
- Sexe (Homme/Femme)
- Adresse
- Mot de passe
- Confirmation mot de passe

### 6. 🔒 Logique de Désactivation

Pour les **candidats internes** uniquement :
- Les champs suivants sont désactivés tant que le matricule n'est pas validé :
  - Téléphone
  - Date de naissance
  - Sexe
  - Adresse
  - Mot de passe
  - Confirmation mot de passe

Pour les **candidats externes** :
- Tous les champs sont actifs immédiatement (pas de matricule requis)

## 📊 Structure des Données

### État du Formulaire

```typescript
{
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  matricule: string;
  dateOfBirth: string;
  sexe: string;
  adresse: string;
  candidateStatus: "interne" | "externe"; // Nouveau champ
  noSeegEmail: boolean; // Nouveau champ
}
```

### Données Envoyées à l'API

```json
{
  "email": "prenom.nom@seeg.com",
  "password": "Password#2025",
  "first_name": "Prénom",
  "last_name": "Nom",
  "matricule": 123456,
  "phone": "+24106223344",
  "date_of_birth": "1994-06-12",
  "sexe": "M",
  "adresse": "bikele"
}
```

**Note** : Le champ `matricule` est optionnel et n'est envoyé que pour les candidats internes.

## 🎨 Interface Utilisateur

### Design
- **Cartes de sélection** : Design moderne avec bordure primaire pour la sélection active
- **Icônes** : `Building2` pour interne, `User` pour externe
- **États visuels** :
  - Bordure verte + message pour matricule validé
  - Bordure rouge + message d'erreur pour matricule invalide
  - Spinner de chargement pendant la vérification
  - Champs désactivés avec opacité réduite

### Responsive
- Grid 2 colonnes pour les cartes de sélection
- Grid 2 colonnes pour date de naissance et sexe
- Adaptation mobile avec `sm:grid-cols-2`

## 🔄 Flux Utilisateur

### Candidat Interne
1. Sélectionner "Candidat Interne"
2. Remplir prénom, nom
3. Choisir l'email :
   - Email SEEG (`@seeg.com`) **OU**
   - Cocher "Je n'ai pas d'email professionnel SEEG" pour utiliser une adresse classique
4. Saisir le matricule → Vérification automatique
5. Une fois validé, remplir les autres champs
6. Soumettre le formulaire

### Candidat Externe
1. Sélectionner "Candidat Externe"
2. Remplir tous les champs (pas de matricule)
3. Tous les champs sont actifs immédiatement
4. Soumettre le formulaire

## 🔧 Intégration API

### Endpoint
`POST /api/v1/auth/signup`

### Validation Backend
L'API Azure valide :
- Format email
- Force du mot de passe
- Unicité de l'email
- Validité du matricule (si fourni)
- Format de la date de naissance
- Valeur du sexe ('M' ou 'F')

## 🚀 Déploiement

1. Tester en local avec `npm run dev`
2. Vérifier les deux types d'inscription (interne/externe)
3. Tester la validation du matricule
4. Tester la validation email SEEG
5. Tester la checkbox "Pas d'email SEEG"
6. Déployer sur Vercel

## 📝 Notes Importantes

- Le champ `MATRICULE_REQUIRED` reste dans le code pour compatibilité mais n'est plus utilisé
- La logique de validation du matricule est désormais gérée par le `candidateStatus`
- La vérification du matricule utilise Supabase pour vérifier l'existence dans la table `employees`
- Les candidats externes n'ont pas besoin de matricule et peuvent s'inscrire directement
