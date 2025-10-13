import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CAMPAIGNS, GLOBAL_VIEW, Campaign, getCurrentCampaign } from '@/config/campaign';

export interface CampaignContextValue {
  selectedCampaignId: string;
  setSelectedCampaignId: (campaignId: string) => void;
  selectedCampaign: Campaign | null;
  allCampaigns: Campaign[];
  isGlobalView: boolean;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
}

export function CampaignProvider({ children }: CampaignProviderProps) {
  // Par défaut, on utilise la vue globale
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(GLOBAL_VIEW.id);
  
  const selectedCampaign = selectedCampaignId === GLOBAL_VIEW.id 
    ? null 
    : CAMPAIGNS.find(c => c.id === selectedCampaignId) || null;
  
  const isGlobalView = selectedCampaignId === GLOBAL_VIEW.id;

  // Optionnel : sauvegarder la sélection dans le localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedCampaignId');
    if (saved) {
      setSelectedCampaignId(saved);
    } else {
      // Par défaut, on affiche la vue globale
      setSelectedCampaignId(GLOBAL_VIEW.id);
    }
  }, []);

  const handleSetSelectedCampaignId = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    localStorage.setItem('selectedCampaignId', campaignId);
  };

  const value: CampaignContextValue = {
    selectedCampaignId,
    setSelectedCampaignId: handleSetSelectedCampaignId,
    selectedCampaign,
    allCampaigns: CAMPAIGNS,
    isGlobalView
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}

