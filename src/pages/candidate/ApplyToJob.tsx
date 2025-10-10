import { useParams, useNavigate } from "react-router-dom";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { useJobOffer } from "@/hooks/useJobOffers";
import { ContentSpinner } from "@/components/ui/spinner";

export default function ApplyToJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: jobOffer, isLoading, error } = useJobOffer(id || "");

  const handleBack = () => {
    navigate(`/jobs/${id}`);
  };

  const handleSubmit = () => {
    // Ne pas naviguer automatiquement, laisser l'utilisateur utiliser les boutons
    // dans la page de confirmation
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ContentSpinner text="Chargement de l'offre..." />
      </div>
    );
  }

  if (error || !jobOffer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur lors du chargement de l'offre</p>
          <button 
            onClick={handleBack}
            className="text-blue-600 hover:underline"
          >
            Retour aux détails de l'offre
          </button>
        </div>
      </div>
    );
  }

  return (
    <ApplicationForm 
      jobTitle={jobOffer.title}
      jobId={id || ""}
      onBack={handleBack}
      onSubmit={handleSubmit}
      offerStatus={jobOffer.status_offerts || jobOffer.status_offers || null}
    />
  );
}