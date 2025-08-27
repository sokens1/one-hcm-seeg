// Script de test direct de la fonction Supabase
// Exécutez avec: node test-function-direct.js

const SUPABASE_URL = 'https://fyiitzndlqcnyluwkpqp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWl0em5kbHFxbnlsdXdocHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzI2MzMsImV4cCI6MjA3MTkwODYzM30.5a575c71153e6bc39424f5215e06d2565d7a13fee0a9a3648d46f6c6cdd1dc08';

async function testSupabaseFunction() {
  console.log('🧪 Test de la fonction Supabase...');
  
  const testPayload = {
    to: 'test@example.com',
    firstName: 'Test',
    jobTitle: 'Développeur Test',
    applicationId: 'TEST-' + Date.now()
  };

  console.log('📤 Payload envoyé:', testPayload);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send_application_confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📡 Statut de la réponse:', response.status);
    console.log('📋 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('📄 Corps de la réponse:', data);

    if (response.ok) {
      console.log('✅ Succès ! Fonction appelée avec succès');
    } else {
      console.log('❌ Erreur ! Statut:', response.status);
      console.log('📋 Détails:', data);
    }

  } catch (error) {
    console.error('💥 Erreur lors de l\'appel:', error);
  }
}

// Test de la fonction
testSupabaseFunction();
