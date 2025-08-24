import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CandidateLayout } from '@/components/layout/CandidateLayout';
import { ApplicationForm } from '@/components/forms/ApplicationForm';
import { useApplication } from '@/hooks/useApplications';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ContentSpinner } from '@/components/ui/spinner';

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
      <h1 className="text-2xl font-bold mb-4">Modifier ma candidature</h1>
      {application && (
        <ApplicationForm
          jobTitle={application.job_offers?.title ?? 'Offre'}
          jobId={application.job_offer_id}
          onBack={() => {
            if (from === 'applications') {
              navigate('/candidate/dashboard?view=applications');
            } else {
              navigate(-1);
            }
          }}
          onSubmit={() => {
            if (from === 'applications') {
              navigate('/candidate/dashboard?view=applications');
            } else {
              navigate('/candidate/dashboard?view=dashboard');
            }
          }}
          applicationId={id}
          mode="edit"
          initialStep={Number.isFinite(initialStep) ? initialStep : 4}
        />
      )}
    </CandidateLayout>
  );
}
