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

  // RESTRICTION DÉSACTIVÉE - Tous les utilisateurs connectés peuvent postuler
  // const campaignStartDate = new Date(CAMPAIGN_START_DATE);
  // const userCreatedAt = new Date(user.created_at);
  // const now = new Date();

  // // Vérifier si l'utilisateur est éligible (créé après le début de campagne) ET si la campagne est ouverte
  // const isUserEligible = userCreatedAt >= campaignStartDate;
  // const isCampaignOpen = now >= campaignStartDate;
  // const isEligible = isUserEligible && isCampaignOpen;

  // let reason: string | undefined;
  // if (!isUserEligible) {
  //   reason = 'Votre compte a été créé avant le 27/09/2025. Les candidatures ne sont ouvertes qu\'aux utilisateurs créés à partir de cette date.';
  // } else if (!isCampaignOpen) {
  //   reason = 'Les candidatures ne sont pas encore ouvertes. Elles seront disponibles à partir du 27/09/2025.';
  // }

  // Tous les utilisateurs connectés sont éligibles
  return {
    isEligible: true,
    campaignStartDate: CAMPAIGN_START_DATE,
    userCreatedAt: user.created_at,
    reason: undefined
  };
}
