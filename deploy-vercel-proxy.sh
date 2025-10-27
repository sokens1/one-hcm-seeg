#!/bin/bash

echo "🚀 Déploiement de la solution CORS avec proxy Vercel..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "src/integrations/azure-container-apps-api.ts" ]; then
    echo "❌ Erreur : Fichier azure-container-apps-api.ts non trouvé"
    echo "Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi

echo "📋 Configuration actuelle :"
echo "  • Proxy Vercel : ✅ ACTIVÉ"
echo "  • URL de production : /api/rh-eval-proxy"
echo "  • Fallback automatique : ❌ DÉSACTIVÉ"
echo "  • Données réelles : ✅ ACTIVÉES"

echo ""
echo "🔧 Construction du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Construction réussie"
    echo ""
    echo "🌐 Déploiement sur Vercel..."
    
    # Vérifier si Vercel CLI est installé
    if ! command -v vercel &> /dev/null
    then
        echo "⚠️ Vercel CLI n'est pas installé."
        echo "Installez-le avec : npm install -g vercel"
        echo "Puis connectez-vous avec : vercel login"
        echo "Puis déployez avec : vercel deploy --prod"
        exit 1
    fi
    
    # Déployer sur Vercel
    vercel deploy --prod --confirm
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Déploiement réussi !"
        echo ""
        echo "✅ Votre application est maintenant configurée pour :"
        echo "  • Utiliser le proxy Vercel pour contourner CORS"
        echo "  • Obtenir des données réelles de l'API Azure Container Apps"
        echo "  • Fonctionner sans fallback automatique"
        echo ""
        echo "🧪 Testez maintenant l'évaluation automatique en production !"
    else
        echo "❌ Erreur lors du déploiement Vercel"
        echo "Vérifiez les logs ci-dessus pour plus de détails"
        exit 1
    fi
else
    echo "❌ Erreur lors de la construction"
    exit 1
fi

echo ""
echo "🏁 Déploiement terminé !"
