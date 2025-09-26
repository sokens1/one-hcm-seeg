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

  
}
