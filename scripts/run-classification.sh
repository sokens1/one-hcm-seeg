#!/bin/bash

# Script d'exécution de la classification des offres externes
# Usage: ./scripts/run-classification.sh [--force]

echo "🚀 Script de classification des offres externes par direction"
echo "============================================================"

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env manquant"
    echo "Assurez-vous que les variables d'environnement Supabase sont configurées"
    exit 1
fi

# Exécuter le script de classification
echo "📊 Lancement de la classification..."
node scripts/classify-external-offers-by-direction.js "$@"

echo ""
echo "✅ Script terminé"
echo ""
echo "💡 Pour forcer la mise à jour de la base de données, utilisez:"
echo "   ./scripts/run-classification.sh --force"
