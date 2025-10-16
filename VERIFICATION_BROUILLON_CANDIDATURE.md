# Vérification du Brouillon de Candidature

## 🎯 Objectif
Vérifier si le candidat avait sauvegardé un brouillon avec des documents avant de soumettre sa candidature.

---

## 📋 Information du Cas
- **Candidat ID** : `124c7c54-dd6b-4253-8f9f-133a5970fb11`
- **Candidature ID** : `8edf8253-6fd7-4e09-b0c7-68d03706d3bb`
- **Problème** : Aucun document trouvé (COUNT = 0)

---

## 🔍 Requêtes de Vérification

### 1️⃣ Vérifier si un brouillon existe

```sql
SELECT 
    'Brouillon trouvé' as statut,
    user_id,
    job_offer_id,
    updated_at
FROM application_drafts
WHERE user_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
ORDER BY updated_at DESC;
```

**Note** : La table `application_drafts` n'a pas de colonne `id`. La clé primaire est composite : `(user_id, job_offer_id)`.

**Résultats possibles :**
- ✅ **Une ou plusieurs lignes** → Le candidat a sauvegardé un brouillon
- ❌ **Aucune ligne** → Le candidat n'a jamais sauvegardé de brouillon

---

### 2️⃣ Voir le contenu complet du brouillon (JSON)

```sql
SELECT 
    user_id,
    job_offer_id,
    form_data,
    ui_state,
    updated_at as derniere_sauvegarde
FROM application_drafts
WHERE user_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
ORDER BY updated_at DESC
LIMIT 1;
```

Cette requête retourne le JSON complet du brouillon. Vous pourrez voir :
- Tous les champs du formulaire remplis
- L'état de l'interface (étape actuelle, etc.)
- Les informations sur les fichiers uploadés

---

### 3️⃣ Extraire uniquement les informations sur les documents

```sql
SELECT 
    user_id,
    job_offer_id,
    (form_data->>'cv') as cv_info,
    (form_data->>'coverLetter') as lettre_motivation_info,
    (form_data->>'certificates') as diplomes_info,
    (form_data->>'additionalCertificates') as certificats_info,
    updated_at as derniere_sauvegarde
FROM application_drafts
WHERE user_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11'
ORDER BY updated_at DESC;
```

**Interprétation des résultats :**

| Colonne | Valeur | Signification |
|---------|--------|---------------|
| `cv_info` | `NULL` | ❌ Aucun CV uploadé dans le brouillon |
| `cv_info` | `{"name":"CV.pdf","path":"...","size":123456}` | ✅ CV uploadé mais pas soumis |
| `lettre_motivation_info` | `NULL` | ❌ Aucune lettre uploadée |
| `lettre_motivation_info` | `{"name":"Lettre.pdf",...}` | ✅ Lettre uploadée mais pas soumise |

---

### 4️⃣ Comparer avec d'autres candidats de la même offre

```sql
SELECT 
    ad.user_id,
    ad.job_offer_id,
    u.first_name || ' ' || u.last_name as candidat,
    u.email,
    ad.updated_at as derniere_modification,
    CASE 
        WHEN (ad.form_data->>'cv') IS NOT NULL THEN '✅ Oui'
        ELSE '❌ Non'
    END as a_cv_dans_brouillon,
    CASE 
        WHEN (ad.form_data->>'coverLetter') IS NOT NULL THEN '✅ Oui'
        ELSE '❌ Non'
    END as a_lettre_dans_brouillon,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM applications 
            WHERE candidate_id = ad.user_id 
            AND job_offer_id = ad.job_offer_id
        ) THEN '✅ Soumise'
        ELSE '❌ Non soumise'
    END as candidature_soumise
FROM application_drafts ad
LEFT JOIN users u ON ad.user_id = u.id
WHERE ad.job_offer_id = (
    SELECT job_offer_id 
    FROM applications 
    WHERE id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
)
ORDER BY ad.updated_at DESC
LIMIT 10;
```

Cette requête vous montrera :
- Tous les candidats qui ont sauvegardé un brouillon pour cette offre
- Qui a uploadé des documents dans leur brouillon
- Qui a finalement soumis leur candidature

---

## 🎬 Scénarios et Solutions

### 📌 Scénario A : Brouillon existe AVEC documents

```
cv_info: {"name":"CV_Candidat.pdf","path":"uploads/abc123/CV_Candidat.pdf","size":1234567}
lettre_motivation_info: {"name":"Lettre.pdf","path":"uploads/abc123/Lettre.pdf","size":987654}
```

**Ce qui s'est passé :**
- ✅ Le candidat a uploadé les documents
- ✅ Les fichiers sont probablement dans le Storage Supabase
- ❌ Le candidat n'a PAS finalisé/soumis sa candidature
- ❌ Les documents n'ont donc pas été transférés vers `application_documents`

**Solutions :**

#### Solution 1 : Récupérer les documents du Storage et les associer

```sql
-- D'abord, vérifiez l'ID de l'offre dans le brouillon
SELECT 
    job_offer_id,
    form_data->>'cv' as cv_path
FROM application_drafts
WHERE user_id = '124c7c54-dd6b-4253-8f9f-133a5970fb11';
```

Si les chemins des fichiers sont valides, vous pouvez :

1. **Aller dans Supabase Storage** → `application-documents`
2. **Chercher les fichiers** avec les chemins indiqués dans le brouillon
3. **Les déplacer** dans le bon dossier : `8edf8253-6fd7-4e09-b0c7-68d03706d3bb/`
4. **Insérer les enregistrements** dans `application_documents`

