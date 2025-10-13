# 🔍 Guide de Test - Références de Recommandation dans le PDF

## ✅ Modifications apportées

### 1. **Nettoyage des labels et valeurs des références**
- Les labels (Nom et Prénom, Entreprise, Email, Contact) sont maintenant nettoyés
- Les valeurs des références sont nettoyées avant affichage

### 2. **Logs de debug ajoutés**
- Dans `exportPdfUtils.ts` : affiche les données brutes et nettoyées des références
- Dans `generateApplicationPdf.ts` : affiche les données reçues pour génération du PDF

---

## 🧪 Comment tester

### **Étape 1 : Préparer une candidature test**
1. Connectez-vous avec un **compte candidat externe**
2. Postulez à une **offre externe**
3. **Remplissez les champs de référence** :
   - Nom et Prénom : `Jean Dupont`
   - Entreprise : `Entreprise Test`
   - Email : `jean.dupont@test.com`
   - Contact : `+241 00 00 00 00`

### **Étape 2 : Exporter le PDF**
1. Accédez à votre candidature
2. Cliquez sur **"Télécharger le PDF"**
3. **Ouvrez la console du navigateur** (F12)

### **Étape 3 : Vérifier les logs**
Vous devriez voir dans la console :
```
🔍 [PDF Export] Références: {
  raw_full_name: "Jean Dupont",
  raw_email: "jean.dupont@test.com",
  raw_contact: "+241 00 00 00 00",
  raw_company: "Entreprise Test",
  cleaned_full_name: "Jean Dupont",
  cleaned_email: "jean.dupont@test.com",
  cleaned_contact: "+241 00 00 00 00",
  cleaned_company: "Entreprise Test"
}

🔍 [generateApplicationPdf] Données de références reçues: {
  referenceFullName: "Jean Dupont",
  referenceEmail: "jean.dupont@test.com",
  referenceContact: "+241 00 00 00 00",
  referenceCompany: "Entreprise Test",
  offerStatus: "externe",
  isExternalOffer: true
}
```

### **Étape 4 : Vérifier le PDF généré**
1. Ouvrez le fichier PDF téléchargé
2. Cherchez la section **"3. Références de Recommandation"**
3. **Vérifiez que les champs sont remplis** :
   - ✅ Nom et Prénom : `Jean Dupont` (vert - Renseigné)
   - ✅ Entreprise : `Entreprise Test` (vert - Renseigné)
   - ✅ Email : `jean.dupont@test.com` (vert - Renseigné)
   - ✅ Contact : `+241 00 00 00 00` (vert - Renseigné)

---

## ❌ Cas d'erreur possible

### **Problème : Les références sont `null` ou vides dans la console**
**Cause** : Les champs n'ont pas été sauvegardés en base de données

**Solution** :
1. Vérifiez que les colonnes existent dans la table `applications` :
   - `reference_full_name`
   - `reference_email`
   - `reference_contact`
   - `reference_company`
2. Exécutez le script SQL : `CORRECTION_FINALE_REFERENCES_NOT_NULL.sql`

### **Problème : Les références affichent "Non renseigné" même si remplies**
**Cause** : Les données sont corrompues ou contiennent des caractères spéciaux

**Solution** :
- Les données sont maintenant nettoyées automatiquement
- Si le problème persiste, vérifiez les logs dans la console

### **Problème : Les références affichent "Non applicable" pour une offre externe**
**Cause** : Le `offerStatus` n'est pas correctement passé

**Solution** :
- Vérifiez que `application.job_offers?.status_offerts` est bien `'externe'`
- Vérifiez les logs de la console pour voir le `offerStatus`

---

## 📋 Checklist de validation

- [ ] Les logs dans la console affichent les données des références
- [ ] Le PDF contient la section "3. Références de Recommandation"
- [ ] Les champs renseignés affichent les valeurs correctes
- [ ] Les statuts sont correctement colorés (vert pour "Renseigné")
- [ ] Pour une **offre interne**, les références affichent "Non applicable" (gris)
- [ ] Pour une **offre externe**, les références vides affichent "Non renseigné" (rouge)

---

## 🎯 Résultat attendu

**Pour une offre externe avec références remplies :**
```
3. Références de Recommandation

Nom et Prénom:          Jean Dupont                    ✓ Renseigné
Entreprise:             Entreprise Test                ✓ Renseigné
Email:                  jean.dupont@test.com           ✓ Renseigné
Contact:                +241 00 00 00 00               ✓ Renseigné
```

**Pour une offre interne :**
```
3. Références de Recommandation

Nom et Prénom:          Non applicable                 Non applicable
Entreprise:             Non applicable                 Non applicable
Email:                  Non applicable                 Non applicable
Contact:                Non applicable                 Non applicable
```

