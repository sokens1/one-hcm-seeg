export const isApplicationClosed = (): boolean => {
  // MODIFIED: Date de fermeture repoussée pour permettre l'inscription
  const deadlineDate = new Date('2026-12-31T23:59:59'); // Date très éloignée
  const now = new Date();
  return now > deadlineDate;
};