```sql
-- Exemple d'insertion manuelle
INSERT INTO application_documents (
    application_id,
    document_type,
    file_name,
    file_url,
    file_size
) VALUES 
(
    '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
    'cv',
    'CV_Candidat.pdf',
    '8edf8253-6fd7-4e09-b0c7-68d03706d3bb/CV_Candidat.pdf',
    1234567
),
(
    '8edf8253-6fd7-4e09-b0c7-68d03706d3bb',
    'cover_letter',
    'Lettre.pdf',
    '8edf8253-6fd7-4e09-b0c7-68d03706d3bb/Lettre.pdf',
    987654
);
```

#### Solution 2 : Demander au candidat de finaliser sa candidature

Contactez le candidat :
> "Nous constatons que vous avez commencé votre candidature mais ne l'avez pas finalisée. Pourriez-vous retourner sur votre espace candidat et cliquer sur 'Soumettre' pour valider votre dossier ?"

---

### 📌 Scénario B : Brouillon existe SANS documents

```
cv_info: NULL
lettre_motivation_info: NULL
diplomes_info: NULL
```

**Ce qui s'est passé :**
- ✅ Le candidat a commencé à remplir le formulaire
- ❌ Le candidat n'a JAMAIS uploadé de documents
- ❌ Le candidat a quand même soumis sa candidature (sans documents)

**Solution :**

Contactez le candidat pour lui demander d'uploader ses documents :

```sql
-- Récupérer ses coordonnées
SELECT 
    email,
    phone,
    first_name,
    last_name
FROM users
WHERE id = '124c7c54-dd6b-4253-8f9f-133a5970fb11';
```

---

### 📌 Scénario C : Aucun brouillon trouvé

**Ce qui s'est passé :**
- Le candidat a rempli et soumis le formulaire en une seule fois
- Le candidat n'a pas uploadé de documents (ou l'upload a échoué)
- Aucune sauvegarde automatique n'a eu lieu

**Solution :**

C'est le scénario le plus probable. Le candidat a simplement soumis sa candidature **sans uploader de documents**.

**Actions recommandées :**
1. Contacter le candidat
2. Lui expliquer que son dossier est incomplet
3. Lui demander d'envoyer ses documents par email ou de modifier sa candidature

---

## 🔧 Vérifications Complémentaires

### Vérifier si la table application_drafts existe

```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'application_drafts'
) as table_existe;
```

### Voir la structure de la table application_drafts

```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'application_drafts'
ORDER BY ordinal_position;
```

### Compter tous les brouillons dans le système

```sql
SELECT 
    COUNT(*) as total_brouillons,
    COUNT(DISTINCT user_id) as nombre_utilisateurs,
    COUNT(DISTINCT job_offer_id) as nombre_offres
FROM application_drafts;
```

---

## 📊 Statistiques Utiles

### Candidats avec brouillons vs candidatures soumises

```sql
SELECT 
    'Avec brouillon' as type,
    COUNT(DISTINCT ad.user_id) as nombre_candidats
FROM application_drafts ad
UNION ALL
SELECT 
    'Candidatures soumises' as type,
    COUNT(DISTINCT a.candidate_id) as nombre_candidats
FROM applications a;
```

### Taux de conversion brouillon → candidature

```sql
WITH brouillons AS (
    SELECT DISTINCT user_id, job_offer_id
    FROM application_drafts
),
candidatures AS (
    SELECT DISTINCT candidate_id as user_id, job_offer_id
    FROM applications
)
SELECT 
    COUNT(b.user_id) as brouillons_crees,
    COUNT(c.user_id) as candidatures_soumises,
    ROUND(COUNT(c.user_id)::numeric / NULLIF(COUNT(b.user_id), 0) * 100, 2) as taux_conversion_pourcent
FROM brouillons b
LEFT JOIN candidatures c ON b.user_id = c.user_id AND b.job_offer_id = c.job_offer_id;
```

---

## 🎯 Checklist de Diagnostic

- [ ] Exécuter requête 1 : Vérifier si un brouillon existe
- [ ] Si brouillon existe : Exécuter requête 3 pour voir les documents
- [ ] Vérifier dans Supabase Storage si les fichiers existent
- [ ] Comparer les chemins du brouillon avec le Storage
- [ ] Décider de la solution à appliquer (récupération ou contact candidat)
- [ ] Documenter les actions entreprises

---

## 📞 Résumé des Actions Possibles

1. **Si documents dans brouillon + fichiers dans Storage** → Récupérer et associer manuellement
2. **Si documents dans brouillon mais pas dans Storage** → Contacter le candidat
3. **Si brouillon sans documents** → Contacter le candidat
4. **Si aucun brouillon** → Contacter le candidat

Dans tous les cas où vous contactez le candidat, utilisez cette requête pour obtenir ses coordonnées :

```sql
SELECT 
    email,
    phone,
    first_name || ' ' || last_name as nom_complet,
    (SELECT title FROM job_offers WHERE id = (
        SELECT job_offer_id FROM applications 
        WHERE id = '8edf8253-6fd7-4e09-b0c7-68d03706d3bb'
    )) as poste_candidature
FROM users
WHERE id = '124c7c54-dd6b-4253-8f9f-133a5970fb11';
```

---

## ✅ Prochaines Étapes

1. **Exécutez la requête 1** pour voir si un brouillon existe
2. **Partagez le résultat** avec moi
3. Je vous guiderai vers la solution appropriée selon le scénario

Bonne chance ! 🚀

