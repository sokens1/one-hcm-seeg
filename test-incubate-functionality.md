# 🧪 Test de la fonctionnalité "Incuber"

## 📋 Plan de test

### **1. Vérification des statuts dans la base de données**
```sql
-- Vérifier les statuts existants
SELECT DISTINCT status FROM applications ORDER BY status;

-- Vérifier les applications avec statut 'candidature' (candidats à incuber)
SELECT id, candidate_id, status, created_at 
FROM applications 
WHERE status = 'candidature' 
ORDER BY created_at DESC 
LIMIT 5;
```

### **2. Test de la fonctionnalité "Incuber"**

#### **Étapes de test :**
1. **Se connecter en tant que recruteur/admin**
2. **Aller sur une candidature avec statut 'candidature'**
3. **Cliquer sur le bouton "Incuber"**
4. **Vérifier que :**
   - Le statut change vers 'incubation'
   - Un toast de confirmation s'affiche
   - L'interface se met à jour
   - Le protocole 2 devient accessible

#### **Points de vérification :**
- ✅ Le bouton "Incuber" est visible pour les candidats en statut 'candidature'
- ✅ Le bouton "Incuber" n'est pas visible pour les observateurs
- ✅ Le statut est correctement mis à jour en base de données
- ✅ L'interface reflète le nouveau statut
- ✅ Le protocole 2 devient accessible après incubation

### **3. Vérification des permissions RLS**

```sql
-- Vérifier les politiques RLS pour les applications
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'applications';

-- Tester la mise à jour du statut
UPDATE applications 
SET status = 'incubation', updated_at = NOW() 
WHERE id = 'APPLICATION_ID_TEST' 
RETURNING id, status, updated_at;
```

### **4. Logs de débogage**

Le code contient déjà des logs détaillés dans `useApplications.tsx` :
- `🔧 [updateStatusMutation] Mise à jour du statut`
- `👤 [updateStatusMutation] Données utilisateur`
- `🔍 [updateStatusMutation] Rôle utilisateur`
- `🔄 [updateStatusMutation] Tentative avec requête directe`
- `✅ [updateStatusMutation] Statut mis à jour avec succès`

## 🚨 Problèmes potentiels identifiés

### **1. Problème de permissions RLS**
Si la mise à jour échoue, cela peut être dû aux politiques RLS. Le code contient déjà une logique de contournement.

### **2. Statut 'incubation' vs 'incubé'**
- **Code** : utilise `'incubation'`
- **Interface** : affiche "En évaluation" ou "Incubé"
- **Base de données** : doit stocker `'incubation'`

### **3. Accès au protocole 2**
Le protocole 2 n'est accessible que si `application.status === 'incubation'`

## ✅ Résultat attendu

Après avoir cliqué sur "Incuber" :
1. **Statut en base** : `'incubation'`
2. **Interface** : Badge "En évaluation" ou "Incubé"
3. **Protocole 2** : Accessible et non en lecture seule
4. **Toast** : "Candidat incubé - Le candidat a été incubé et peut maintenant passer au protocole 2"

## 🔧 Commandes de test

```bash
# 1. Démarrer l'application
npm run dev

# 2. Se connecter en tant que recruteur
# 3. Aller sur une candidature
# 4. Cliquer sur "Incuber"
# 5. Vérifier le changement de statut
```
