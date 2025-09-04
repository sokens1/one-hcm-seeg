// Centralized launch gating utility
// Launch date: 25 Aug 2025 (local Gabon time UTC+1 assumed)
// MODIFIED: Inscription réactivée pour permettre l'accès immédiat

export const LAUNCH_DATE = new Date("2025-08-25T00:00:00+01:00"); // Date future pour désactiver l'inscription

export function isPreLaunch(now: Date = new Date()): boolean {
  return now < LAUNCH_DATE;
}
