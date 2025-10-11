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
import { Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function CampaignSelector() {
  const { selectedCampaignId, setSelectedCampaignId, allCampaigns, isGlobalView } = useCampaign();

  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${format(startDate, "dd/MM/yyyy", { locale: fr })} - ${format(endDate, "dd/MM/yyyy", { locale: fr })}`;
  };

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        {isGlobalView ? (
          <Globe className="h-5 w-5 text-primary" />
        ) : (
          <Calendar className="h-5 w-5 text-primary" />
        )}
        <span className="text-sm font-medium text-muted-foreground">Filtrer par campagne :</span>
      </div>
      
      <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Sélectionner une campagne" />
        </SelectTrigger>
        <SelectContent>
          {/* Vue globale */}
          <SelectItem value={GLOBAL_VIEW.id}>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <div>
                <div className="font-medium">{GLOBAL_VIEW.name}</div>
                <div className="text-xs text-muted-foreground">{GLOBAL_VIEW.description}</div>
              </div>
            </div>
          </SelectItem>

          {/* Séparateur */}
          <div className="border-t my-2" />

          {/* Campagnes individuelles */}
          {allCampaigns.map((campaign) => (
            <SelectItem key={campaign.id} value={campaign.id}>
              <div className="flex flex-col gap-1">
                <div className="font-medium">{campaign.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDateRange(campaign.startDate, campaign.endDate)}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Badge indiquant la sélection actuelle */}
      {!isGlobalView && (
        <Badge variant="outline" className="text-xs">
          {allCampaigns.find(c => c.id === selectedCampaignId)?.name}
        </Badge>
      )}
    </div>
  );
}

