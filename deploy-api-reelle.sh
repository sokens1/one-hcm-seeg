#!/bin/bash

echo "🚀 Déploiement de la configuration API réelle..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "src/integrations/azure-container-apps-api.ts" ]; then
    echo "❌ Erreur : Fichier azure-container-apps-api.ts non trouvé"
    echo "Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi

echo "📋 Configuration actuelle :"
echo "  • Fallback automatique : ❌ DÉSACTIVÉ"
echo "  • Utilisation API réelle : ✅ ACTIVÉ"
echo "  • URL de production : https://rh-rval-api.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io"

echo ""
echo "⚠️  ATTENTION : Cette configuration va :"
echo "  • Désactiver le fallback automatique"
echo "  • Forcer l'utilisation de l'API réelle"
echo "  • Afficher les erreurs CORS si elles se produisent"

read -p "Voulez-vous continuer ? (y/N) : " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

echo ""
echo "🔧 Construction du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Construction réussie"
    echo ""
    echo "🎯 Prochaines étapes :"
    echo "1. Déployez le projet sur votre plateforme (Vercel, Netlify, etc.)"
    echo "2. Testez l'évaluation automatique en production"
    echo "3. Si erreur CORS, vous devrez :"
    echo "   • Configurer CORS sur l'API Azure Container Apps"
    echo "   • Ou utiliser un proxy serveur"
    echo "   • Ou réactiver le fallback automatique"
    echo ""
    echo "📝 Pour réactiver le fallback automatique si nécessaire :"
    echo "   • Remettez le code de fallback dans azure-container-apps-api.ts"
    echo "   • Ou utilisez le fichier de sauvegarde"
    echo ""
    echo "✅ Configuration prête pour le déploiement !"
else
    echo "❌ Erreur lors de la construction"
    exit 1
fi
