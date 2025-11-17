# Guide d'Utilisation des Diagrammes UML pour le Rapport de Stage

## 📁 Fichiers Générés

### 1. `diagrams/uml-diagrams.puml`
Fichier PlantUML contenant tous les diagrammes UML au format texte.

### 2. `documentation/ARCHITECTURE_TECHNOLOGIQUE.md`
Documentation technique complète détaillant l'architecture du projet.

### 3. `documentation/RAPPORT_STAGE_MODELE.md`
Extraits prêts à copier-coller pour votre rapport de stage.

---

## 🎨 Générer les Diagrammes PlantUML

### Option 1 : PlantUML Online (Recommandé)

1. Ouvrez votre navigateur
2. Allez sur : **http://www.plantuml.com/plantuml/uml/**
3. Ouvrez le fichier `diagrams/uml-diagrams.puml`
4. Copiez le contenu d'un diagramme (entre `@startuml` et `@enduml`)
5. Collez dans l'éditeur en ligne
6. Le diagramme s'affichera automatiquement
7. Cliquez sur "PNG" ou "SVG" pour télécharger

### Option 2 : Extension VS Code

1. Installez l'extension "PlantUML" dans VS Code
2. Ouvrez le fichier `diagrams/uml-diagrams.puml`
3. Appuyez sur `Alt+D` pour prévisualiser
4. Clic droit > "Export Current Diagram" pour sauvegarder

### Option 3 : Plugin IntelliJ IDEA / WebStorm

1. Installez le plugin "PlantUML integration"
2. Ouvrez le fichier `.puml`
3. Le diagramme se génère automatiquement
4. Exportez via le menu contextuel

### Option 4 : Installation Locale Java

```bash
# Installer Java si nécessaire
# Télécharger plantuml.jar depuis http://plantuml.com/download
java -jar plantuml.jar diagrams/uml-diagrams.puml
```

---

## 📊 Contenu des Diagrammes

Le fichier `uml-diagrams.puml` contient 6 diagrammes distincts :

### 1️⃣ Diagramme de Cas d'Utilisation
**Nom PlantUML :** `@startuml UseCase`

**Description :** Montre les acteurs et leurs interactions avec le système.

**Acteurs :**
- Candidat Interne
- Candidat Externe
- Recruteur SEEG
- Admin

**Utiliser pour :**
- Délimiter le périmètre du projet
- Identifier les fonctionnalités principales
- Expliquer les rôles des utilisateurs

### 2️⃣ Diagramme de Classes
**Nom PlantUML :** `@startuml ClassDiagram`

**Description :** Structure des données et relations entre entités.

**Classes principales :**
- User, CandidateProfile, JobOffer, Application
- Protocol1Evaluation, Protocol2Evaluation
- ApplicationDocument, ApplicationHistory
- AccessRequest, Notification

**Utiliser pour :**
- Expliquer la structure de la base de données
- Montrer les relations entre entités
- Documenter les attributs et méthodes

### 3️⃣ Diagramme de Séquence - Dépôt Candidature
**Nom PlantUML :** `@startuml SequenceDepotCandidature`

**Description :** Flux de dépôt d'une candidature de bout en bout.

**Acteurs :** Candidat, Interface Web, API, Base de données

**Utiliser pour :**
- Expliquer le processus de candidature
- Montrer les interactions système
- Documenter les validations automatiques

### 4️⃣ Diagramme de Séquence - Analyse Recruteur
**Nom PlantUML :** `@startuml SequenceAnalyseRecruteur`

**Description :** Processus d'évaluation d'un candidat par le recruteur.

**Acteurs :** Recruteur, Dashboard, API, Base de données

**Utiliser pour :**
- Expliquer les protocoles d'évaluation
- Montrer le workflow de décision
- Documenter les calculs automatiques

### 5️⃣ Diagramme d'Activité - Processus Global
**Nom PlantUML :** `@startuml ActivityProcessusCandidature`

