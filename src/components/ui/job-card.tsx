import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { isApplicationClosed } from "@/utils/applicationUtils";
import { toast } from "sonner";

interface JobCardProps {
  title: string;
  location: string;
  contractType: string;
  description?: string;
  isPreview?: boolean;
  candidateCount?: number;
  onClick?: () => void;
  locked?: boolean;
  onLockedClick?: () => void;
  isExpired?: boolean; // Nouvelle prop pour les campagnes expirées
  statusOfferts?: string | null; // Statut interne/externe de l'offre
}

export function JobCard({ 
  title, 
  location, 
  contractType, 
  description, 
  isPreview = false,
  candidateCount,
  onClick,
  locked = false,
  onLockedClick,
  isExpired = false,
  statusOfferts,
}: JobCardProps) {
  const toPlainText = (input?: string) => {
    if (!input) return "";
    // If string contains HTML tags, convert to text using a temporary element
    if (/<[a-z][\s\S]*>/i.test(input)) {
      const el = document.createElement('div');
      el.innerHTML = input;
      return (el.textContent || el.innerText || "").trim();
    }
    return input;
  };

  return (
    <Card
      className={`hover:shadow-medium transition-all duration-300 ${locked || isExpired ? "cursor-default" : "cursor-pointer"} ${isExpired ? "opacity-60 bg-gray-50 border-dashed grayscale" : ""} group h-full flex flex-col`}
      onClick={locked || isExpired ? undefined : onClick}
    >
      <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4 flex-1">
          <div className="flex-1 space-y-2 md:space-y-3 flex flex-col min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                {title}
              </h3>
              <div className="flex flex-col gap-1 flex-shrink-0">
                {isExpired && (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300 text-xs">
                    Expirée
                  </Badge>
                )}
                {statusOfferts && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      statusOfferts === 'interne' 
                        ? 'bg-blue-50 text-blue-700 border-blue-300' 
                        : 'bg-green-50 text-green-700 border-green-300'
                    }`}
                  >
                    {statusOfferts === 'interne' ? 'Interne' : 'Externe'}
                  </Badge>
                )}
              </div>
            </div>
            
            {!locked && (
              <div className="flex flex-col md:flex-row md:items-center gap-1 sm:gap-2 md:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{contractType}</span>
                </div>
              </div>
            )}

            {!locked && description && (
              <p className="text-muted-foreground line-clamp-3 text-xs sm:text-sm flex-1 leading-relaxed">
                {toPlainText(description)}
              </p>
            )}

            {!locked && candidateCount !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-success-light text-success-foreground px-2 sm:px-3 lg:px-4 py-1 text-xs">
                  {candidateCount} {candidateCount === 1 ? 'candidat' : 'candidats'}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            {isPreview ? (
              <Button
                variant={isExpired ? "outline" : "hero"}
                size="sm"
                className={`w-full md:w-auto text-xs sm:text-sm h-8 md:h-9 ${locked || isExpired ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                onClick={locked || isExpired ? (isExpired ? () => toast.error("Cette offre n'est plus disponible (campagne expirée)") : onLockedClick) : onClick}
                aria-disabled={locked || isExpired}
                disabled={isExpired}
              >
                {isExpired ? (
                  <>
                    <span className="hidden md:inline">Offre expirée</span>
                    <span className="md:hidden">Expirée</span>
                  </>
                ) : (
                  <>
                    <span className="hidden md:inline">Voir l'offre</span>
                    <span className="md:hidden">Voir</span>
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="group-hover:border-primary group-hover:text-primary w-full md:w-auto text-xs sm:text-sm h-8 md:h-9"
                disabled={candidateCount === undefined}
              >
                {candidateCount !== undefined ? 'Gérer' : 'Postuler'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}