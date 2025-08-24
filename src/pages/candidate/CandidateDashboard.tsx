import { CandidateLayout } from "@/components/layout/CandidateLayout";

export default function CandidateDashboard() {
  // Pas besoin de vérifier l'authentification ici car ProtectedRoute s'en charge déjà
  return <CandidateLayout />;
}