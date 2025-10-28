# 🎥 Intégration du Mode Distanciel pour les Entretiens et Simulations

**Date :** 31 janvier 2025  
**Fonctionnalité :** Ajout de la possibilité de programmer des entretiens et simulations en présentiel ou distanciel avec lien de visioconférence

---

## 📋 Résumé des Modifications

Cette fonctionnalité permet maintenant de **choisir le mode d'entretien** (présentiel ou distanciel) lors de la programmation, et de **renseigner un lien de visioconférence** si le mode distanciel est sélectionné. Le lien est automatiquement inclus dans l'email envoyé au candidat.

---

## ✅ Fichiers Modifiés

### 1️⃣ **Migration SQL** 
📁 `supabase/migrations/20250131000070_add_interview_mode_and_video_link.sql`

**Colonnes ajoutées à la table `interview_slots` :**
- `interview_mode` : `TEXT` (valeurs : 'presentiel' ou 'distanciel')
- `video_link` : `TEXT` (lien de visioconférence)

```sql
ALTER TABLE interview_slots 
ADD COLUMN IF NOT EXISTS interview_mode TEXT DEFAULT 'presentiel' 
CHECK (interview_mode IN ('presentiel', 'distanciel'));

ALTER TABLE interview_slots 
ADD COLUMN IF NOT EXISTS video_link TEXT;
```

---

### 2️⃣ **API d'Envoi d'Emails**
📁 `api/send-interview-email.ts`

**Nouveaux paramètres acceptés :**
- `interviewMode` : 'presentiel' | 'distanciel' (défaut: 'presentiel')
- `videoLink` : string (lien de visio si distanciel)

**Adaptations dans l'email :**
- **Lieu** : Affiche "En ligne (visioconférence)" si distanciel
- **Bloc lien vidéo** : Affiché uniquement en mode distanciel avec un design spécial
- **Instructions** : Adaptées selon le mode (connexion 5 min avant pour distanciel, présentation 15 min avant pour présentiel)

**Exemple de bloc lien vidéo dans l'email :**
```html
<div style="margin:15px 0; padding:15px; background-color:#e3f2fd; border-left:4px solid #2196f3;">
  <p>🎥 Lien de visioconférence :</p>
  <a href="https://teams.microsoft.com/...">Cliquez ici pour rejoindre</a>
</div>
```

---

### 3️⃣ **Hook de Programmation**
📁 `src/hooks/useInterviewScheduling.ts`

**Fonction `scheduleInterview` modifiée :**
```typescript
scheduleInterview(
  date: string, 
  time: string, 
  options?: { 
    sendEmail?: boolean, 
    interviewMode?: 'presentiel' | 'distanciel',
    videoLink?: string 
  }
)
```

**Sauvegarde en base :**
- Les colonnes `interview_mode` et `video_link` sont enregistrées dans `interview_slots`
- L'email inclut automatiquement ces informations

---

### 4️⃣ **Interface Protocole 1 (Entretiens)**
📁 `src/components/evaluation/EvaluationDashboard.tsx`

**Nouveaux états ajoutés :**
```typescript
const [interviewMode, setInterviewMode] = useState<'presentiel' | 'distanciel'>('presentiel');
const [videoLink, setVideoLink] = useState<string>('');
```

**Interface utilisateur dans le popover de programmation :**
1. **Sélecteur de mode** : Dropdown avec icônes 🏢 Présentiel / 💻 Distanciel
2. **Champ lien vidéo** : Apparaît automatiquement si mode distanciel sélectionné
3. **Validation** : Le bouton "Confirmer" est désactivé si distanciel sans lien

**Screenshot de l'UI :**
```
┌─────────────────────────────────────┐
│ Créneau sélectionné: Lundi 3 fév... │
│                                      │
│ Mode d'entretien                     │
│ ┌──────────────────────────────┐   │
│ │ 🏢 Présentiel           ▼    │   │
│ └──────────────────────────────┘   │
│                                      │
│ [Si distanciel sélectionné]          │
│ Lien de visioconférence              │
│ ┌──────────────────────────────┐   │
│ │ https://teams.microsoft...   │   │
│ └──────────────────────────────┘   │
│                                      │
│ [Confirmer] [Annuler]                │
└─────────────────────────────────────┘
```

---

### 5️⃣ **Interface Protocole 2 (Simulations)**
📁 `src/components/evaluation/Protocol2Dashboard.tsx`

**Modifications identiques au Protocole 1 :**
- Sélecteur de mode (présentiel/distanciel)
- Champ lien vidéo conditionnel
- Envoi d'email avec `interviewType: 'simulation'`

**Fonction `handleScheduleSimulation` mise à jour :**
- Envoie maintenant un email via `/api/send-interview-email`
- Passe les paramètres `simulationMode` et `simulationVideoLink`

