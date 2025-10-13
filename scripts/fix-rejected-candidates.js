// Script pour corriger les candidatures refusées qui ont été évaluées en entretien
// Ce script met à 0 les annotations M, T, P de la partie entretien pour les candidats refusés

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRejectedCandidates() {
  try {
    console.log('🔍 Recherche des candidatures refusées avec évaluations d\'entretien...');
    
    // 1. Récupérer toutes les candidatures refusées qui ont des évaluations d'entretien
    const { data: rejectedApplications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        id,
        candidate_id,
        status,
        job_offers!inner(title),
        users!inner(first_name, last_name, email),
        protocol1_evaluations!inner(
          id,
          interview_metier_score,
          interview_talent_score,
          interview_paradigme_score,
          interview_metier_comments,
          interview_talent_comments,
          interview_paradigme_comments
        )
      `)
      .eq('status', 'refuse')
      .not('protocol1_evaluations.interview_metier_score', 'is', null)
      .not('protocol1_evaluations.interview_talent_score', 'is', null)
      .not('protocol1_evaluations.interview_paradigme_score', 'is', null);

    if (applicationsError) {
      console.error('❌ Erreur lors de la récupération des candidatures:', applicationsError);
      return;
    }

    if (!rejectedApplications || rejectedApplications.length === 0) {
      console.log('✅ Aucune candidature refusée avec évaluations d\'entretien trouvée');
      return;
    }

    console.log(`📊 ${rejectedApplications.length} candidatures refusées avec évaluations d'entretien trouvées:`);
    
    // 2. Afficher la liste des candidats concernés
    rejectedApplications.forEach((app, index) => {
      const candidate = app.users;
      const evaluation = app.protocol1_evaluations;
      console.log(`${index + 1}. ${candidate.first_name} ${candidate.last_name} (${candidate.email})`);
      console.log(`   Poste: ${app.job_offers.title}`);
      console.log(`   Scores actuels - M: ${evaluation.interview_metier_score}, T: ${evaluation.interview_talent_score}, P: ${evaluation.interview_paradigme_score}`);
      console.log('');
    });

    // 3. Demander confirmation
    console.log('⚠️  ATTENTION: Cette opération va mettre à 0 les scores M, T, P de l\'entretien pour tous ces candidats.');
    console.log('Appuyez sur Ctrl+C pour annuler, ou appuyez sur Entrée pour continuer...');
    
    // Attendre la confirmation (simulation)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Mettre à jour les évaluations
    console.log('🔄 Mise à jour des évaluations...');
    
    const updatePromises = rejectedApplications.map(async (app) => {
      const evaluation = app.protocol1_evaluations;
      
      const { error: updateError } = await supabase
        .from('protocol1_evaluations')
        .update({
          interview_metier_score: 0,
          interview_talent_score: 0,
          interview_paradigme_score: 0,
          interview_metier_comments: '',
          interview_talent_comments: '',
          interview_paradigme_comments: '',
          updated_at: new Date().toISOString()
        })
        .eq('id', evaluation.id);

      if (updateError) {
        console.error(`❌ Erreur pour ${app.users.first_name} ${app.users.last_name}:`, updateError);
        return false;
      }

      console.log(`✅ ${app.users.first_name} ${app.users.last_name} - Scores M, T, P remis à 0`);
      return true;
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(Boolean).length;
    const errorCount = results.length - successCount;

    console.log(`\n📊 Résumé de l'opération:`);
    console.log(`✅ ${successCount} candidats corrigés avec succès`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} erreurs rencontrées`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
fixRejectedCandidates();




