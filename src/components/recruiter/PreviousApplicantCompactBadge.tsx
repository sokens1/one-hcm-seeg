/**
 * Badge compact pour indiquer rapidement dans les listes qu'un candidat a déjà postulé
 */

import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { useHasPreviousApplications } from "@/hooks/useCandidateHistory";

interface PreviousApplicantCompactBadgeProps {
  candidateId: string;
  currentApplicationId?: string;
}

export function PreviousApplicantCompactBadge({ 
  candidateId, 
  currentApplicationId 
}: PreviousApplicantCompactBadgeProps) {
  const { hasPreviousApplications, previousApplicationsCount, isLoading } = 
    useHasPreviousApplications(candidateId, currentApplicationId);

  if (isLoading || !hasPreviousApplications) {
    return null;
  }

  return (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-300 text-xs"
      title={`Ce candidat a déjà postulé ${previousApplicationsCount} fois`}
    >
      <History className="w-3 h-3" />
      {previousApplicationsCount}×
    </Badge>
  );
}
