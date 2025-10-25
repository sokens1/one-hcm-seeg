import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier Excel
const excelPath = path.join(process.cwd(), 'public', 'Filtres des n-1', 'Groupes.xlsx');

try {
  // Lire le fichier Excel
  const workbook = XLSX.readFile(excelPath);
  
  // Obtenir les noms des feuilles
  const sheetNames = workbook.SheetNames;
  console.log('Feuilles disponibles:', sheetNames);
  
  // Analyser chaque feuille
  sheetNames.forEach(sheetName => {
    console.log(`\n=== Feuille: ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Données:', data);
    
    // Essayer d'identifier les colonnes de directions
    if (data.length > 0) {
      const headers = data[0];
      console.log('En-têtes:', headers);
      
      // Chercher les colonnes qui pourraient contenir les directions
      const directionColumns = headers.filter((header, index) => {
        const headerStr = String(header).toLowerCase();
        return headerStr.includes('direction') || 
               headerStr.includes('groupe') || 
               headerStr.includes('service') ||
               headerStr.includes('département');
      });
      
      console.log('Colonnes de directions potentielles:', directionColumns);
    }
  });
  
} catch (error) {
  console.error('Erreur lors de la lecture du fichier Excel:', error);
}
