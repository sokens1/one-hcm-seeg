# Diagnostic et Solution : Documents Manquants pour une Candidature

## 🔍 Problème Identifié

**Candidat ID:** `124c7c54-dd6b-4253-8f9f-133a5970fb11`  
**Candidature ID:** `8edf8253-6fd7-4e09-b0c7-68d03706d3bb`

Ce candidat affiche le message : *"Aucun document trouvé. Les documents peuvent ne pas être visibles en raison de permissions ou d'un problème de récupération."*

---

## 📋 Étape 1 : Exécuter le Diagnostic

J'ai créé un fichier `diagnostic_candidature_124c7c54.sql` contenant toutes les requêtes de diagnostic.

### Comment l'utiliser :

1. Ouvrez votre console **Supabase** → **SQL Editor**
2. Copiez et exécutez les requêtes du fichier `diagnostic_candidature_124c7c54.sql`
3. Notez les résultats de chaque requête

---

## 🎯 Requêtes Essentielles (Version Rapide)

Si vous voulez aller vite, exécutez uniquement ces 3 requêtes :

### 1️⃣ Vérifier si des documents existent

```sql
SELECT COUNT(*) as nombre_documents
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';
```

**Résultat attendu :**
- Si `nombre_documents = 0` → Les documents n'ont jamais été uploadés
- Si `nombre_documents > 0` → C'est un problème de permissions ou d'affichage

---

### 2️⃣ Lister les documents (si ils existent)

```sql
SELECT 
    id,
    document_type,
    file_name,
    file_url,
    file_size,
    uploaded_at
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
ORDER BY uploaded_at DESC;
```

---

### 3️⃣ Vérifier les politiques RLS

```sql
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'application_documents'
ORDER BY policyname;
```

---

## 🔧 Solutions Possibles

### Scénario A : Aucun document trouvé (COUNT = 0)

**Cause :** Le candidat n'a jamais uploadé de documents, ou l'upload a échoué.

**Solutions :**

1. **Vérifier les logs d'upload** :
   ```sql
   -- Vérifier si le candidat a d'autres candidatures avec des documents
   SELECT 
       a.id as candidature_id,
       jo.title as poste,
       COUNT(ad.id) as nombre_documents,
       a.created_at
   FROM applications a
   LEFT JOIN job_offers jo ON a.job_offer_id = jo.id
   LEFT JOIN application_documents ad ON a.id = ad.application_id
   WHERE a.candidate_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
   GROUP BY a.id, jo.title, a.created_at
   ORDER BY a.created_at DESC;
   ```

2. **Contacter le candidat** pour qu'il re-upload ses documents

3. **Ajouter manuellement des documents** (si vous les avez reçus par email) :
   ```sql
   -- Template pour insérer manuellement un document
   INSERT INTO application_documents (
       application_id,
       document_type,
       file_name,
       file_url,
       file_size
   ) VALUES (
       '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
       'cv',  -- ou 'cover_letter', 'diploma', etc.
       'nom_du_fichier.pdf',
       'chemin/dans/storage/nom_du_fichier.pdf',
       1234567  -- taille en bytes
   );
   ```

---

### Scénario B : Documents trouvés (COUNT > 0) mais pas visibles

**Cause :** Problème de permissions RLS (Row Level Security)

**Solution 1 : Vérifier les politiques RLS actuelles**

```sql
-- Voir toutes les politiques pour application_documents
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'application_documents';
```

**Solution 2 : Créer/Corriger la politique RLS pour les recruteurs**

```sql
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Recruiters can view all documents" ON application_documents;
DROP POLICY IF EXISTS "Observers can view all documents" ON application_documents;

-- Créer une politique permettant aux recruteurs de voir tous les documents
CREATE POLICY "Recruiters can view all documents"
ON application_documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('recruiter', 'observer')
    )
);

-- Créer une politique permettant aux candidats de voir leurs propres documents
CREATE POLICY "Candidates can view own documents"
ON application_documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_documents.application_id
        AND applications.candidate_id = auth.uid()
    )
);
```

