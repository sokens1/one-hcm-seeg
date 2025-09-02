/**
 * Test léger (sans Jest) pour vérifier la logique du calendrier d'entretiens
 * Usage: node test-calendar-modal.js
 */

import { format } from 'date-fns';

function getInterviewsForDate(date, interviews) {
  const dateString = format(date, 'yyyy-MM-dd');
  return interviews.filter((i) => i.date === dateString);
}

function run() {
  console.log('🧪 Test calendrier entretiens');

  // Données de test: 2 entretiens le 2025-09-03, 1 entretien le 2025-09-10
  const interviews = [
    { id: '1', date: '2025-09-03', time: '09:00', application_id: 'A1' },
    { id: '2', date: '2025-09-03', time: '11:00', application_id: 'A2' },
    { id: '3', date: '2025-09-10', time: '15:00', application_id: 'A3' },
  ];

  const selected = new Date('2025-09-03T00:00:00Z');

  // 1) Titre format dd/MM/yyyy
  const header = `Entretiens du ${format(selected, 'dd/MM/yyyy')}`;
  if (header !== 'Entretiens du 03/09/2025') {
    console.error('❌ Format du titre invalide:', header);
    process.exit(1);
  } else {
    console.log('✅ Titre formaté correctement:', header);
  }

  // 2) Filtrage des entretiens par date
  const list = getInterviewsForDate(selected, interviews);
  if (list.length !== 2) {
    console.error('❌ Mauvais nombre d\'entretiens pour 03/09/2025:', list.length);
    process.exit(1);
  } else {
    console.log('✅ Filtrage ok pour 03/09/2025:', list.length, 'entretiens');
  }

  // 3) Indicateur de jour occupé (badge) -> count > 0
  const occupied = list.length > 0;
  if (!occupied) {
    console.error('❌ Le jour devrait être marqué occupé');
    process.exit(1);
  } else {
    console.log('✅ Le jour est marqué occupé (badge attendu)');
  }

  console.log('🎉 Tests calendrier OK');
}

run();


