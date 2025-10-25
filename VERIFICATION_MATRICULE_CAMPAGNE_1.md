# Vérification du matricule - Exclusion des candidats de la campagne 1

## 🎯 Objectif

Empêcher les 121 candidats qui ont postulé lors de la **campagne 1** de créer un nouveau compte avec le même matricule.

## ✅ Logique de vérification

### Étape 1 : Vérifier dans `seeg_agents`
Le matricule existe-t-il dans la base des agents SEEG ?
- ✅ **OUI** → Continuer à l'étape 2
- ❌ **NON** → Refuser avec le message : *"Ce matricule n'existe pas dans la base SEEG"*

### Étape 2 : Vérifier les candidatures campagne 1
Le matricule a-t-il déjà été utilisé pour postuler lors de la campagne 1 ?

**Requête SQL** :
```sql
SELECT EXISTS (
    SELECT 1 
    FROM users u
    INNER JOIN applications a ON a.candidate_id = u.id
    INNER JOIN job_offers jo ON a.job_offer_id = jo.id
    WHERE u.matricule = p_matricule
    AND jo.campaign_id = 1
)
```

- ✅ **NON** → Matricule valide, autoriser l'inscription
- ❌ **OUI** → Refuser avec le message : *"Le titulaire de ce matricule a déjà postulé lors de la campagne 1"*

## 📊 Scénarios

### Scénario 1 : Agent SEEG, n'a pas postulé en campagne 1 ✅
1. Matricule **6789** existe dans `seeg_agents` ✅
2. Matricule **6789** n'a pas postulé en campagne 1 ✅
3. **Résultat** : Inscription autorisée

### Scénario 2 : Agent SEEG, a déjà postulé en campagne 1 ❌
1. Matricule **7030** existe dans `seeg_agents` ✅
2. Matricule **7030** a postulé en campagne 1 ❌
3. **Résultat** : Inscription refusée
4. **Message** : "Le titulaire de ce matricule a déjà postulé lors de la campagne 1"

### Scénario 3 : Matricule invalide ❌
1. Matricule **9999** n'existe pas dans `seeg_agents` ❌
2. **Résultat** : Inscription refusée
3. **Message** : "Ce matricule n'existe pas dans la base SEEG"

## 🔍 Les 121 candidats concernés

Ces candidats ont postulé lors de la **campagne 1** et ne peuvent plus créer de nouveau compte :
- Liste complète disponible dans : `LISTE_ID_MATRICULE_EMAIL_CAMPAGNE_1.sql`
- Statistiques : `ANALYSE_EMAIL_MATRICULE_CAMPAGNE_1.sql`

## 🚀 Déploiement

### Fichier SQL à exécuter
```
supabase/migrations/20251017000003_verify_matricule_simple.sql
```

### Dans Supabase SQL Editor
1. Copier le contenu du fichier
2. Exécuter la migration
3. La fonction `verify_matricule(text)` sera recréée

## 📝 Retour de la fonction

La fonction retourne un objet JSON :

```json
{
  "exists_in_agents": true/false,
  "already_used": true/false,
  "is_valid": true/false,
  "message": "Message explicatif"
}
```

### Exemples de retour

**Matricule valide** :
```json
{
  "exists_in_agents": true,
  "already_used": false,
  "is_valid": true,
  "message": "Matricule valide"
}
```

**Matricule déjà utilisé en campagne 1** :
```json
{
  "exists_in_agents": true,
  "already_used": true,
  "is_valid": false,
  "message": "Le titulaire de ce matricule a deja postule lors de la campagne 1"
}
```

## 🎯 Avantages de cette approche

1. ✅ **Ciblée** : Seuls les candidats de la campagne 1 sont bloqués
2. ✅ **Précise** : Vérification sur les candidatures réelles, pas juste l'existence dans `users`
3. ✅ **Flexible** : Un même matricule peut être utilisé pour les campagnes 2 et 3
4. ✅ **Traçable** : On sait exactement pourquoi un matricule est refusé

## ⚠️ Note importante

Cette vérification est **spécifique à la campagne 1**. Les agents SEEG qui n'ont pas postulé en campagne 1 peuvent s'inscrire normalement pour les campagnes 2 et 3.

