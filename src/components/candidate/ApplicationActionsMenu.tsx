import { useState } from 'react';
import { MoreVertical, FileText, Download, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { Application, ApplicationData } from '@/types/application';
import { generateApplicationPdf } from '@/utils/generateApplicationPdf';
import { Link } from 'react-router-dom';

interface ApplicationActionsMenuProps {
  application: Application;
  jobTitle: string;
  className?: string;
}

export function ApplicationActionsMenu({ application, jobTitle, className = '' }: ApplicationActionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsLoading(true);
      
      // Get user data from the application
      const user = application.users;
      const profile = user?.candidate_profiles;
      
      // Get MTP answers
      const mtpAnswers = application.mtp_answers || {};
      const [metier1, metier2, metier3] = mtpAnswers.metier || [];
      const [talent1, talent2, talent3] = mtpAnswers.talent || [];
      const [paradigme1, paradigme2, paradigme3] = mtpAnswers.paradigme || [];
      
      // Convert Application to ApplicationData
      const applicationData: ApplicationData = {
        // From Application
        id: application.id,
        created_at: application.created_at,
        status: application.status,
        gender: profile?.gender || '',
        cv: application.cv || null,
        certificates: application.certificates || [],
        recommendations: application.recommendations || [],
        metier1,
        metier2,
        metier3,
        talent1,
        talent2,
        talent3,
        paradigme1,
        paradigme2,
        paradigme3,
        
        // Additional/transformed fields
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        dateOfBirth: user?.date_of_birth ? new Date(user.date_of_birth) : null,
        currentPosition: profile?.current_position || '',
        coverLetter: application.cover_letter ? { name: 'Lettre de motivation', url: application.cover_letter } : null,
        integrityLetter: application.integrity_letter || null,
        projectIdea: application.project_idea || null,
        jobTitle,
        applicationDate: new Date(application.created_at).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };
      
      const doc = generateApplicationPdf(applicationData);
      
      // Save the PDF
      doc.save(`Candidature_${jobTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`h-8 w-8 p-0 ${className}`}>
          <span className="sr-only">Ouvrir le menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to={`/candidate/application/${application.id}`} className="flex items-center gap-2 w-full">
            <Eye className="h-4 w-4" />
            <span>Voir détails</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleExportPdf}
          disabled={isLoading}
          className="flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin">↻</span>
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Exporter en PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
