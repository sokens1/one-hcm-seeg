const fs = require('fs');

// Lire le fichier CSV
const csvContent = fs.readFileSync('candidats.csv', 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim() !== '');

// Parser le CSV
const candidatsCSV = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/"([^"]+)","([^"]+)"/);
  if (match) {
    candidatsCSV.push({
      nom: match[1].trim(),
      poste: match[2].trim()
    });
  }
}

console.log('=== ANALYSE DU FICHIER CSV ===');
console.log('Nombre total de candidats dans le CSV:', candidatsCSV.length);

// Liste des personnes avec des champs manquants (de notre analyse précédente)
const personnesAvecChampsManquants = [
  // Section conformite manquante
  { nom: 'Reine Gerlina Ninga', poste: 'Directeur Commercial et Recouvrement', section: 'conformite' },
  { nom: 'Emilie Abeng', poste: 'Directeur Finances et Comptabilité', section: 'conformite' },
  { nom: 'Rose Murielle Missie', poste: 'Directeur Technique Eau', section: 'conformite' },
  { nom: 'Jean Martin', poste: 'Directeur Moyens Généraux', section: 'conformite' },
  
  // Section mtp manquante
  { nom: 'Maria Evans Ze Ebe', poste: 'Coordonnateur des Régions', section: 'mtp' },
  { nom: 'Mengue Bénédicte', poste: 'Directeur Audit & Contrôle interne', section: 'mtp' },
  { nom: 'Hermann Tanda Nkombe', poste: 'Directeur Exploitation Eau', section: 'mtp' },
  { nom: 'Murielle Rose Missie', poste: 'Directeur Technique Eau', section: 'mtp' },
  { nom: 'Jean Martin', poste: 'Directeur Moyens Généraux', section: 'mtp' },
  
  // Section completude manquante
  { nom: 'Guy-Noël Ondo Ekomy', poste: 'Chef de Département Electricité', section: 'completude' },
  { nom: 'Pépin Jonas Ozela Nguema', poste: 'Chef de Département Electricité', section: 'completude' },
  { nom: 'Ulrich Moundounga', poste: 'Coordonnateur des Régions', section: 'completude' },
  { nom: 'Abessolo Aubain', poste: 'Coordonnateur des Régions', section: 'completude' },
  { nom: 'Mengue Bénédicte', poste: 'Directeur Audit & Contrôle interne', section: 'completude' },
  { nom: 'Marie Ange Nambo Wezet Née Mbourou Lamasse', poste: 'Directeur Audit & Contrôle interne', section: 'completude' },
  { nom: 'Thomas Essingone Memiaghe', poste: 'Directeur Commercial et Recouvrement', section: 'completude' },
  { nom: 'Georges Jacques S Tigoue', poste: 'Directeur Commercial et Recouvrement', section: 'completude' },
  { nom: 'Sebastien Mbot', poste: 'Directeur des Systèmes d\'Information', section: 'completude' },
  { nom: 'Derille Ovono Ename', poste: 'Directeur des Systèmes d\'Information', section: 'completude' },
  { nom: 'Ulrich Ombande Otombe', poste: 'Directeur du Capital Humain', section: 'completude' },
  { nom: 'Murielle Rose Missie', poste: 'Directeur Exploitation Eau', section: 'completude' },
  { nom: 'Abaghe Durandal', poste: 'Directeur Exploitation Electricité', section: 'completude' },
  { nom: 'Emilie Abeng', poste: 'Directeur Finances et Comptabilité', section: 'completude' },
  { nom: 'Engo Menie Jean Robert', poste: 'Directeur Juridique, Communication & RSE', section: 'completude' },
  { nom: 'Wivine Mengue', poste: 'Directeur Qualité, Hygiène, Sécurité & Environnement', section: 'completude' },
  { nom: 'Rosy Blondel Madoungou Nziengui', poste: 'Directeur Qualité, Hygiène, Sécurité & Environnement', section: 'completude' },
  { nom: 'Edwige Dilebou', poste: 'Directeur Qualité, Hygiène, Sécurité & Environnement', section: 'completude' },
  { nom: 'Augusta Britt Honorine Hervo-Akendengue Ziza Ép. Elisee Ndam', poste: 'Directeur Qualité, Hygiène, Sécurité & Environnement', section: 'completude' },
  { nom: 'Pulcherie Nicole Assame Née Nigouegouni', poste: 'Directeur Qualité, Hygiène, Sécurité & Environnement', section: 'completude' },
  { nom: 'Jean Christian Ibouily', poste: 'Directeur Technique Eau', section: 'completude' },
  { nom: 'Murielle Rose Missie', poste: 'Directeur Technique Eau', section: 'completude' },
  { nom: 'Jean Christian Ibouily', poste: 'Directeur Technique Electricité', section: 'completude' },
  { nom: 'Murielle Rose Missie', poste: 'Directeur Technique Electricité', section: 'completude' },
  { nom: 'Rose Murielle Missie', poste: 'Directeur Technique Electricité', section: 'completude' },
  { nom: 'Raissa Aimee Nse Obiang', poste: 'Directeur Moyens Généraux', section: 'completude' },
  { nom: 'Pulcherie Nicole Assame Née Nigouegouni', poste: 'Directeur Moyens Généraux', section: 'completude' },
  { nom: 'Augusta Britt Honorine Hervo-Akendengue Ziza Ép. Elisee Ndam', poste: 'Directeur Moyens Généraux', section: 'completude' },
  { nom: 'Jean Martin', poste: 'Directeur Moyens Généraux', section: 'completude' },
  
  // Section feedback manquante
  { nom: 'Jean Fabrice Ondo Mayi', poste: 'Coordonnateur des Régions', section: 'feedback' },
  { nom: 'Juste-Paulin Eloue', poste: 'Directeur Commercial et Recouvrement', section: 'feedback' },
  { nom: 'Reine Gerlina Ninga', poste: 'Directeur Commercial et Recouvrement', section: 'feedback' },
  { nom: 'Rose Murielle Missie', poste: 'Directeur Technique Electricité', section: 'feedback' },
  { nom: 'Olivia Duboze', poste: 'Directeur Moyens Généraux', section: 'feedback' }
];

