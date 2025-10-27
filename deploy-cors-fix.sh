#!/bin/bash

# Script de déploiement pour résoudre le problème CORS
# Ce script déploie le proxy API sur Vercel

echo "🚀 Déploiement du proxy API pour résoudre le problème CORS..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

# Vérifier que le fichier proxy existe
if [ ! -f "api/rh-eval-proxy.ts" ]; then
    echo "❌ Erreur: api/rh-eval-proxy.ts non trouvé."
    exit 1
fi

echo "✅ Fichiers de proxy trouvés"

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Configuration du déploiement..."

# Déployer sur Vercel
echo "🚀 Déploiement en cours..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi!"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Attendez quelques minutes que le déploiement soit actif"
    echo "2. Testez l'évaluation automatique dans l'application"
    echo "3. Vérifiez les logs pour confirmer le bon fonctionnement"
    echo ""
    echo "🔍 Pour tester manuellement:"
    echo "curl -X POST https://www.seeg-talentsource.com/api/rh-eval-proxy/evaluate \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -H 'x-api-key: YOUR_API_KEY' \\"
    echo "  -d '{\"id\":\"test\",\"nom\":\"Test\",\"prenom\":\"Candidat\",\"post\":\"Test\",\"cv\":\"CV test\"}'"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi
