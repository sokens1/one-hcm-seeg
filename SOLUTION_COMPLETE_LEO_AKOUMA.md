# Solution Complète : Récupération des Documents de Leo Akouma

## 🎯 Résumé du Problème

**Candidat** : Leo Akouma (JURISTE D'ENTREPRISE)  
**Candidat ID** : `124c7c54-dd6b-4253-8f9f-133a5970fb11`  
**Candidature ID** : `8edf8253-6fd7-4e09-b0c7-68d03706d3bb`

### Ce qui s'est passé :

1. ✅ Le candidat a commencé à remplir sa candidature
2. ✅ Il a uploadé 3 documents (CV, lettre de motivation, diplômes)
3. ✅ Le système a sauvegardé automatiquement le brouillon
4. ❌ Le candidat n'a PAS finalisé sa candidature avec les documents
5. ❌ Il a soumis sa candidature sans les documents
6. ❌ Les documents sont restés dans le brouillon, jamais transférés vers `application_documents`

---

## 📄 Documents Trouvés dans le Brouillon

| Type | Nom du fichier | Taille | Chemin dans Storage |
|------|----------------|--------|---------------------|
| CV | `Dernier CV_JURISTE D'ENTREPRISE_MBUETH AKOUMA LEO _251014_225125.pdf` | 237 KB | `124c7c54-dd6b-4253-8f9f-133a5970fb11/cv/1760482344508-u1yf6c5k0n.pdf` |
| Lettre | `Lettre de motivation SEEG  Leo Akouma finale_251014_225021.pdf` | 153 KB | `124c7c54-dd6b-4253-8f9f-133a5970fb11/cover-letters/1760482333630-4tjb06uxvge.pdf` |
| Diplômes | `diplômes et certificats de travail.pdf` | 2.9 MB | `124c7c54-dd6b-4253-8f9f-133a5970fb11/certificates/1760482394018-chhjrk2nhl.pdf` |

**Date de sauvegarde** : 16 octobre 2025 à 06:50 (UTC)

---

## 🔧 Solution Étape par Étape

### Étape 1 : Vérifier que les fichiers existent dans le Storage

1. Connectez-vous à **Supabase Dashboard**
2. Allez dans **Storage** → **application-documents**
3. Cherchez le dossier : `124c7c54-dd6b-4253-8f9f-133a5970fb11/`
4. Vérifiez que les 3 fichiers existent dans les sous-dossiers :
   - `cv/1760482344508-u1yf6c5k0n.pdf`
   - `cover-letters/1760482333630-4tjb06uxvge.pdf`
   - `certificates/1760482394018-chhjrk2nhl.pdf`

**✅ Si les fichiers existent** → Passez à l'Étape 2  
**❌ Si les fichiers n'existent pas** → Contactez le candidat pour qu'il les renvoie

---

### Étape 2 : Insérer les documents dans la base de données

Ouvrez **Supabase SQL Editor** et exécutez cette requête :

```sql
INSERT INTO application_documents (
    application_id,
    document_type,
    file_name,
    file_url,
    file_size
)
VALUES
    -- CV
    (
        '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
        'cv',
        'Dernier CV_JURISTE D''ENTREPRISE_MBUETH AKOUMA LEO _251014_225125.pdf',
        '124c7c54-dd6b-4253-8f9f-133a5970fb11/cv/1760482344508-u1yf6c5k0n.pdf',
        237875
    ),
    -- Lettre de motivation
    (
        '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
        'cover_letter',
        'Lettre de motivation SEEG  Leo Akouma finale_251014_225021.pdf',
        '124c7c54-dd6b-4253-8f9f-133a5970fb11/cover-letters/1760482333630-4tjb06uxvge.pdf',
        153531
    ),
    -- Diplômes et certificats
    (
        '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
        'diploma',
        'diplômes et certificats de travail.pdf',
        '124c7c54-dd6b-4253-8f9f-133a5970fb11/certificates/1760482394018-chhjrk2nhl.pdf',
        2953619
    );
```

**Résultat attendu** : `INSERT 0 3` (3 lignes insérées)

---

### Étape 3 : Vérifier que les documents sont bien ajoutés

```sql
SELECT 
    id,
    document_type,
    file_name,
    file_size,
    uploaded_at
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
ORDER BY uploaded_at DESC;
```

**Résultat attendu** : 3 lignes avec les documents

---

### Étape 4 : Tester dans l'interface recruteur

1. Allez dans votre application web
2. Ouvrez la candidature de **Leo Akouma**
3. Vérifiez que les 3 documents sont maintenant visibles
4. Essayez de prévisualiser et télécharger les documents

---

### Étape 5 (Optionnel) : Nettoyer le brouillon

Une fois que tout fonctionne, vous pouvez supprimer le brouillon :

```sql
DELETE FROM application_drafts
WHERE user_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
  AND job_offer_id = '40cf4a6b-ba59-4ba8-bc5c-b3a31960a525';
```

⚠️ **Attention** : Ne supprimez le brouillon qu'après avoir vérifié que les documents sont bien visibles dans l'interface !

---

## 🔍 Vérifications Supplémentaires

### Vérifier les URLs publiques

```sql
SELECT 
    document_type,
    file_name,
    file_url,
    CONCAT(
        'https://[VOTRE_PROJET].supabase.co/storage/v1/object/public/application-documents/',
        file_url
    ) as url_complete
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';
```

Remplacez `[VOTRE_PROJET]` par l'URL de votre projet Supabase.

### Compter les documents

```sql
SELECT 
    COUNT(*) as total_documents,
    COUNT(CASE WHEN document_type = 'cv' THEN 1 END) as cv,
    COUNT(CASE WHEN document_type = 'cover_letter' THEN 1 END) as lettre,
    COUNT(CASE WHEN document_type = 'diploma' THEN 1 END) as diplomes,
    COUNT(CASE WHEN document_type = 'certificate' THEN 1 END) as certificats
FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';
```

**Résultat attendu** :
- total_documents: 3
- cv: 1
- lettre: 1
- diplomes: 1
- certificats: 0

---

## 🎯 Checklist de Vérification

- [ ] Les fichiers existent dans le Storage Supabase
- [ ] Les 3 INSERT ont réussi (INSERT 0 3)
- [ ] La requête SELECT retourne 3 lignes
- [ ] Les documents sont visibles dans l'interface recruteur
- [ ] La prévisualisation des documents fonctionne
- [ ] Le téléchargement des documents fonctionne
- [ ] Le brouillon a été nettoyé (optionnel)

---

## 🚨 Troubleshooting

### Problème : Les fichiers n'existent pas dans le Storage

**Solution** : Contactez Leo Akouma pour qu'il renvoie ses documents par email.

**Email suggéré** :
```
Objet : Documents manquants - Candidature JURISTE D'ENTREPRISE

Bonjour M. Akouma,

Nous avons bien reçu votre candidature pour le poste de Juriste d'Entreprise.

Cependant, nous constatons que vos documents (CV, lettre de motivation, diplômes) 
n'ont pas été correctement associés à votre candidature dans notre système.

Pourriez-vous nous les transmettre à nouveau par email ou via votre espace candidat ?

Cordialement,
L'équipe RH
```

---

### Problème : Erreur lors de l'INSERT

**Erreur possible** : `duplicate key value violates unique constraint`

**Cause** : Les documents existent déjà dans la table.

**Solution** : Vérifiez d'abord avec le SELECT. Si des documents existent déjà, supprimez-les d'abord :

```sql
-- Supprimer les anciens documents (si nécessaire)
DELETE FROM application_documents
WHERE application_id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb';

-- Puis réexécutez l'INSERT
```

---

### Problème : Les documents ne s'affichent pas dans l'interface

**Causes possibles** :
1. Le bucket `application-documents` n'est pas public
2. Les politiques RLS bloquent l'accès
3. Les chemins `file_url` sont incorrects

**Solutions** :

**1. Vérifier la configuration du bucket :**
```sql
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'application-documents';
```

Le champ `public` doit être `true`.

**2. Vérifier les politiques RLS :**

Exécutez le script `fix_application_documents_rls.sql` que j'ai créé précédemment.

**3. Vérifier les URLs :**

Testez une URL manuellement dans votre navigateur :
```
https://[VOTRE_PROJET].supabase.co/storage/v1/object/public/application-documents/124c7c54-dd6b-4253-8f9f-133a5970fb11/cv/1760482344508-u1yf6c5k0n.pdf
```

Si le PDF s'ouvre, les fichiers sont accessibles.

---

## 📊 Statistiques de la Candidature

Après avoir appliqué la solution, vous pouvez obtenir un résumé complet :

```sql
SELECT 
    a.id as candidature_id,
    u.first_name || ' ' || u.last_name as candidat,
    u.email,
    jo.title as poste,
    a.status as statut_candidature,
    a.created_at as date_candidature,
    COUNT(ad.application_id) as nombre_documents,
    STRING_AGG(ad.document_type, ', ') as types_documents
FROM applications a
LEFT JOIN users u ON a.candidate_id = u.id
LEFT JOIN job_offers jo ON a.job_offer_id = jo.id
LEFT JOIN application_documents ad ON a.id = ad.application_id
WHERE a.id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
GROUP BY a.id, u.first_name, u.last_name, u.email, jo.title, a.status, a.created_at;
```

---

## 🎬 Actions Recommandées

1. **Court terme** (maintenant) :
   - ✅ Exécuter l'INSERT pour récupérer les documents du brouillon
   - ✅ Vérifier que tout fonctionne dans l'interface

2. **Moyen terme** (cette semaine) :
   - 📧 Informer Leo Akouma que son dossier est maintenant complet
   - 🔍 Procéder à l'évaluation de sa candidature

3. **Long terme** (amélioration du système) :
   - 🔧 Améliorer le processus de soumission pour éviter ce problème
   - 🔧 Ajouter une validation côté client pour s'assurer que les documents sont bien attachés
   - 🔧 Ajouter un message d'avertissement si le candidat soumet sans documents

---

## ✅ Résultat Final Attendu

Après avoir appliqué cette solution :

- ✅ Leo Akouma aura **3 documents** associés à sa candidature
- ✅ Les documents seront **visibles et téléchargeables** dans l'interface recruteur
- ✅ Vous pourrez **évaluer sa candidature** normalement
- ✅ Le problème sera **résolu définitivement** pour ce candidat

---

## 📞 Support

Si vous rencontrez des difficultés lors de l'application de cette solution, partagez-moi :
- Le message d'erreur exact
- Le résultat de la vérification du Storage
- Des captures d'écran si nécessaire

Je pourrai vous aider à résoudre le problème ! 🚀

---

**Date de création de cette solution** : 16 octobre 2025  
**Candidat concerné** : Leo Akouma - JURISTE D'ENTREPRISE  
**Gravité** : ⚠️ Moyenne (documents récupérables depuis le brouillon)

