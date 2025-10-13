# 🔒 Filtrage des offres Interne/Externe

## 🎯 Objectif
Les offres avec le statut **"Interne"** ne sont visibles que par les candidats ayant le statut `candidate_status = 'interne'` dans la table `users`.

---

## ✅ Modifications effectuées

### 1. `src/hooks/useAuth.tsx`
✅ Ajout du champ `candidateStatus` dans l'interface `AuthContextType`
✅ Récupération de `candidate_status` depuis la table `users`
✅ Mise à jour de l'état `candidateStatus`
✅ Export de `candidateStatus` dans le contexte

### 2. `src/hooks/useJobOffers.tsx`
✅ Import de `useAuth` pour récupérer le statut du candidat
✅ Modification de `fetchJobOffers()` pour accepter `candidateStatus` en paramètre
✅ Ajout du filtrage des offres selon le statut :
   - **Offres externes** : Visibles par TOUS
   - **Offres internes** : Visibles UNIQUEMENT par les candidats internes
✅ Logs de debug pour tracer le filtrage
✅ Mise à jour de la queryKey pour réagir au changement de statut

---

## 📊 Règles de visibilité

### Pour les offres EXTERNES (`status_offerts = 'externe'`)
✅ Visibles par **tous les candidats** (connectés ou non)
✅ Visibles par les candidats internes
✅ Visibles par les candidats externes
✅ Visibles par les visiteurs (non connectés)

### Pour les offres INTERNES (`status_offerts = 'interne'`)
✅ Visibles UNIQUEMENT par les candidats ayant `candidate_status = 'interne'`
🚫 **Masquées** pour les candidats externes
🚫 **Masquées** pour les visiteurs non connectés
🚫 **Masquées** pour les candidats sans statut défini

### Pour les offres SANS statut (`status_offerts = NULL`)
✅ Considérées comme **externes** par défaut
✅ Visibles par **tous**

---

## 🧪 Comment tester

### Prérequis
Vous devez avoir deux comptes candidats :
1. **Candidat interne** : `candidate_status = 'interne'` dans la table `users`
2. **Candidat externe** : `candidate_status = 'externe'` ou `NULL`

### Configuration des candidats (SQL)

```sql
-- Marquer un candidat comme INTERNE
UPDATE users
SET candidate_status = 'interne'
WHERE email = 'candidat.interne@example.com';

-- Marquer un candidat comme EXTERNE
UPDATE users
SET candidate_status = 'externe'
WHERE email = 'candidat.externe@example.com';
```

### Test 1 : Créer une offre interne

1. **Connectez-vous en tant que recruteur**
2. **Créez une nouvelle offre** :
   - Titre : "Test Offre Interne"
   - Statut : **"Interne"**
   - Remplissez les autres champs
3. **Publiez l'offre**

### Test 2 : Vérifier la visibilité (Candidat interne)

1. **Déconnectez-vous**
2. **Connectez-vous avec le compte candidat interne**
3. **Allez sur la page des offres** (`/jobs`)
4. **Console (F12)** : Cherchez le log
   ```
   🔒 [FILTER] Offre interne "Test Offre Interne" - Visible (candidat interne)
   📊 [FILTER] Offres après filtrage statut: X/Y
   ```
5. **✅ Vous devez voir l'offre "Test Offre Interne"**

### Test 3 : Vérifier la visibilité (Candidat externe)

1. **Déconnectez-vous**
2. **Connectez-vous avec le compte candidat externe**
3. **Allez sur la page des offres** (`/jobs`)
4. **Console (F12)** : Cherchez le log
   ```
   🚫 [FILTER] Offre interne "Test Offre Interne" - Masquée (candidat non interne)
   📊 [FILTER] Offres après filtrage statut: X/Y (devrait être -1 par rapport au candidat interne)
   ```
5. **❌ Vous ne devez PAS voir l'offre "Test Offre Interne"**

### Test 4 : Créer une offre externe

1. **Connectez-vous en tant que recruteur**
2. **Créez une nouvelle offre** :
   - Titre : "Test Offre Externe"
   - Statut : **"Externe"**
3. **Publiez l'offre**

### Test 5 : Vérifier que l'offre externe est visible par tous

1. **Testez avec le candidat interne** → ✅ Visible
2. **Testez avec le candidat externe** → ✅ Visible
3. **Testez sans connexion** (mode visiteur) → ✅ Visible

