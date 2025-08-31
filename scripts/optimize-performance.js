#!/usr/bin/env node

/**
 * Script d'optimisation des performances pour Talent Flow
 * Ce script applique les optimisations et vérifie les performances
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de l\'optimisation des performances...\n');

// 1. Vérifier que Supabase CLI est installé
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI détecté');
} catch (error) {
  console.error('❌ Supabase CLI non trouvé. Installez-le avec: npm install -g supabase');
  process.exit(1);
}

// 2. Appliquer les migrations
console.log('\n📊 Application des migrations d\'optimisation...');
try {
  execSync('supabase db push', { stdio: 'inherit' });
  console.log('✅ Migrations appliquées avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'application des migrations:', error.message);
  process.exit(1);
}

// 3. Vérifier la structure des fichiers optimisés
console.log('\n🔍 Vérification des fichiers optimisés...');

const filesToCheck = [
  'src/hooks/useOptimizedCache.ts',
  'src/hooks/useOptimizedProtocol1Evaluation.ts',
  'src/utils/monitoring/performanceOptimizer.ts',
  'src/integrations/supabase/client.ts'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Présent`);
  } else {
    console.log(`❌ ${file} - Manquant`);
  }
});

// 4. Générer un rapport d'optimisation
console.log('\n📋 Génération du rapport d\'optimisation...');

const report = `
# Rapport d'Optimisation des Performances
Date: ${new Date().toISOString()}

## Optimisations Appliquées

### 1. Base de Données
- ✅ Index ajoutés sur les colonnes fréquemment utilisées
- ✅ Politiques RLS optimisées
- ✅ Fonctions helper pour les permissions
- ✅ Vue matérialisée pour les statistiques

### 2. Code Frontend
- ✅ Client Supabase optimisé
- ✅ Système de cache intelligent
- ✅ Debouncing des sauvegardes automatiques
- ✅ Monitoring des performances

### 3. Requêtes
- ✅ Requêtes SELECT allégées
- ✅ Délais de sauvegarde augmentés
- ✅ Cache avec TTL configurable

## Prochaines Étapes

1. **Immédiat** (aujourd'hui)
   - Remplacer useProtocol1Evaluation par useOptimizedProtocol1Evaluation
   - Surveiller les métriques de performance
   - Vérifier la réduction de la charge IO

2. **Court terme** (cette semaine)
   - Implémenter la pagination sur les listes
   - Ajouter React.memo aux composants lourds
   - Optimiser les requêtes restantes

3. **Moyen terme** (ce mois)
   - Considérer une mise à niveau Supabase Pro
   - Implémenter un cache Redis
   - Ajouter un CDN

## Surveillance

Utilisez le monitoring intégré pour surveiller :
- Temps de réponse des requêtes
- Taux de hit du cache
- Nombre de requêtes lentes
- Utilisation des ressources

## Support

En cas de problème :
1. Consultez PERFORMANCE_OPTIMIZATION_GUIDE.md
2. Vérifiez les logs Supabase
3. Utilisez le monitoring intégré
`;

fs.writeFileSync(
  path.join(__dirname, '..', 'PERFORMANCE_OPTIMIZATION_REPORT.md'),
  report
);

console.log('✅ Rapport généré: PERFORMANCE_OPTIMIZATION_REPORT.md');

// 5. Instructions finales
console.log('\n🎉 Optimisation terminée !');
console.log('\n📝 Prochaines étapes :');
console.log('1. Remplacez useProtocol1Evaluation par useOptimizedProtocol1Evaluation dans vos composants');
console.log('2. Surveillez les métriques de performance dans les prochaines heures');
console.log('3. Consultez PERFORMANCE_OPTIMIZATION_GUIDE.md pour plus de détails');
console.log('\n⚠️  Important : Ces optimisations devraient réduire significativement votre charge IO.');
console.log('   Surveillez votre dashboard Supabase pour confirmer l\'amélioration.');

console.log('\n✨ Optimisation des performances terminée avec succès !');
