export const isApplicationClosed = (): boolean => {
  const deadlineDate = new Date('2025-08-31T23:59:59');
  const now = new Date();
  return now > deadlineDate;
};
