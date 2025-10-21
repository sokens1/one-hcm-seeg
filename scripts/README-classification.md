# Script de Classification des Offres Externes par Direction

## Description

Ce script analyse automatiquement toutes les offres d'emploi marquées comme "externes" et les classe selon la structure organisationnelle de la SEEG.

## Structure Organisationnelle

Le script classe les offres selon 14 directions principales :

1. **Coordination Régions** - Délégations régionales
2. **Département Support** - Services de support
3. **Direction Commerciale & Recouvrement** - Activités commerciales
4. **Direction de l'Audit & Contrôle Interne** - Audit et contrôle
5. **Direction des Moyens Généraux** - Logistique et moyens
6. **Direction des Systèmes d'Information** - Technologies de l'information
7. **Direction du Capital Humain** - Ressources humaines
8. **Direction Exploitation Eau** - Exploitation eau
9. **Direction Exploitation Électricité** - Exploitation électricité
10. **Direction Finances & Comptabilité** - Finances
11. **Direction Juridique, Communication & RSE** - Juridique et communication
12. **Direction Qualité Hygiène Sécurité et Environnement** - QHSE
13. **Direction Technique Eau** - Technique eau
14. **Direction Technique Électricité** - Technique électricité

## Utilisation

### Mode Simulation (Recommandé)

```bash
# Afficher le rapport sans modifier la base de données
node scripts/classify-external-offers-by-direction.js
```

### Mode Mise à Jour

```bash
# Forcer la mise à jour de la base de données
node scripts/classify-external-offers-by-direction.js --force
```

### Via le script shell (Linux/Mac)

```bash
# Mode simulation
./scripts/run-classification.sh

# Mode mise à jour
./scripts/run-classification.sh --force
```

## Fonctionnalités

### 🔍 Classification Intelligente

Le script utilise des mots-clés spécifiques pour chaque direction :

- **Coordination Régions** : "délégation", "coordination", "région", "ntoum", "nord", etc.
- **Direction DSI** : "systèmes d'information", "cybersécurité", "infrastructure", etc.
- **Direction Exploitation Eau** : "exploitation", "production", "distribution", "eau", etc.

### 📊 Rapport Détaillé

Le script génère un rapport complet incluant :

- Nombre total d'offres analysées
- Taux de classification
- Répartition par direction
- Liste des offres non classifiées

### 🛡️ Sécurité

- Mode simulation par défaut
- Confirmation requise pour les modifications
- Logs détaillés de toutes les opérations

## Exemple de Sortie

```
🚀 DÉMARRAGE DU SCRIPT DE CLASSIFICATION
==================================================
📊 Récupération des offres externes...
✅ 45 offres externes trouvées

🔍 Classification des offres...

📋 RAPPORT DE CLASSIFICATION
==================================================
📊 Total des offres: 45
✅ Classifiées: 42
❓ Non classifiées: 3
📈 Taux de classification: 93.3%

📁 Répartition par direction:
  • Direction Exploitation Électricité: 8 offre(s)
  • Direction Technique Eau: 6 offre(s)
  • Direction Commerciale & Recouvrement: 5 offre(s)
  • Direction du Capital Humain: 4 offre(s)
  ...
```

## Prérequis

- Node.js installé
- Variables d'environnement Supabase configurées
- Accès en lecture/écriture à la base de données

## Maintenance

### Ajout de Nouvelles Directions

Pour ajouter une nouvelle direction, modifier le fichier `scripts/classify-external-offers-by-direction.js` :

```javascript
const DIRECTIONS = {
  // ... directions existantes
  'nouvelle-direction': {
    name: 'Nouvelle Direction',
    keywords: ['mot-clé1', 'mot-clé2', 'mot-clé3']
  }
};
```

### Ajustement des Mots-clés

Les mots-clés peuvent être ajustés pour améliorer la précision de la classification.

## Support

En cas de problème :

1. Vérifier les variables d'environnement Supabase
2. S'assurer que la base de données est accessible
3. Consulter les logs d'erreur détaillés
