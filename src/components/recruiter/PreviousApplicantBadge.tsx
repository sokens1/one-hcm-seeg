/**
 * Badge pour indiquer rapidement qu'un candidat a déjà postulé précédemment
 */

import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { useHasPreviousApplications } from "@/hooks/useCandidateHistory";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviousApplicantBadgeProps {
  candidateId: string;
  currentApplicationId?: string;
  className?: string;
}

export function PreviousApplicantBadge({ 
  candidateId, 
  currentApplicationId,
  className = "" 
}: PreviousApplicantBadgeProps) {
  const { hasPreviousApplications, previousApplicationsCount, isLoading } = 
    useHasPreviousApplications(candidateId, currentApplicationId);

  if (isLoading) {
    return <Skeleton className="h-5 w-20" />;
  }

  if (!hasPreviousApplications) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-300 ${className}`}
    >
      <History className="w-3 h-3" />
      <span className="text-xs">
        {previousApplicationsCount === 1 
          ? "Déjà candidat" 
          : `${previousApplicationsCount} candidatures`}
      </span>
    </Badge>
  );
}
