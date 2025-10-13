// Test simple pour vérifier la validation PDF
// Ce fichier peut être supprimé après vérification

console.log("🧪 Test de validation PDF");

// Simulation de fichiers pour tester la validation
const testFiles = [
  { name: "cv.pdf", type: "application/pdf" }, // ✅ Valide
  { name: "cv.PDF", type: "application/pdf" }, // ✅ Valide (extension majuscule)
  { name: "cv.pdf", type: "text/plain" }, // ❌ Invalide (mauvais type MIME)
  { name: "cv.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, // ❌ Invalide
  { name: "cv.jpg", type: "image/jpeg" }, // ❌ Invalide
  { name: "cv", type: "application/pdf" }, // ❌ Invalide (pas d'extension)
];

// Fonction de validation (copiée du code)
function validatePDF(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

// Test de chaque fichier
testFiles.forEach((file, index) => {
  const isValid = validatePDF(file);
  console.log(`Fichier ${index + 1}: ${file.name} (${file.type}) - ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
});

console.log("\n🎯 Résultat attendu : Seuls les 2 premiers fichiers devraient être valides");
