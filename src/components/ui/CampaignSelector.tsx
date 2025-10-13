import { useCampaign } from "@/contexts/CampaignContext";
import { GLOBAL_VIEW } from "@/config/campaign";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe, Filter, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function CampaignSelector() {
  const { selectedCampaignId, setSelectedCampaignId, allCampaigns, isGlobalView, selectedCampaign } = useCampaign();

  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${format(startDate, "dd/MM/yyyy", { locale: fr })} - ${format(endDate, "dd/MM/yyyy", { locale: fr })}`;
  };

  const getCurrentLabel = () => {
    if (isGlobalView) {
      return GLOBAL_VIEW.name;
    }
    return selectedCampaign?.name || "Sélectionner une campagne";
  };

  return (
    <div className="relative">
      {/* Card moderne avec dégradé - Optimisé pour mobile */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg shadow-blue-100/50 dark:shadow-none overflow-hidden backdrop-blur-sm">
        <div className="p-3 sm:p-4 lg:p-5">
          {/* Titre - Optimisé pour mobile */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
              Filtrer par campagne
            </span>
          </div>

          {/* Boutons de campagne - Optimisé pour mobile */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            {/* Vue Globale - Optimisé pour mobile */}
            <button
              onClick={() => setSelectedCampaignId(GLOBAL_VIEW.id)}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md w-full sm:w-auto ${
                isGlobalView
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md flex-shrink-0 ${
                isGlobalView
                  ? 'bg-white/20'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                <Globe className={`h-3 w-3 sm:h-4 sm:w-4 ${isGlobalView ? 'text-white' : 'text-white'}`} />
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-semibold text-xs sm:text-sm truncate">{GLOBAL_VIEW.name}</div>
                <div className={`text-xs ${isGlobalView ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} truncate`}>
                  {GLOBAL_VIEW.description}
                </div>
              </div>
            </button>

            {/* Campagnes individuelles */}
            {allCampaigns.map((campaign, index) => {
              const isSelected = selectedCampaignId === campaign.id;
              const isDisabled = campaign.id === 'campaign-3'; // Désactiver la campagne 3
              const colors = [
                'from-green-500 to-emerald-600',
                'from-orange-500 to-amber-600',
                'from-purple-500 to-pink-600'
              ];
              const colorClass = colors[index] || 'from-gray-500 to-gray-600';
              
              return (
                <button
                  key={campaign.id}
                  onClick={() => !isDisabled && setSelectedCampaignId(campaign.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all duration-200 w-full sm:w-auto ${
                    isDisabled 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-50'
                      : isSelected
                        ? `bg-gradient-to-r ${colorClass} text-white border-transparent shadow-md hover:shadow-lg`
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md flex-shrink-0 ${
                    isSelected
                      ? 'bg-white/20'
                      : `bg-gradient-to-br ${colorClass}`
                  }`}>
                    <Calendar className={`h-3 w-3 sm:h-4 sm:w-4 ${isSelected ? 'text-white' : 'text-white'}`} />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      <span className="truncate">{campaign.name}</span>
                      {isDisabled && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          Bientôt
                        </Badge>
                      )}
                    </div>
                    <div className={`text-xs truncate ${
                      isDisabled
                        ? 'text-gray-400 dark:text-gray-600'
                        : isSelected 
                          ? 'text-white/80' 
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatDateRange(campaign.startDate, campaign.endDate)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barre de progression pour l'effet visuel */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
      </div>
    </div>
  );
}

