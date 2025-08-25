import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CandidateLayout } from '@/components/layout/CandidateLayout';
import { useApplication } from '@/hooks/useApplications';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ContentSpinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

export default function EditApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: application, isLoading, error } = useApplication(id);
  const initialStep = Number(searchParams.get('step') || 4);
  const from = searchParams.get('from');

  if (isLoading) {
    return (
      <CandidateLayout>
        <ContentSpinner text="Chargement de la candidature..." />
      </CandidateLayout>
    );
  }

  if (error) {
    return (
      <CandidateLayout>
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Impossible de charger les détails de la candidature.</AlertDescription>
        </Alert>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <h1 className="text-2xl font-bold mb-4">Modification de candidature désactivée</h1>
      <Alert>
        <AlertTitle>Édition indisponible</AlertTitle>
        <AlertDescription>
          Les candidatures soumises ne sont plus modifiables. Vous pouvez toutefois consulter le suivi de votre candidature.
        </AlertDescription>
      </Alert>
      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <Button
          variant="default"
          onClick={() => navigate(`/candidate/dashboard?view=tracking&id=${id}&from=applications`)}
        >
          Voir le suivi de ma candidature
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/candidate/dashboard?view=applications')}
        >
          Retour à mes candidatures
        </Button>
      </div>
    </CandidateLayout>
  );
}
