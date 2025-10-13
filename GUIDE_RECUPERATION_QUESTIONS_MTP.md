# 📋 GUIDE : Récupération des questions MTP codées en dur

## 🎯 Objectif
Récupérer les vraies questions MTP qui sont codées en dur dans le fichier `src/data/metierQuestions.ts` et les insérer dans la base de données pour les offres qui ont des questions vides.

---

## 🔍 **Étape 1 : Vérifier les questions vides**

### **Script :** `VERIFIER_QUESTIONS_VIDES.sql`
```sql
-- Exécuter ce script pour voir quelles offres ont des questions vides
```

**Ce script va :**
- ✅ Lister toutes les offres avec questions vides
- ✅ Compter le nombre d'offres concernées
- ✅ Afficher les titres exacts pour vérification

---

## 🔧 **Étape 2 : Récupérer les questions en dur**

### **Script :** `RECUPERER_QUESTIONS_MTP_EN_DUR.sql`
```sql
-- Exécuter ce script pour remplir les questions vides
```

**Ce script contient :**
- ✅ **16 offres** avec leurs vraies questions MTP
- ✅ **7 questions Métier** pour chaque offre
- ✅ **3 questions Talent** pour chaque offre  
- ✅ **3 questions Paradigme** pour chaque offre

---

## 📊 **Questions récupérées pour chaque poste :**

### **1. Directeur Audit & Contrôle interne**
- 7 questions Métier (audit, contrôle, gestion des risques)
- 3 questions Talent (gouvernance, transparence, confiance)
- 3 questions Paradigme (éthique, transparence, confiance publique)

### **2. Directeur Qualité, Hygiène, Sécurité & Environnement**
- 7 questions Métier (QHSE, normes, conformité)
- 3 questions Talent (culture QHSE, réduction incidents)
- 3 questions Paradigme (sécurité, environnement, culture)

### **3. Directeur Juridique, Communication & RSE**
- 7 questions Métier (juridique, communication, RSE)
- 3 questions Talent (confiance publique, gouvernance)
- 3 questions Paradigme (gouvernance responsable, éthique)

### **4. Directeur des Systèmes d'Information**
- 7 questions Métier (architecture d'entreprise, cybersécurité)
- 3 questions Talent (innovation digitale, data, cybersécurité)
- 3 questions Paradigme (valeur des données, innovation, IA)

### **5. Chef de Département Electricité**
- 7 questions Métier (concession électrique, réseaux)
- 3 questions Talent (fiabilité réseau, maintenance, renouvelables)
- 3 questions Paradigme (mission publique, maintenance, renouvelables)

### **6. Directeur Exploitation Electricité**
- 7 questions Métier (exploitation, continuité service)
- 3 questions Talent (continuité, délestages, équipes)
- 3 questions Paradigme (devoir, hiérarchie, exploitation responsable)

### **7. Directeur Technique Electricité**
- 7 questions Métier (projets techniques, installations)
- 3 questions Talent (modernisation, pertes, conformité)
- 3 questions Paradigme (normes, performance, modernisation)

### **8. Chef de Département Eau**
- 7 questions Métier (concession eau, réseaux adduction)
- 3 questions Talent (stress hydrique, maintenance, efficacité)
- 3 questions Paradigme (droit universel, gestion durable, service public)

### **9. Directeur Exploitation Eau**
- 7 questions Métier (exploitation eau, distribution)
- 3 questions Talent (optimisation, innovation, résilience)
- 3 questions Paradigme (satisfaction usagers, générations futures, stress hydrique)

### **10. Directeur Technique Eau**
- 7 questions Métier (projets techniques eau, installations)
- 3 questions Talent (modernisation, solutions décentralisées, qualité)
- 3 questions Paradigme (innovation, solutions rurales, santé publique)

### **11. Chef de Département Support**
- 7 questions Métier (processus support, efficacité)
- 3 questions Talent (efficacité, productivité, alignement)
- 3 questions Paradigme (rôle support, arbitrage, valeurs)

### **12. Directeur du Capital Humain**
- 7 questions Métier (GCH, transformation, équipes)
- 3 questions Talent (performance collective, talents, équilibre)
- 3 questions Paradigme (valeur humaine, équité, capital stratégique)

### **13. Directeur Commercial et Recouvrement**
- 7 questions Métier (expérience client, recouvrement)
- 3 questions Talent (taux recouvrement, tarification, digitalisation)
- 3 questions Paradigme (recouvrement vs justice, relation client, équité)

### **14. Directeur Finances et Comptabilité**
- 7 questions Métier (orthodoxie financière, conformité)
- 3 questions Talent (fiabilité comptes, trésorerie, alignement)
- 3 questions Paradigme (transparence, rigueur, modèle viable)

### **15. Directeur Moyens Généraux**
- 7 questions Métier (moyens généraux, logistique)
- 3 questions Talent (optimisation, réduction coûts, sécurité)
- 3 questions Paradigme (gestion rigoureuse, durabilité, continuité)

### **16. Coordonnateur des Régions**
- 7 questions Métier (coordination multisectorielle, régions)
- 3 questions Talent (cohérence, performance régions, parties prenantes)
- 3 questions Paradigme (proximité, équité territoriale, rôle local)

---

## 🚀 **Instructions d'exécution**

### **1. Vérification préalable**
```sql
-- Dans Supabase SQL Editor, exécuter :
-- Copier-coller le contenu de VERIFIER_QUESTIONS_VIDES.sql
```

### **2. Récupération des questions**
```sql
-- Dans Supabase SQL Editor, exécuter :
-- Copier-coller le contenu de RECUPERER_QUESTIONS_MTP_EN_DUR.sql
```

### **3. Vérification post-exécution**
```sql
-- Relancer VERIFIER_QUESTIONS_VIDES.sql pour confirmer
```

---

## 📊 **Résultat attendu**

### **Avant exécution :**
```
Questions Métier: NULL ou VIDE
Questions Talent: NULL ou VIDE  
Questions Paradigme: NULL ou VIDE
```

### **Après exécution :**
```
Questions Métier: 7 questions ✅
Questions Talent: 3 questions ✅
Questions Paradigme: 3 questions ✅
```

---

## 🎯 **Impact**

Cette récupération garantit que :
- ✅ **Toutes les offres** ont leurs vraies questions MTP
- ✅ **Questions spécialisées** par métier (pas génériques)
- ✅ **Cohérence** entre code et base de données
- ✅ **Expérience candidat** optimale avec questions pertinentes

---
**Date de création :** ${new Date().toLocaleDateString('fr-FR')}
**Statut :** ✅ Prêt à exécuter
**Fichiers :** VERIFIER_QUESTIONS_VIDES.sql + RECUPERER_QUESTIONS_MTP_EN_DUR.sql
