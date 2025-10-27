#!/bin/bash

echo "🚀 Déploiement du proxy Vercel pour contourner CORS..."

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI n'est pas installé."
    echo "Installez-le avec : npm install -g vercel"
    exit 1
fi

echo "📋 Fichiers à déployer :"
echo "  ✅ api/rh-eval-proxy.ts - Proxy pour contourner CORS"
echo "  ✅ vercel.json - Configuration des rewrites"
echo "  ✅ src/integrations/azure-container-apps-api.ts - Configuration proxy"

echo ""
echo "🔧 Construction du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Construction réussie"
    echo ""
    echo "🌐 Déploiement sur Vercel..."
    
    # Déployer sur Vercel
    vercel deploy --prod --confirm
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Déploiement réussi !"
        echo ""
        echo "✅ Votre proxy Vercel est maintenant actif :"
        echo "  • URL : https://www.seeg-talentsource.com/api/rh-eval-proxy"
        echo "  • Fonction : Contourne les restrictions CORS"
        echo "  • Résultat : Données réelles de l'API Azure Container Apps"
        echo ""
        echo "🧪 Testez maintenant l'évaluation automatique !"
        echo "   L'erreur 405 devrait disparaître et vous devriez obtenir des données réelles."
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
