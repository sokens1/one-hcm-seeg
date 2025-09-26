import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, UserX } from "lucide-react";
import { useCampaignEligibility } from "@/hooks/useCampaignEligibility";

interface CampaignEligibilityAlertProps {
  className?: string;
}

export function CampaignEligibilityAlert({ className }: CampaignEligibilityAlertProps) {
  const { isEligible, reason, campaignStartDate } = useCampaignEligibility();

  if (isEligible) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const now = new Date();
  const startDate = new Date(campaignStartDate);
  
  let alertTitle = "Candidatures fermées pour votre compte";
  let alertIcon = <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />;
  
  if (now < startDate) {
    alertTitle = "Candidatures pas encore ouvertes";
    alertIcon = <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
  }

  return (
    <Alert className={`border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 ${className}`}>
      {alertIcon}
      <AlertTitle className="text-red-800 dark:text-red-200">
        {alertTitle}
      </AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-300">
        <div className="space-y-2">
          <p>{reason}</p>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3 w-3" />
            <span>Ouverture des candidatures le {formatDate(campaignStartDate)}</span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
