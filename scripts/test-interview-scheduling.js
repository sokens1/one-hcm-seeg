// Script de test pour la fonctionnalité de programmation d'entretien
// Ce script teste la création et la gestion des créneaux d'entretien

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre environnement)
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInterviewScheduling() {
  console.log('🧪 Test de la fonctionnalité de programmation d\'entretien...\n');

  try {
    // 1. Vérifier la structure de la table interview_slots
    console.log('1. Vérification de la structure de la table interview_slots...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'interview_slots')
      .order('ordinal_position');

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la structure:', tableError);
      return;
    }

    console.log('✅ Structure de la table interview_slots:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // 2. Vérifier la structure de la table applications
    console.log('\n2. Vérification de la structure de la table applications...');
    const { data: appTableInfo, error: appTableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'applications')
      .in('column_name', ['status', 'interview_date'])
      .order('ordinal_position');

    if (appTableError) {
      console.error('❌ Erreur lors de la vérification de la structure applications:', appTableError);
      return;
    }

    console.log('✅ Colonnes importantes de la table applications:');
    appTableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // 3. Vérifier les contraintes CHECK sur le statut
    console.log('\n3. Vérification des contraintes CHECK sur le statut...');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .eq('table_name', 'applications');

    if (constraintsError) {
      console.error('❌ Erreur lors de la vérification des contraintes:', constraintsError);
      return;
    }

    console.log('✅ Contraintes CHECK sur la table applications:');
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name}: ${constraint.check_clause}`);
    });

    // 4. Tester la création d'un créneau d'entretien
    console.log('\n4. Test de création d\'un créneau d\'entretien...');
    
    // Créer un créneau de test
    const testDate = '2025-09-15';
    const testTime = '10:00';
    
    const { data: insertData, error: insertError } = await supabase
      .from('interview_slots')
      .insert({
        date: testDate,
        time: testTime,
        is_available: false,
        application_id: null, // Pour le test
        recruiter_id: null, // Pour le test
        candidate_id: null, // Pour le test
        notes: 'Créneau de test'
      })
      .select();

    if (insertError) {
      console.error('❌ Erreur lors de la création du créneau:', insertError);
      return;
    }

    console.log('✅ Créneau créé avec succès:', insertData[0]);

    // 5. Vérifier que le créneau existe
    console.log('\n5. Vérification de l\'existence du créneau...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('interview_slots')
      .select('*')
      .eq('date', testDate)
      .eq('time', testTime);

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }

    console.log('✅ Créneau vérifié:', verifyData[0]);

    // 6. Nettoyer le créneau de test
    console.log('\n6. Nettoyage du créneau de test...');
    const { error: deleteError } = await supabase
      .from('interview_slots')
      .delete()
      .eq('date', testDate)
      .eq('time', testTime);

    if (deleteError) {
      console.error('❌ Erreur lors du nettoyage:', deleteError);
      return;
    }

    console.log('✅ Créneau de test supprimé');

    // 7. Vérifier les politiques RLS
    console.log('\n7. Vérification des politiques RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('policy_name, permissive, roles, cmd, qual')
      .eq('table_name', 'interview_slots');

    if (policiesError) {
      console.error('❌ Erreur lors de la vérification des politiques:', policiesError);
      return;
    }

    console.log('✅ Politiques RLS sur interview_slots:');
    policies.forEach(policy => {
      console.log(`   - ${policy.policy_name}: ${policy.cmd} (${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'})`);
    });

    console.log('\n🎉 Tous les tests ont réussi ! La fonctionnalité de programmation d\'entretien est prête.');

  } catch (error) {
    console.error('❌ Erreur générale lors des tests:', error);
  }
}

// Exécuter les tests
testInterviewScheduling();
