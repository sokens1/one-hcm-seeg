#!/usr/bin/env node

/**
 * Script de classification des offres externes par direction
 * 
 * Ce script analyse toutes les offres d'emploi marquées comme "externes"
 * et les classe automatiquement selon la structure organisationnelle de la SEEG.
 * 
 * Usage: node scripts/classify-external-offers-by-direction.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Structure organisationnelle complète
const DIRECTIONS = {
  'coordination-regions': {
    name: 'Coordination Régions',
    keywords: ['délégation', 'coordination', 'région', 'ntoum', 'nord', 'littoral', 'centre sud', 'est']
  },
  'departement-support': {
    name: 'Département Support',
    keywords: ['support', 'département support']
  },
  'direction-commerciale': {
    name: 'Direction Commerciale & Recouvrement',
    keywords: ['commercial', 'recouvrement', 'facturation', 'clientèle', 'relations clients', 'prépaiement', 'trésorerie']
  },
  'direction-audit': {
    name: 'Direction de l\'Audit & Contrôle Interne',
    keywords: ['audit', 'contrôle interne', 'audit interne', 'contrôle']
  },
  'direction-moyens-generaux': {
    name: 'Direction des Moyens Généraux',
    keywords: ['moyens généraux', 'logistique', 'transport', 'achats', 'patrimoine', 'automobile', 'sûreté', 'stocks']
  },
  'direction-dsi': {
    name: 'Direction des Systèmes d\'Information',
    keywords: ['systèmes d\'information', 'dsi', 'cybersécurité', 'infrastructure', 'applications', 'bases de données', 'digitalisation', 'réseaux', 'sig', 'cartographie']
  },
  'direction-capital-humain': {
    name: 'Direction du Capital Humain',
    keywords: ['capital humain', 'rh', 'carrière', 'paie', 'recrutement', 'métiers', 'centre des métiers', 'dialogue social', 'réglementation', 'santé']
  },
  'direction-exploitation-eau': {
    name: 'Direction Exploitation Eau',
    keywords: ['exploitation', 'production', 'distribution', 'maintenance', 'conduite', 'hydraulique', 'transport', 'eau']
  },
  'direction-exploitation-electricite': {
    name: 'Direction Exploitation Électricité',
    keywords: ['exploitation', 'production', 'distribution', 'maintenance', 'thermique', 'mouvement d\'énergie', 'électricité']
  },
  'direction-finances': {
    name: 'Direction Finances & Comptabilité',
    keywords: ['finances', 'comptabilité', 'trésorerie', 'budget', 'contrôle de gestion', 'comptable']
  },
  'direction-juridique': {
    name: 'Direction Juridique, Communication & RSE',
    keywords: ['juridique', 'communication', 'rse', 'responsabilité sociétale', 'entreprise']
  },
  'direction-qualite': {
    name: 'Direction Qualité Hygiène Sécurité et Environnement',
    keywords: ['qualité', 'hygiène', 'sécurité', 'environnement', 'risques', 'performance opérationnelle']
  },
  'direction-technique-eau': {
    name: 'Direction Technique Eau',
    keywords: ['technique', 'études', 'travaux', 'support technique', 'eau']
  },
  'direction-technique-electricite': {
    name: 'Direction Technique Électricité',
    keywords: ['technique', 'études', 'travaux', 'production', 'transport', 'distribution', 'électricité']
  }
};

/**
 * Classifie une offre selon son titre
 * @param {string} title - Titre de l'offre
 * @returns {string} - ID de la direction ou 'non-classifiee'
 */
function classifyOfferByTitle(title) {
  if (!title) return 'non-classifiee';
  
  const lowerTitle = title.toLowerCase();
  
  // Parcourir toutes les directions
  for (const [directionId, direction] of Object.entries(DIRECTIONS)) {
    // Vérifier si le titre contient un mot-clé de cette direction
    for (const keyword of direction.keywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        return directionId;
      }
    }
  }
  
  return 'non-classifiee';
}

/**
 * Récupère toutes les offres externes
 */