---

## 🔄 Flux Complet de Programmation

### Pour un Entretien (Protocole 1) :

```mermaid
1. Recruteur clique "Programmer l'entretien"
2. Sélectionne date + créneau horaire
3. Choisit le mode (présentiel/distanciel)
4. [Si distanciel] Renseigne le lien de visio
5. Clique "Confirmer et envoyer"
   ↓
   → Sauvegarde dans interview_slots (mode + lien)
   → Update applications.interview_date
   → Envoi email avec lien vidéo si distanciel
   → Toast de confirmation
```

### Pour une Simulation (Protocole 2) :

```mermaid
1. Recruteur clique "Programmer la simulation"
2. Sélectionne date + créneau horaire
3. Choisit le mode (présentiel/distanciel)
4. [Si distanciel] Renseigne le lien de visio
5. Clique "Programmer"
   ↓
   → Sauvegarde dans protocol2_evaluations
   → Update applications.simulation_date
   → Envoi email de simulation avec lien vidéo si distanciel
   → Toast de confirmation
```

---

## 📧 Exemples d'Emails

### Email Entretien Présentiel :
```
Madame Sophie MARTIN,

Nous vous invitons à un entretien de recrutement qui se tiendra le :

Date : Lundi 3 février 2025
Heure : 14:00
Lieu : Salle de réunion du Président du Conseil d'Administration 
       au 9ᵉ étage du siège de la SEEG sis à Libreville.

Nous vous prions de bien vouloir vous présenter 15 minutes avant 
l'heure de l'entretien, munie de votre carte professionnelle...
```

### Email Entretien Distanciel :
```
Monsieur Jean OKEMBA,

Nous vous invitons à un entretien de recrutement qui se tiendra en ligne le :

Date : Mardi 4 février 2025
Heure : 10:00
Mode : En ligne (visioconférence)

┌────────────────────────────────────────┐
│ 🎥 Lien de visioconférence :           │
│ https://teams.microsoft.com/l/mee... │
│ Cliquez sur le lien ci-dessus pour    │
│ rejoindre la réunion en ligne.         │
└────────────────────────────────────────┘

Nous vous prions de bien vouloir vous connecter 5 minutes avant 
l'heure de l'entretien via le lien de visioconférence fourni...
```

---

## 🧪 Tests à Effectuer

### ✅ Test 1 : Entretien Présentiel
1. Programmer un entretien en mode présentiel
2. Vérifier que l'email reçu mentionne le lieu physique
3. Vérifier qu'il n'y a pas de bloc lien vidéo

### ✅ Test 2 : Entretien Distanciel
1. Programmer un entretien en mode distanciel
2. Renseigner un lien Teams/Zoom
3. Vérifier que l'email contient le bloc lien vidéo bleu
4. Vérifier que le lien est cliquable

### ✅ Test 3 : Simulation Présentiel
1. Programmer une simulation en mode présentiel
2. Vérifier l'email avec "Salle de simulation au 9ᵉ étage"

### ✅ Test 4 : Simulation Distanciel
1. Programmer une simulation en mode distanciel
2. Renseigner un lien de visio
3. Vérifier l'email avec le lien vidéo

### ✅ Test 5 : Validation
1. Essayer de confirmer en distanciel sans lien
2. Le bouton doit être désactivé

---

## 🔐 Variables d'Environnement

**Aucune nouvelle variable requise**. Les variables SMTP existantes sont utilisées :

```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=support@seeg-talentsource.com
VITE_SMTP_PASSWORD=***
```

---

## 🚀 Déploiement

### Étapes pour la mise en production :

1. **Appliquer la migration SQL** :
```bash
# Via Supabase CLI
supabase db push

# Ou via l'interface Supabase SQL Editor
# Copier le contenu de 20250131000070_add_interview_mode_and_video_link.sql
```

2. **Déployer le frontend** :
```bash
npm run build
# Déployer sur l'hébergement
```

3. **Redémarrer les fonctions serverless** (si nécessaire)

---

## 📝 Notes Importantes

- ✅ **Rétrocompatibilité** : Les anciens entretiens sans mode défini seront considérés comme "présentiel" (valeur par défaut)
- ✅ **Validation** : Le lien vidéo est obligatoire uniquement si mode distanciel
- ✅ **Format du lien** : Accepte n'importe quel format d'URL (Teams, Zoom, Google Meet, etc.)
- ✅ **Emails** : Le contenu s'adapte automatiquement selon le mode choisi
- ✅ **Interface** : Le champ lien vidéo apparaît/disparaît dynamiquement

---

## 👤 Auteur

Développé par l'équipe technique SEEG Talent Source  
Date : 31 janvier 2025

---

**Fonctionnalité prête pour les tests ! 🎉**

