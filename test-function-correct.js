// Script de test corrigé pour la fonction Supabase Edge Function
// Exécutez avec: node test-function-correct.js

const SUPABASE_URL = 'https://fyiitzndlqcnyluwkpqp.supabase.co';

async function testSupabaseFunction() {
  console.log('🧪 Test de la fonction Supabase Edge Function...');
  
  const testPayload = {
    to: 'test@example.com',
    firstName: 'Test',
    jobTitle: 'Développeur Test',
    applicationId: 'TEST-' + Date.now()
  };

  console.log('📤 Payload envoyé:', testPayload);

  try {
    // Pour les Edge Functions, on n'a pas besoin de clé d'authentification
    // car elles sont publiques par défaut
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send_application_confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📡 Statut de la réponse:', response.status);
    console.log('📋 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('📄 Corps de la réponse:', data);

    if (response.ok) {
      console.log('✅ Succès ! Fonction appelée avec succès');
      try {
        const jsonData = JSON.parse(data);
        console.log('📊 Données JSON:', jsonData);
      } catch (e) {
        console.log('⚠️ Réponse non-JSON reçue');
      }
    } else {
      console.log('❌ Erreur ! Statut:', response.status);
      console.log('📋 Détails:', data);
      
      // Analyse de l'erreur
      if (response.status === 401) {
        console.log('🔐 Problème d\'authentification - Vérifiez la configuration de la fonction');
      } else if (response.status === 500) {
        console.log('💥 Erreur interne du serveur - Vérifiez les logs de la fonction');
      } else if (response.status === 400) {
        console.log('📝 Erreur de validation - Vérifiez le format des données envoyées');
      }
    }

  } catch (error) {
    console.error('💥 Erreur lors de l\'appel:', error);
  }
}

// Test de la fonction
testSupabaseFunction();
