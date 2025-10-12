# ✅ Modal de Confirmation pour la Réinitialisation

## 🔧 Modifications apportées

### **1. Changement du libellé du bouton**

#### **Avant :**
```
Commencer à zéro
```

#### **Après :**
```
Réinitialiser tous les champs et documents
```

- Bouton en **rouge** pour indiquer une action destructive
- Texte plus explicite sur ce qui sera supprimé

---

### **2. Ajout d'un modal de confirmation**

#### **Apparence du modal :**
- 🔴 Icône d'alerte rouge (`AlertCircle`)
- Titre : **"Confirmer la réinitialisation"**
- Message d'avertissement : **"⚠️ Cette action est irréversible"**

#### **Contenu du modal :**

**Message principal :**
> Si vous confirmez, toutes les informations suivantes seront **définitivement supprimées** :

**Liste des éléments supprimés :**
- ✓ Tous les champs renseignés (adresse, expérience, etc.)
- ✓ Tous les documents joints (CV, lettres, certificats, etc.)
- ✓ Toutes les réponses aux questions MTP
- ✓ Les informations de référence

**Avertissement final (en rouge) :**
> Vous devrez tout renseigner à nouveau depuis le début.

#### **Boutons du modal :**
1. **"Annuler"** (gris) → Ferme le modal sans rien faire
2. **"Confirmer la réinitialisation"** (rouge) → Supprime tout et réinitialise

---

## 🎨 Design du modal

### **Structure visuelle :**

```
┌─────────────────────────────────────────────┐
│  🔴  Confirmer la réinitialisation          │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Cette action est irréversible          │
│                                             │
│  Si vous confirmez, toutes les informations │
│  suivantes seront définitivement supprimées:│
│                                             │
│  • Tous les champs renseignés              │
│  • Tous les documents joints               │
│  • Toutes les réponses aux questions MTP   │
│  • Les informations de référence           │
│                                             │
│  🔴 Vous devrez tout renseigner à nouveau  │
│     depuis le début.                        │
│                                             │
├─────────────────────────────────────────────┤
│                [Annuler]  [Confirmer] 🔴    │
└─────────────────────────────────────────────┘
```

---

## 🔄 Flux utilisateur

### **Scénario complet :**

1. **Utilisateur arrive sur le formulaire**
   - Notification de brouillon s'affiche
   - 2 options : "Restaurer le brouillon" ou "Réinitialiser tous les champs et documents"

2. **Utilisateur clique sur "Réinitialiser tous les champs et documents"**
   - ❌ Pas d'action immédiate
   - ✅ Le modal de confirmation s'ouvre

3. **Dans le modal, l'utilisateur a 2 choix :**

   **Option A : Clic sur "Annuler"**
   - Modal se ferme
   - Retour à la notification de brouillon
   - Aucune donnée n'est supprimée

   **Option B : Clic sur "Confirmer la réinitialisation"**
   - Modal se ferme
   - Brouillon supprimé de la base de données
   - localStorage nettoyé
   - Formulaire réinitialisé
   - Retour à l'étape 1
   - Message de confirmation : "Formulaire réinitialisé"

---

## 🧪 Tests à effectuer

### **Test 1 : Ouverture du modal**
1. Accédez au formulaire avec un brouillon existant
2. Cliquez sur "Réinitialiser tous les champs et documents"
3. ✅ **Vérifier :** Le modal s'ouvre avec le message d'avertissement

### **Test 2 : Annulation**
1. Dans le modal, cliquez sur "Annuler"
2. ✅ **Vérifier :**
   - Le modal se ferme
   - La notification de brouillon est toujours là
   - Aucune donnée n'est perdue
3. Cliquez sur "Restaurer le brouillon"
4. ✅ **Vérifier :** Les données sont bien restaurées

### **Test 3 : Confirmation de la réinitialisation**
1. Ouvrez à nouveau le modal
2. Cliquez sur "Confirmer la réinitialisation"
3. ✅ **Vérifier :**
   - Message "Formulaire réinitialisé" affiché
   - Tous les champs sont vides (sauf nom, prénom, email)
   - Retour à l'étape 1
   - Onglet MTP sur "Métier"
4. Fermez et rouvrez le formulaire
5. ✅ **Vérifier :** Aucune notification de brouillon

### **Test 4 : Fermeture du modal (clic en dehors)**
1. Ouvrez le modal
2. Cliquez en dehors du modal (sur l'overlay)
3. ✅ **Vérifier :** Le modal se ferme sans supprimer les données

### **Test 5 : Fermeture du modal (touche Échap)**
1. Ouvrez le modal
2. Appuyez sur la touche `Échap`
3. ✅ **Vérifier :** Le modal se ferme sans supprimer les données

---

## 📋 Éléments de sécurité

### **Protection contre la suppression accidentelle :**
1. ✅ **Bouton rouge** : Indique visuellement une action destructive
2. ✅ **Texte explicite** : "Réinitialiser tous les champs et documents"
3. ✅ **Modal de confirmation** : Double vérification avant suppression
4. ✅ **Message d'avertissement** : Explique clairement ce qui sera perdu
5. ✅ **Liste détaillée** : Énumère tous les éléments qui seront supprimés
6. ✅ **Avertissement final en rouge** : Rappelle qu'il faudra tout refaire
7. ✅ **Bouton "Annuler" par défaut** : Plus facile d'annuler que de confirmer

---

## 🎨 Couleurs et style

### **Notification de brouillon :**
- Fond : Bleu clair (`bg-blue-50`)
- Bordure : Bleu (`border-blue-200`)
- Texte : Bleu foncé (`text-blue-900`, `text-blue-700`)

### **Bouton "Réinitialiser" :**
- Texte : Rouge (`text-red-600`)
- Bordure : Rouge (`border-red-300`)
- Hover : Fond rouge clair (`hover:bg-red-50`)

### **Modal :**
- Icône : Rouge sur fond rouge clair
- Titre : Noir standard
- Message d'avertissement : Rouge (`text-red-600`)
- Bouton "Confirmer" : Rouge (`bg-red-600 hover:bg-red-700`)

---

## 📄 Fichier modifié

- `src/components/ui/DraftSaveIndicator.tsx`
  - Ligne 1-15 : Ajout des imports (`useState`, `AlertCircle`, composants `AlertDialog`)
  - Ligne 58-144 : Modification de `DraftRestoreNotification` avec modal

---

## ✅ Résumé

**Avant :**
- ❌ Bouton "Commencer à zéro" supprimait directement tout
- ❌ Pas de confirmation
- ❌ Risque de suppression accidentelle

**Maintenant :**
- ✅ Bouton explicite : "Réinitialiser tous les champs et documents"
- ✅ Modal de confirmation avec avertissement détaillé
- ✅ Protection contre la suppression accidentelle
- ✅ Meilleure expérience utilisateur
- ✅ Respect des bonnes pratiques UX pour les actions destructives

---

## 🎯 Avantages

1. **Clarté** : L'utilisateur sait exactement ce qui va être supprimé
2. **Sécurité** : Double vérification avant toute action destructive
3. **Transparence** : Liste complète des éléments qui seront perdus
4. **Réversibilité** : Possibilité d'annuler à tout moment
5. **Conformité UX** : Suit les standards pour les actions à haut risque