async function getExternalOffers() {
  try {
    console.log('📊 Récupération des offres externes...');
    
    const { data: offers, error } = await supabase
      .from('job_offers')
      .select('id, title, status_offerts, department, created_at')
      .or('status_offerts.eq.externe,status_offerts.is.null');
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${offers.length} offres externes trouvées`);
    return offers;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des offres:', error.message);
    throw error;
  }
}

/**
 * Met à jour la direction d'une offre
 */
async function updateOfferDirection(offerId, directionId) {
  try {
    const { error } = await supabase
      .from('job_offers')
      .update({ 
        department: directionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', offerId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de l'offre ${offerId}:`, error.message);
    return false;
  }
}

/**
 * Génère un rapport de classification
 */
function generateReport(classifications) {
  console.log('\n📋 RAPPORT DE CLASSIFICATION');
  console.log('='.repeat(50));
  
  const stats = {
    total: classifications.length,
    classifiees: 0,
    nonClassifiees: 0,
    parDirection: {}
  };
  
  // Compter les classifications
  classifications.forEach(classification => {
    if (classification.directionId === 'non-classifiee') {
      stats.nonClassifiees++;
    } else {
      stats.classifiees++;
      if (!stats.parDirection[classification.directionId]) {
        stats.parDirection[classification.directionId] = 0;
      }
      stats.parDirection[classification.directionId]++;
    }
  });
  
  console.log(`📊 Total des offres: ${stats.total}`);
  console.log(`✅ Classifiées: ${stats.classifiees}`);
  console.log(`❓ Non classifiées: ${stats.nonClassifiees}`);
  console.log(`📈 Taux de classification: ${((stats.classifiees / stats.total) * 100).toFixed(1)}%`);
  
  console.log('\n📁 Répartition par direction:');
  Object.entries(stats.parDirection)
    .sort(([,a], [,b]) => b - a)
    .forEach(([directionId, count]) => {
      const directionName = DIRECTIONS[directionId]?.name || directionId;
      console.log(`  • ${directionName}: ${count} offre(s)`);
    });
  
  if (stats.nonClassifiees > 0) {
    console.log('\n❓ Offres non classifiées:');
    classifications
      .filter(c => c.directionId === 'non-classifiee')
      .forEach(classification => {
        console.log(`  • "${classification.title}"`);
      });
  }
  
  return stats;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 DÉMARRAGE DU SCRIPT DE CLASSIFICATION');
    console.log('='.repeat(50));
    
    // Récupérer les offres externes
    const offers = await getExternalOffers();
    
    if (offers.length === 0) {
      console.log('ℹ️  Aucune offre externe trouvée');
      return;
    }
    
    // Classifier chaque offre
    console.log('\n🔍 Classification des offres...');
    const classifications = offers.map(offer => {
      const directionId = classifyOfferByTitle(offer.title);
      return {
        ...offer,
        directionId,
        directionName: DIRECTIONS[directionId]?.name || 'Non classifiée'
      };
    });
    
    // Générer le rapport
    const stats = generateReport(classifications);
    
    // Demander confirmation pour la mise à jour
    console.log('\n⚠️  ATTENTION: Ce script va modifier la base de données');
    console.log('Voulez-vous continuer avec la mise à jour? (y/N)');
    
    // En mode script, on peut ajouter une option pour forcer la mise à jour
    const forceUpdate = process.argv.includes('--force');
    
    if (forceUpdate) {
      console.log('🔄 Mise à jour forcée activée');
    } else {
      console.log('ℹ️  Utilisez --force pour forcer la mise à jour sans confirmation');
      console.log('✅ Script terminé (mode simulation)');
      return;
    }
    
    // Mettre à jour les offres classifiées
    console.log('\n💾 Mise à jour de la base de données...');
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const classification of classifications) {
      if (classification.directionId !== 'non-classifiee') {
        const success = await updateOfferDirection(classification.id, classification.directionId);
        if (success) {
          updatedCount++;
          console.log(`✅ "${classification.title}" → ${classification.directionName}`);
        } else {
          errorCount++;
        }
      }
    }
    
    console.log('\n🎉 CLASSIFICATION TERMINÉE');
    console.log('='.repeat(50));
    console.log(`✅ Offres mises à jour: ${updatedCount}`);
    if (errorCount > 0) {
      console.log(`❌ Erreurs: ${errorCount}`);
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
main();

export {
  classifyOfferByTitle,
  DIRECTIONS,
  getExternalOffers,
  updateOfferDirection
};