---

## 📊 Logs de debug

### Candidat interne connecté
```
📊 [FILTER] Offres après filtrage statut: 16/16
```
→ Toutes les offres visibles (internes + externes)

### Candidat externe connecté
```
🚫 [FILTER] Offre interne "..." - Masquée (candidat non interne)
🚫 [FILTER] Offre interne "..." - Masquée (candidat non interne)
📊 [FILTER] Offres après filtrage statut: 12/16
```
→ Seulement les offres externes visibles (4 offres internes masquées)

### Visiteur non connecté
```
🚫 [FILTER] Offre interne "..." - Masquée (candidat non interne)
📊 [FILTER] Offres après filtrage statut: 12/16
```
→ Seulement les offres externes visibles

---

## 🔐 Sécurité

### Niveau Frontend
✅ Les offres internes sont filtrées côté client
✅ Le filtrage se fait dans `useJobOffers` avant l'affichage
✅ Les candidats externes ne voient pas les offres internes dans la liste

### Niveau Backend (Important !)
⚠️ **Le filtrage actuel est uniquement côté frontend**

Pour une sécurité complète, vous devriez aussi :
1. **Ajouter une RLS policy** dans Supabase pour filtrer au niveau de la base
2. **Vérifier le statut côté serveur** lors de la candidature

**Requête SQL recommandée pour RLS :**
```sql
-- Policy pour les candidats : ne voir que les offres externes ou les internes si candidat interne
CREATE POLICY "Candidats voient offres selon statut" ON job_offers
FOR SELECT
USING (
  status = 'active'
  AND (
    -- Offres externes visibles par tous
    status_offerts = 'externe'
    OR status_offerts IS NULL
    OR (
      -- Offres internes visibles uniquement par candidats internes
      status_offerts = 'interne'
      AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.candidate_status = 'interne'
      )
    )
  )
);
```

---

## 📈 Statistiques de filtrage

Pour voir combien d'offres sont filtrées :

```sql
SELECT 
    status_offerts,
    COUNT(*) as nombre_offres
FROM job_offers
WHERE status = 'active'
GROUP BY status_offerts
ORDER BY status_offerts;
```

**Exemple de résultat :**
```
status_offerts | nombre_offres
---------------|--------------
externe        | 12
interne        | 4
NULL           | 2
```

---

## ✅ Avantages

1. **🔒 Confidentialité** : Les offres internes ne sont pas visibles aux candidats externes
2. **🎯 Ciblage** : Les candidats internes voient des opportunités réservées
3. **📊 Clarté** : Distinction nette entre mobilité interne et recrutement externe
4. **🔄 Flexibilité** : Le statut peut être modifié à tout moment
5. **📱 Temps réel** : Le filtrage s'adapte immédiatement au changement de statut

---

## 🆘 Dépannage

### Les offres internes sont visibles par tous

➡️ **Vérifiez dans la console :**
```
📊 [FILTER] Offres après filtrage statut: X/Y
```

Si X = Y, aucune offre n'est filtrée. Vérifiez :
1. Le `candidateStatus` est bien récupéré (console → useAuth)
2. Les offres ont bien `status_offerts = 'interne'` en base

### Un candidat interne ne voit aucune offre interne

➡️ **Vérifiez en base :**
```sql
SELECT candidate_status FROM users WHERE id = 'ID_DU_CANDIDAT';
```

Le résultat doit être exactement `'interne'` (pas 'Interne', 'INTERNE', etc.)

### Les logs de filtrage ne s'affichent pas

➡️ **Ouvrez la console (F12)**
➡️ **Rafraîchissez la page des offres**
➡️ **Cherchez les logs** : 🔒, 🚫, 📊

---

## 🎉 Résultat final

**Candidats internes :**
- ✅ Voient les offres externes
- ✅ Voient les offres internes
- 📊 Total : Toutes les offres actives

**Candidats externes :**
- ✅ Voient les offres externes
- 🚫 Ne voient PAS les offres internes
- 📊 Total : Seulement les offres externes

**Visiteurs non connectés :**
- ✅ Voient les offres externes
- 🚫 Ne voient PAS les offres internes
- 📊 Total : Seulement les offres externes

---

**Date de mise à jour** : 9 octobre 2025, 16h30
**Statut** : ✅ Opérationnel
**Mode campagne** : Désactivé

