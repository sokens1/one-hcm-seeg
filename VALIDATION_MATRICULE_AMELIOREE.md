# Validation améliorée du matricule lors de l'inscription

## 🎯 Objectif

Améliorer la validation du matricule pour éviter qu'un même matricule soit utilisé par plusieurs comptes.

## ✅ Modifications effectuées

### 1. Migration SQL (`supabase/migrations/20251017000001_verify_matricule_unique.sql`)

**Nouvelle fonction `verify_matricule`** qui effectue **2 vérifications** :

1. ✅ **Vérification dans `seeg_agents`** : Le matricule existe-t-il dans la base des agents SEEG ?
2. ✅ **Vérification dans `users`** : Le matricule n'est-il pas déjà utilisé par un autre compte ?

**Retour de la fonction :**
```json
{
  "exists_in_agents": true/false,
  "already_used": true/false,
  "is_valid": true/false,
  "message": "Message explicite"
}
```

**Messages possibles :**
- ✅ "Matricule valide"
- ❌ "Ce matricule n'existe pas dans la base SEEG"
- ❌ "Ce matricule est déjà utilisé par un autre compte"

### 2. Modification Frontend (`src/pages/Auth.tsx`)

- Adaptation du code pour utiliser la nouvelle fonction
- Affichage des messages d'erreur explicites à l'utilisateur
- Validation en temps réel (après 1 seconde de saisie)

## 🚀 Déploiement

### Étape 1 : Exécuter la migration SQL
Dans l'éditeur SQL de Supabase, exécutez le contenu du fichier :
```
supabase/migrations/20251017000001_verify_matricule_unique.sql
```

### Étape 2 : Déployer le frontend
Le code frontend est déjà modifié et prêt à être déployé.

## 📊 Impact sur les candidats existants

**⚠️ Important :** Les 121 candidats de la campagne 1 ont des matricules qui sont tous déjà dans la base `users`. 

Si ces comptes doivent être désactivés/supprimés, utilisez les requêtes préparées :
- `DESACTIVER_CANDIDATS_CAMPAGNE_1.sql` - Pour désactiver les comptes
- `LISTE_ID_MATRICULE_EMAIL_CAMPAGNE_1.sql` - Pour lister les matricules concernés

## 🧪 Test de la validation

### Scénario 1 : Matricule valide et non utilisé ✅
1. Saisir un matricule présent dans `seeg_agents`
2. Ce matricule n'est pas encore dans `users`
3. ✅ Résultat : "Matricule vérifié" (pastille verte)

### Scénario 2 : Matricule invalide ❌
1. Saisir un matricule qui n'existe pas dans `seeg_agents`
2. ❌ Résultat : "Ce matricule n'existe pas dans la base SEEG"

### Scénario 3 : Matricule déjà utilisé ❌
1. Saisir un matricule déjà présent dans `users`
2. ❌ Résultat : "Ce matricule est déjà utilisé par un autre compte"

## 🔍 Avantages

1. ✅ **Sécurité renforcée** : Un matricule = un seul compte
2. ✅ **Messages clairs** : L'utilisateur sait exactement pourquoi la validation échoue
3. ✅ **Validation double** : Existence ET unicité
4. ✅ **Performance** : Vérification côté serveur en une seule requête
5. ✅ **Logs détaillés** : Console logs pour le debugging

## 📝 Notes techniques

- La fonction SQL est en `SECURITY DEFINER` pour accéder aux tables
- Permissions accordées à `authenticated` et `anon`
- Le frontend cache le dernier matricule vérifié pour éviter les vérifications répétées
- Délai de 1 seconde (debounce) avant la vérification automatique

