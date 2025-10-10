# 🧪 Test Rapide - 5 minutes

## ✅ Checklist rapide

### 1. Créer une offre (2 min)

```
☐ Aller sur /recruiter/create-job
☐ Remplir : Titre, Contrat, Catégorie, Lieu, Statut (Interne/Externe)
☐ Descendre jusqu'à "Questions MTP"
☐ Ajouter 1 question Métier, 1 Talent, 1 Paradigme
☐ Cliquer "Publier l'offre"
☐ Vérifier : Pas d'erreur, redirection vers /recruiter
```

**✅ Si ça marche = Backend OK !**

### 2. Modifier une offre (1 min)

```
☐ Cliquer "Modifier" sur l'offre créée
☐ Vérifier : Les 3 questions sont bien affichées
☐ Modifier une question
☐ Cliquer "Sauvegarder"
☐ Recharger la page
☐ Vérifier : La modification est bien sauvegardée
```

**✅ Si ça marche = Édition OK !**

### 3. Tester le formulaire candidat (2 min)

```
☐ Aller sur la page de l'offre (côté candidat)
☐ Cliquer "Postuler"
☐ Remplir rapidement l'étape 1 et 2
☐ Aller à l'étape 3 (Questions MTP)
☐ Vérifier : Les 3 questions personnalisées s'affichent
```

**✅ Si ça marche = Frontend candidat OK !**

---

## 🔍 Vérification en base de données (30 sec)

Dans l'éditeur SQL de Supabase :

```sql
SELECT 
    title,
    status_offerts,
    mtp_questions_metier[1] as premiere_question_metier
FROM job_offers
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu :**
- `title` : Le titre de votre offre
- `status_offerts` : "interne" ou "externe"
- `premiere_question_metier` : Votre première question

---

## 🎉 Tout fonctionne ?

✅ **OUI** → Parfait ! Le système est opérationnel.

❌ **NON** → Ouvrez la console (F12) et envoyez-moi l'erreur.

---

## 🚀 Prochaines étapes recommandées

1. **Remplir les questions MTP** pour toutes les offres existantes
2. **Former les recruteurs** à utiliser le nouvel éditeur
3. **Documenter** les bonnes pratiques de rédaction de questions

---

**Temps total : 5 minutes ⏱️**

