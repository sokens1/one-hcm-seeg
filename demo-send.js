// Script de démonstration - Affiche exactement ce qui est envoyé vers momo.com
console.log('🎯 === DÉMONSTRATION D\'ENVOI VERS MOMO.COM ===\n');

const API_URL = 'https://momo.com/api/candidats';

// Données exactes à envoyer
const candidatData = {
  "id": 1,
  "Nom": "Doe",
  "Prénom": "Jane",
  "cv": "Expériences solides en Data Science, MLOps (CI/CD), NLP, optimisation de modèles. Azure, Databricks, Python, SQL.",
  "lettre_motivation": "Très motivée par les projets data à impact au Gabon, et l industrialisation ML.",
  "MTP": {
    "M": "Modèles supervisés et évaluation",
    "T": "Azure, Databricks, Terraform, Python, SQL",
    "P": "Leadership et communication"
  },
  "post": "Data Scientist Senior"
};

console.log('📍 URL de destination:', API_URL);
console.log('\n📤 DONNÉES QUI SERONT ENVOYÉES:');
console.log('=====================================');
console.log(JSON.stringify(candidatData, null, 2));
console.log('=====================================');

console.log('\n📦 BODY JSON (format string):');
console.log('=====================================');
console.log(JSON.stringify(candidatData));
console.log('=====================================');

console.log('\n📏 INFORMATIONS TECHNIQUES:');
console.log('- Taille des données:', JSON.stringify(candidatData).length, 'caractères');
console.log('- Nombre de propriétés:', Object.keys(candidatData).length);
console.log('- Type de données:', typeof candidatData);
console.log('- Format MTP:', typeof candidatData.MTP);

console.log('\n🔍 DÉTAIL DES PROPRIÉTÉS:');
Object.entries(candidatData).forEach(([key, value]) => {
  if (typeof value === 'object') {
    console.log(`- ${key}:`, JSON.stringify(value));
  } else {
    console.log(`- ${key}:`, `"${value}"`);
  }
});

console.log('\n🌐 REQUÊTE HTTP SIMULÉE:');
console.log('Method: POST');
console.log('URL:', API_URL);
console.log('Headers: {');
console.log('  "Content-Type": "application/json"');
console.log('}');
console.log('Body:', JSON.stringify(candidatData));

console.log('\n✅ PRÊT POUR L\'ENVOI VERS MOMO.COM !');
console.log('Exécutez un des scripts de test pour envoyer réellement les données.');
