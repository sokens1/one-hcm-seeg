#!/bin/bash

echo "💾 Sauvegarde de la configuration actuelle..."

# Créer un dossier de sauvegarde
mkdir -p backups

# Sauvegarder le fichier actuel
cp src/integrations/azure-container-apps-api.ts backups/azure-container-apps-api-sans-fallback-$(date +%Y%m%d-%H%M%S).ts

echo "✅ Sauvegarde créée dans le dossier 'backups/'"
echo ""
echo "📋 Fichiers de sauvegarde disponibles :"
ls -la backups/azure-container-apps-api-*.ts 2>/dev/null || echo "Aucun fichier de sauvegarde trouvé"

echo ""
echo "🔄 Pour restaurer une configuration précédente :"
echo "cp backups/azure-container-apps-api-[DATE].ts src/integrations/azure-container-apps-api.ts"
echo ""
echo "💡 Ou pour revenir au fallback automatique :"
echo "git checkout src/integrations/azure-container-apps-api.ts"