console.log('\n=== CANDIDATS DU CSV AVEC DES CHAMPS MANQUANTS ===');

const candidatsAvecProblemes = [];

// Fonction pour normaliser les noms (enlever espaces, accents, etc.)
function normaliserNom(nom) {
  return nom.toLowerCase()
    .replace(/[àâäéèêëïîôöùûüÿç]/g, 'a')
    .replace(/[^a-z]/g, '');
}

// Comparer les candidats
candidatsCSV.forEach(candidatCSV => {
  const nomNormaliseCSV = normaliserNom(candidatCSV.nom);
  
  personnesAvecChampsManquants.forEach(personne => {
    const nomNormalisePersonne = normaliserNom(personne.nom);
    
    // Vérifier si c'est la même personne (nom similaire et même poste)
    if (nomNormaliseCSV === nomNormalisePersonne && candidatCSV.poste === personne.poste) {
      candidatsAvecProblemes.push({
        nom: candidatCSV.nom,
        poste: candidatCSV.poste,
        sectionManquante: personne.section
      });
    }
  });
});

console.log('Nombre de candidats du CSV avec des champs manquants:', candidatsAvecProblemes.length);

if (candidatsAvecProblemes.length > 0) {
  console.log('\n=== DÉTAIL DES CANDIDATS CONCERNÉS ===');
  candidatsAvecProblemes.forEach((candidat, index) => {
    console.log((index + 1) + '. ' + candidat.nom + ' (' + candidat.poste + ') - Section manquante: ' + candidat.sectionManquante);
  });
} else {
  console.log('Aucun candidat du CSV n\'a de champs manquants.');
}

// Statistiques par section
const statsParSection = {};
candidatsAvecProblemes.forEach(candidat => {
  if (!statsParSection[candidat.sectionManquante]) {
    statsParSection[candidat.sectionManquante] = 0;
  }
  statsParSection[candidat.sectionManquante]++;
});

console.log('\n=== STATISTIQUES PAR SECTION MANQUANTE ===');
Object.keys(statsParSection).forEach(section => {
  console.log(section + ': ' + statsParSection[section] + ' candidats');
});

// Sauvegarder les résultats
const rapport = {
  totalCandidatsCSV: candidatsCSV.length,
  candidatsAvecProblemes: candidatsAvecProblemes,
  statsParSection: statsParSection,
  dateAnalyse: new Date().toISOString()
};

fs.writeFileSync('rapport_analyse_csv.json', JSON.stringify(rapport, null, 2));
console.log('\nRapport sauvegardé dans rapport_analyse_csv.json');