**Solution 3 : Tester avec RLS désactivé temporairement**

⚠️ **ATTENTION : À utiliser uniquement pour le diagnostic, pas en production !**

```sql
-- Désactiver temporairement RLS pour tester
ALTER TABLE application_documents DISABLE ROW LEVEL SECURITY;

-- Puis réactiver après le test
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
```

---

### Scénario C : Problème de chemin de fichier (file_url)

**Cause :** Le `file_url` stocké ne correspond pas au chemin réel dans le storage

**Solution : Vérifier et corriger les chemins**

```sql
-- Lister tous les documents avec leurs chemins
SELECT 
    id,
    file_name,
    file_url,
    LENGTH(file_url) as longueur_url,
    CASE 
        WHEN file_url LIKE 'http%' THEN 'URL complète'
        WHEN file_url LIKE '%/%' THEN 'Chemin relatif'
        ELSE 'Format inconnu'
    END as type_url
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';
```

Si les URLs sont incorrectes, vous pouvez les corriger :

```sql
-- Corriger un chemin de fichier incorrect (exemple)
UPDATE application_documents
SET file_url = 'nouveau/chemin/correct.pdf'
WHERE id = 123;  -- Remplacer par l'ID réel du document
```

---

## 📊 Vérification Comparative

Pour vérifier si c'est un problème isolé ou généralisé :

```sql
-- Comparer avec d'autres candidatures de la même offre
SELECT 
    a.id as candidature_id,
    u.first_name || ' ' || u.last_name as candidat,
    COUNT(ad.id) as nombre_documents,
    STRING_AGG(ad.document_type, ', ') as types_documents
FROM applications a
LEFT JOIN users u ON a.candidate_id = u.id
LEFT JOIN application_documents ad ON a.id = ad.application_id
WHERE a.job_offer_id = (
    SELECT job_offer_id 
    FROM applications 
    WHERE id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
)
GROUP BY a.id, u.first_name, u.last_name
ORDER BY nombre_documents DESC
LIMIT 10;
```

---

## 🔍 Vérification du Storage Supabase

Si les documents sont dans la table mais pas accessibles :

1. Allez dans **Supabase** → **Storage** → **application-documents**
2. Cherchez les fichiers correspondant à cette candidature
3. Vérifiez les permissions du bucket :
   - Le bucket doit être **public** ou avoir des politiques appropriées
   - Les fichiers doivent exister physiquement

### Requête pour vérifier la configuration du bucket :

```sql
-- Vérifier si le bucket application-documents est public
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'application-documents';
```

---

## 📝 Checklist de Diagnostic

- [ ] Exécuter la requête 1 : Vérifier si des documents existent
- [ ] Si COUNT = 0 : Le candidat doit uploader ses documents
- [ ] Si COUNT > 0 : Vérifier les politiques RLS
- [ ] Vérifier que le bucket `application-documents` existe et est bien configuré
- [ ] Tester avec un autre utilisateur recruteur
- [ ] Vérifier les chemins `file_url` dans la base de données
- [ ] Comparer avec d'autres candidatures qui fonctionnent

---

## 🎬 Prochaines Étapes

1. **Exécutez les requêtes de diagnostic**
2. **Notez les résultats** (notamment le COUNT de documents)
3. **Partagez les résultats** avec moi pour que je puisse vous aider à identifier la solution exacte
4. **Appliquez la solution appropriée** selon le scénario identifié

---

## 📞 Besoin d'Aide Supplémentaire ?

Si après avoir exécuté ces requêtes vous ne trouvez toujours pas la cause, partagez :
- Le résultat de la requête `COUNT(*)`
- Le résultat de la requête listant les politiques RLS
- Les messages d'erreur éventuels dans la console navigateur (F12)

Je pourrai alors vous aider à créer une solution sur-mesure ! 🚀

