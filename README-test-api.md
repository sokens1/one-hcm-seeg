# Scripts de Test pour l'API de Candidats

Ce dossier contient des scripts de test pour envoyer des données vers votre API de candidats.

## Structure des Données

Les scripts envoient des données au format suivant :

```json
{
  "id": 1,
  "Nom": "Doe",
  "Prénom": "Jane",
  "cv": "Expériences solides en Data Science, MLOps (CI/CD), NLP, optimisation de modèles. Azure, Databricks, Python, SQL.",
  "lettre_motivation": "Très motivée par les projets data à impact au Gabon, et l industrialisation ML.",
  "MTP": {
    "M": "Modèles supervisés et évaluation",
    "T": "Azure, Databricks, Terraform, Python, SQL",
    "P": "Leadership et communication"
  },
  "post": "Data Scientist Senior"
}
```

## Scripts Disponibles

### 1. `test-api-send.js` (JavaScript Vanilla)
Script simple en JavaScript qui utilise l'API Fetch native.

**Utilisation :**
```bash
# Modifiez l'URL dans le script
node test-api-send.js
```

### 2. `test-api-send-advanced.js` (Node.js avec Axios)
Script avancé avec gestion d'erreurs améliorée et tests multiples.

**Installation :**
```bash
npm install axios
```

**Utilisation :**
```bash
# Modifiez l'URL dans le script
node test-api-send-advanced.js
```

### 3. `test_api_send.py` (Python)
Script en Python utilisant la bibliothèque `requests`.

**Installation :**
```bash
pip install requests
```

**Utilisation :**
```bash
# Modifiez l'URL dans le script
python test_api_send.py
```

## Configuration

### 1. Modifier l'URL de l'API

Dans chaque script, remplacez :
- `https://votre-api-url.com/endpoint` par votre URL réelle
- `https://votre-api-url.com` par votre URL de base

### 2. Ajouter des Headers d'Authentification

Si votre API nécessite une authentification, ajoutez les headers appropriés :

```javascript
// JavaScript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer your-token',
  'X-API-Key': 'your-api-key'
}
```

```python
# Python
API_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token",
    "X-API-Key": "your-api-key"
}
```

## Données de Test

Les scripts incluent 3 candidats de test avec des profils différents :

1. **Jane Doe** - Data Scientist Senior
2. **John Smith** - Ingénieur Machine Learning  
3. **Sophie Martin** - Chef de Projet Data

## Tests Effectués

### Tests de Connectivité
- Vérification de l'accessibilité de l'API
- Test de l'endpoint de santé (si disponible)

### Tests de Données Valides
- Envoi de candidats avec des profils complets
- Vérification des réponses de l'API
- Gestion des erreurs HTTP

### Tests de Données Invalides
- Candidats sans ID
- Candidats avec format MTP invalide
- Test de la robustesse de l'API

## Résultats Attendus

### Succès
```
✅ Succès!
📊 Statut: 200
📋 Réponse: {"message": "Candidat créé avec succès", "id": 1}
```

### Erreur
```
❌ Erreur!
📊 Statut d'erreur: 400
📋 Erreur: {"error": "Données invalides", "details": "ID manquant"}
```

## Personnalisation

### Ajouter de Nouveaux Candidats

Modifiez le tableau `test_candidates` ou `testCandidates` dans les scripts :

```javascript
const testCandidates = [
  // ... candidats existants
  {
    "id": 4,
    "Nom": "Nouveau",
    "Prénom": "Candidat",
    "cv": "Description du CV...",
    "lettre_motivation": "Lettre de motivation...",
    "MTP": {
      "M": "Métier",
      "T": "Technologies",
      "P": "Paradigme"
    },
    "post": "Nouveau Poste"
  }
];
```

### Modifier les Tests

Vous pouvez ajouter de nouveaux tests en modifiant les fonctions de test dans les scripts.

## Dépannage

### Erreur de Connectivité
- Vérifiez l'URL de l'API
- Vérifiez votre connexion internet
- Vérifiez que l'API est accessible

### Erreur d'Authentification
- Vérifiez vos tokens/clés API
- Vérifiez les headers d'authentification

### Erreur de Format
- Vérifiez que l'API accepte le format JSON
- Vérifiez la structure des données attendue par l'API

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de l'API
2. Testez avec un outil comme Postman ou curl
3. Vérifiez la documentation de votre API