**Description :** Vue d'ensemble du processus complet de candidature.

**Utiliser pour :**
- Synthétiser le parcours candidat
- Montrer les conditions et décisions
- Expliquer les branches du processus

### 6️⃣ Diagramme d'Architecture Globale (Logique)
**Nom PlantUML :** `@startuml ArchitectureGlobale`

**Description :** Vue d'ensemble de l'architecture technique Client-BaaS.

**Composants :**
- Frontend SPA (React, TypeScript, Vite)
- Backend as a Service (Supabase avec Auth, API, Storage, Real-time)
- Base de données PostgreSQL avec RLS

**Utiliser pour :**
- Expliquer l'architecture technique globale
- Montrer les flux de données entre les couches
- Illustrer le modèle Client-BaaS
- Justifier les choix technologiques

---

## 📝 Intégration dans le Rapport de Stage

### Étape 1 : Générer les Images PNG/SVG

Pour chaque diagramme, générez une image de haute qualité :
- Format recommandé : **SVG** (vectoriel, zoomable)
- Format alternatif : **PNG** (min 300 DPI pour impression)

### Étape 2 : Insérer dans le Document

**LaTeX (Overleaf) :**
```latex
\begin{figure}[H]
    \centering
    \includegraphics[width=0.9\textwidth]{UseCase.png}
    \caption{Diagramme de Cas d'Utilisation}
    \label{fig:usecase}
\end{figure}
```

**Word :**
- Insert > Image > Fichier
- Cliquez droit > "Insérer une légende"
- Référencez avec "Figure X"

**Markdown :**
```markdown
![Diagramme de Cas d'Utilisation](UseCase.png)
*Figure X : Diagramme de Cas d'Utilisation*
```

### Étape 3 : Ajouter les Explications

Copiez les explications depuis `RAPPORT_STAGE_MODELE.md` dans votre rapport.

---

## 🎯 Conseils pour la Présentation

### Organisation des Diagrammes

Placez les diagrammes dans l'ordre suivant dans votre rapport :

1. **Diagramme de Cas d'Utilisation** → Vue d'ensemble du système
2. **Diagramme de Classes** → Structure des données
3. **Diagramme d'Activité** → Processus global
4. **Diagrammes de Séquence** → Détails des processus critiques

### Légendes et Titres

Assurez-vous que chaque diagramme ait :
- Un titre clair et descriptif
- Une numérotation (Figure 1, Figure 2, etc.)
- Une légende si nécessaire
- Des explications détaillées dans le texte

### Qualité des Images

- Minimum 300 DPI pour impression
- Format vectoriel (SVG) si possible
- Contraste élevé pour lisibilité
- Taille adaptée à la page (ne pas dépasser les marges)

### Éviter le Remplissage

Ne copiez pas tous les diagrammes "pour faire bien". Choisissez ceux qui :
- Illustrent clairement votre propos
- Ajoutent une valeur explicative
- Correspondent aux sections du rapport

---

## 🔧 Personnalisation des Diagrammes

### Changer les Couleurs

Dans PlantUML, les couleurs sont définies avec `!define` :

```plantuml
!define CANDIDAT_COLOR #E8F5E9
!define RECRUTEUR_COLOR #E3F2FD
```

Modifiez les codes hexadécimaux selon vos préférences.

### Ajouter des Éléments

Vous pouvez enrichir les diagrammes en ajoutant :
- De nouvelles classes dans le diagramme de classes
- De nouveaux cas d'utilisation
- Plus de détails dans les séquences
- Des notes explicatives

### Simplifier

Si un diagramme est trop complexe pour votre rapport :
- Gardez uniquement les acteurs principaux
- Simplifiez les relations
- Regroupez les fonctionnalités similaires

---

## ⚠️ Points d'Attention

### Confidentialité

Les diagrammes montrent la structure réelle du système. Si votre rapport est public :
- Vérifiez que vous avez l'autorisation
- Masquez les noms de tables si sensibles
- Généralisez certains aspects métier

