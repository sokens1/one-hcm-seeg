import { useAuth } from "@/hooks/useAuth";

const CAMPAIGN_START_DATE = '2025-09-27T00:00:00.000Z';

export interface CampaignEligibility {
  isEligible: boolean;
  campaignStartDate: string;
  userCreatedAt: string;
  reason?: string;
}

export function useCampaignEligibility(): CampaignEligibility {
  const { user } = useAuth();

  if (!user) {
    return {
      isEligible: false,
      campaignStartDate: CAMPAIGN_START_DATE,
      userCreatedAt: '',
      reason: 'Utilisateur non connecté'
    };
  }

  const campaignStartDate = new Date(CAMPAIGN_START_DATE);
  const userCreatedAt = new Date(user.created_at);

  const isEligible = userCreatedAt >= campaignStartDate;

  return {
    isEligible,
    campaignStartDate: CAMPAIGN_START_DATE,
    userCreatedAt: user.created_at,
    reason: isEligible 
      ? undefined 
      : 'Votre compte a été créé avant le 27/09/2025. Les candidatures ne sont ouvertes qu\'aux utilisateurs créés à partir de cette date.'
  };
}
