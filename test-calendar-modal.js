import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Test du modal calendrier des entretiens...\n');

// Test 1: Vérifier que le composant InterviewCalendarModal existe
console.log('1️⃣ Test existence du composant InterviewCalendarModal');
const modalPath = path.join(__dirname, 'src/components/evaluation/InterviewCalendarModal.tsx');
const modalExists = fs.existsSync(modalPath);
console.log(`   ✅ Fichier modal: ${modalExists ? 'PRÉSENT' : 'MANQUANT'}`);

if (modalExists) {
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  
  // Test 2: Vérifier les fonctionnalités du modal
  console.log('\n2️⃣ Test fonctionnalités du modal');
  const hasDialog = modalContent.includes('Dialog');
  const hasCalendar = modalContent.includes('Calendar');
  const hasInterviewInterface = modalContent.includes('interface Interview');
  const hasLoadInterviews = modalContent.includes('loadInterviews');
  const hasGetInterviewsForDate = modalContent.includes('getInterviewsForDate');
  const hasDebugLogs = modalContent.includes('[CALENDAR DEBUG]');
  
  console.log(`   ✅ Dialog component: ${hasDialog ? 'PRÉSENT' : 'MANQUANT'}`);
  console.log(`   ✅ Calendar component: ${hasCalendar ? 'PRÉSENT' : 'MANQUANT'}`);
  console.log(`   ✅ Interface Interview: ${hasInterviewInterface ? 'PRÉSENT' : 'MANQUANT'}`);
  console.log(`   ✅ Fonction loadInterviews: ${hasLoadInterviews ? 'PRÉSENT' : 'MANQUANT'}`);
  console.log(`   ✅ Fonction getInterviewsForDate: ${hasGetInterviewsForDate ? 'PRÉSENT' : 'MANQUANT'}`);
  console.log(`   ✅ Logs de debug: ${hasDebugLogs ? 'PRÉSENT' : 'MANQUANT'}`);
  
  // Test 3: Vérifier la responsivité mobile
  console.log('\n3️⃣ Test responsivité mobile');
  const hasResponsiveClasses = modalContent.includes('sm:') || modalContent.includes('lg:') || modalContent.includes('flex-col lg:flex-row');
  const hasMobileOptimization = modalContent.includes('min-h-[50px] sm:min-h-[60px]') || modalContent.includes('text-xs sm:text-sm');
  
  console.log(`   ✅ Classes responsives: ${hasResponsiveClasses ? 'PRÉSENT' : 'MANQUANT'}`);
  console.log(`   ✅ Optimisation mobile: ${hasMobileOptimization ? 'PRÉSENT' : 'MANQUANT'}`);
  
  // Test 4: Vérifier l'intégration dans EvaluationDashboard
  console.log('\n4️⃣ Test intégration dans EvaluationDashboard');
  const dashboardPath = path.join(__dirname, 'src/components/evaluation/EvaluationDashboard.tsx');
  const dashboardExists = fs.existsSync(dashboardPath);
  
  if (dashboardExists) {
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    const hasModalImport = dashboardContent.includes('InterviewCalendarModal');
    const hasCalendarButton = dashboardContent.includes('Voir le calendrier');
    const hasCalendarDaysIcon = dashboardContent.includes('CalendarDays');
    const hasModalState = dashboardContent.includes('isCalendarModalOpen');
    const hasModalComponent = dashboardContent.includes('<InterviewCalendarModal');
    
    console.log(`   ✅ Import du modal: ${hasModalImport ? 'PRÉSENT' : 'MANQUANT'}`);
    console.log(`   ✅ Bouton calendrier: ${hasCalendarButton ? 'PRÉSENT' : 'MANQUANT'}`);
    console.log(`   ✅ Icône CalendarDays: ${hasCalendarDaysIcon ? 'PRÉSENT' : 'MANQUANT'}`);
    console.log(`   ✅ État du modal: ${hasModalState ? 'PRÉSENT' : 'MANQUANT'}`);
    console.log(`   ✅ Composant modal: ${hasModalComponent ? 'PRÉSENT' : 'MANQUANT'}`);
  } else {
    console.log(`   ❌ Fichier EvaluationDashboard non trouvé`);
  }
  
  // Test 5: Vérifier les logs de debug pour les entretiens
  console.log('\n5️⃣ Test logs de debug pour les entretiens');
  const hasInterviewLogs = modalContent.includes('Entretiens pour') && modalContent.includes('Entretiens formatés');
  const hasDateSelectionLogs = modalContent.includes('Date sélectionnée');
  const hasLoadLogs = modalContent.includes('Chargement des entretiens');
  
  console.log(`   ✅ Logs entretiens par date: ${hasInterviewLogs ? 'PRÉSENT' : 'MANQUANT'}`);
  console.log(`   ✅ Logs sélection date: ${hasDateSelectionLogs ? 'PRÉSENT' : 'MANQUANT'}`);
  console.log(`   ✅ Logs chargement: ${hasLoadLogs ? 'PRÉSENT' : 'MANQUANT'}`);
  
} else {
  console.log('   ❌ Fichier modal non trouvé');
}

// Résumé
console.log('\n📊 RÉSUMÉ DES TESTS:');
const tests = [
  { name: 'Fichier modal existe', result: modalExists },
  { name: 'Dialog component', result: modalExists && fs.readFileSync(modalPath, 'utf8').includes('Dialog') },
  { name: 'Interface Interview', result: modalExists && fs.readFileSync(modalPath, 'utf8').includes('interface Interview') },
  { name: 'Fonction loadInterviews', result: modalExists && fs.readFileSync(modalPath, 'utf8').includes('loadInterviews') },
  { name: 'Classes responsives', result: modalExists && (fs.readFileSync(modalPath, 'utf8').includes('sm:') || fs.readFileSync(modalPath, 'utf8').includes('lg:')) },
  { name: 'Bouton calendrier', result: fs.existsSync(path.join(__dirname, 'src/components/evaluation/EvaluationDashboard.tsx')) && fs.readFileSync(path.join(__dirname, 'src/components/evaluation/EvaluationDashboard.tsx'), 'utf8').includes('Voir le calendrier') },
  { name: 'Icône CalendarDays', result: fs.existsSync(path.join(__dirname, 'src/components/evaluation/EvaluationDashboard.tsx')) && fs.readFileSync(path.join(__dirname, 'src/components/evaluation/EvaluationDashboard.tsx'), 'utf8').includes('CalendarDays') },
  { name: 'Logs de debug', result: modalExists && fs.readFileSync(modalPath, 'utf8').includes('[CALENDAR DEBUG]') }
];

const passedTests = tests.filter(test => test.result).length;
const totalTests = tests.length;

console.log(`\n✅ Tests réussis: ${passedTests}/${totalTests}`);

tests.forEach(test => {
  const status = test.result ? '✅' : '❌';
  console.log(`   ${status} ${test.name}`);
});

if (passedTests === totalTests) {
  console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS ! Le modal du calendrier est correctement implémenté.');
} else {
  console.log('\n⚠️  Certains tests ont échoué. Vérifiez les éléments manquants.');
}

console.log('\n📝 Instructions pour tester manuellement:');
console.log('   1. Ouvrez l\'application et accédez à une évaluation de candidat');
console.log('   2. Cliquez sur le bouton vert "Voir le calendrier"');
console.log('   3. Vérifiez que le modal s\'ouvre correctement');
console.log('   4. Cliquez sur différents jours pour voir les entretiens');
console.log('   5. Ouvrez la console du navigateur pour voir les logs de debug');
console.log('   6. Testez sur mobile pour vérifier la responsivité');
