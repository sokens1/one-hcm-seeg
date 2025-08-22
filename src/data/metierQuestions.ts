// Dynamic Métier questions mapping per job offer title
// Fill this map with the 12 job offers -> 7 questions each (exact titles)
// Keys should be the job offer titles as displayed to candidates.
// If a title is not found, `defaultMetierQuestions` will be used.

export const defaultMetierQuestions: string[] = [
  "1. Quelles sont vos principales compétences techniques dans ce domaine ?",
  "2. Comment votre expérience professionnelle vous prépare-t-elle à ce poste ?",
  "3. Quels défis techniques de ce métier vous motivent le plus ?",
  "4. Décrivez un projet significatif lié à ce métier et votre rôle précis.",
  "5. Comment garantissez-vous la qualité, la sécurité et la conformité dans vos missions ?",
  "6. Quelles méthodes ou outils utilisez-vous pour optimiser vos performances dans ce métier ?",
  "7. Quels indicateurs de réussite (KPIs) suivriez-vous dans ce poste et pourquoi ?",
];

// Helper to normalize titles for safer lookups
const normalize = (s: string) => s
  .toLowerCase()
  .normalize("NFD").replace(/\p{Diacritic}/gu, "") // strip accents
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

// Map by normalized title for resilient matching
const metierQuestionsByOfferNormalized: Record<string, string[]> = {
  // Example (replace with real offers and questions):
  // normalize("Directeur des Opérations SEEG"): [
  //   "1. ...",
  //   "2. ...",
  //   "3. ...",
  //   "4. ...",
  //   "5. ...",
  //   "6. ...",
  //   "7. ...",
  // ],
};

export function getMetierQuestionsForTitle(jobTitle?: string): string[] {
  if (!jobTitle) return defaultMetierQuestions;
  const key = normalize(jobTitle);
  return metierQuestionsByOfferNormalized[key] ?? defaultMetierQuestions;
}