### Cohérence

- Assurez-vous que les noms correspondent au code
- Vérifiez que les relations sont exactes
- Incluez les diagrammes dans le contexte approprié

### Exactitude

Les diagrammes doivent refléter fidèlement :
- La structure réelle de la base de données
- Les flux de données tels qu'implémentés
- Les règles métier en vigueur

---

## 📚 Ressources Complémentaires

### Documentation PlantUML

- Site officiel : http://plantuml.com/
- Guide de référence : http://plantuml.com/guide
- Exemples : http://plantuml.com/starting

### Alternatives à PlantUML

Si vous préférez d'autres outils :

**Online :**
- Draw.io (https://app.diagrams.net/) - Interface graphique
- Creately (https://creately.com/) - Modèles UML
- Lucidchart (https://www.lucidchart.com/) - Collaboration

**Desktop :**
- StarUML (https://staruml.io/) - Gratuit, multiplateforme
- Umbrello (https://umbrello.kde.org/) - KDE
- Visual Paradigm - Complet, version gratuite limitée

---

## ✅ Checklist de Validation

Avant d'insérer les diagrammes dans votre rapport, vérifiez :

- [ ] Tous les diagrammes sont générés en haute résolution
- [ ] Les couleurs sont lisibles (impression noir & blanc aussi)
- [ ] Les légendes sont présentes et claires
- [ ] Les explications textuelles accompagnent chaque figure
- [ ] Les références croisées sont correctes ("voir Figure X")
- [ ] Les diagrammes sont numérotés dans l'ordre
- [ ] La cohérence avec le reste du rapport est assurée
- [ ] Le format est correct pour votre éditeur (PNG/SVG/EPS)
- [ ] Les tailles sont adaptées aux marges
- [ ] Les éléments sont mis à jour selon le code actuel

---

## 🆘 Dépannage

### Le diagramme ne s'affiche pas

**Problème :** Erreur de syntaxe PlantUML
**Solution :** Vérifiez la syntaxe sur http://www.plantuml.com/plantuml/

### Qualité d'image insuffisante

**Problème :** Rasterisation pixelisée
**Solution :** Exportez en SVG ou augmentez le DPI

### Diagramme trop large

**Problème :** Déborde la page
**Solution :** Ajustez `skinparam` dans PlantUML ou exportez en format paysage

### PlantUML ne trouve pas les fichiers

**Problème :** Chemins relatifs incorrects
**Solution :** Utilisez les chemins absolus ou travaillez depuis le bon répertoire

---

## 💡 Questions Fréquentes

**Q : Puis-je modifier les diagrammes ?**
R : Absolument ! Ce sont des fichiers texte modifiables. PlanUML permet beaucoup de personnalisations.

**Q : Dois-je inclure TOUS les diagrammes ?**
R : Non. Choisissez ceux qui illustrent le mieux votre travail. 2-3 diagrammes bien expliqués valent mieux que 5 mal intégrés.

**Q : Les diagrammes sont-ils trop techniques pour mon rapport ?**
R : Possiblement. N'hésitez pas à simplifier ou à ajouter des légendes détaillées pour les rendre accessibles.

**Q : Puis-je créer mes propres diagrammes ?**
R : Bien sûr ! Ces diagrammes servent de base. Vous pouvez les adapter selon vos besoins.

**Q : Quelle est la meilleure taille pour les images ?**
R : Pour un rapport standard A4 :
- Largeur : 12-14 cm maximum
- Format portrait ou paysage selon le diagramme
- Résolution : 300 DPI minimum

---

## 📧 Support

Si vous rencontrez des difficultés :
1. Consultez la documentation PlantUML officielle
2. Vérifiez les exemples fournis
3. Adaptez les diagrammes à vos besoins
4. Simplifiez si nécessaire

---

**Bonne chance pour votre rapport de stage ! 🎓**

