/**
 * Alerte simple pour indiquer qu'un candidat a déjà postulé
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { History, AlertCircle } from "lucide-react";
import { useCandidateHistory } from "@/hooks/useCandidateHistory";

interface PreviousApplicationAlertProps {
  candidateId: string;
  currentApplicationId?: string;
}

export function PreviousApplicationAlert({ 
  candidateId, 
  currentApplicationId 
}: PreviousApplicationAlertProps) {
  const { data: history = [], isLoading, error } = useCandidateHistory(candidateId, currentApplicationId);

  // Ne rien afficher si en chargement, erreur, ou pas d'historique
  if (isLoading || error || history.length === 0) {
    return null;
  }

  // Récupérer la dernière candidature
  const lastApplication = history[0];
  const hasMultipleApplications = history.length > 1;

  // Récupérer les campagnes uniques
  const campaigns = [...new Set(history.map(h => h.campaign_id).filter(Boolean))];

  return (
    <Alert className="bg-orange-50 border-orange-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <AlertDescription className="text-sm text-orange-800">
            <span className="font-semibold">Ce candidat a déjà postulé</span>
            {hasMultipleApplications ? (
              <span> {history.length} fois</span>
            ) : (
              <span> une fois</span>
            )}
            {campaigns.length > 0 && (
              <span> lors de la campagne {campaigns.map(c => `#${c}`).join(', ')}</span>
            )}
            {lastApplication && (
              <>
                {' '}(dernière candidature : <span className="font-medium">{lastApplication.job_title}</span>
                {' '}- {lastApplication.application_status === 'refuse' ? 'Refusé' : 
                      lastApplication.application_status === 'embauche' ? 'Embauché' : 
                      lastApplication.application_status === 'incubation' ? 'En incubation' : 
                      'En cours'})
              </>
            )}
          </AlertDescription>
        </div>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 flex-shrink-0">
          <History className="w-3 h-3 mr-1" />
          {hasMultipleApplications ? `${history.length}×` : '1×'}
        </Badge>
      </div>
    </Alert>
  );
}
