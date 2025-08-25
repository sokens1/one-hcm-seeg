import { useState } from 'react';
import { MoreVertical, FileText, Download, Eye, Loader2 } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`w-full justify-between gap-1 md:gap-2 text-xs sm:text-sm md:text-sm h-8 md:h-9 ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(true);
          }}
        >
          <span className="flex items-center gap-1 flex-1 justify-center md:justify-start">
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Télécharger</span>
            <span className="md:hidden">Télécharger</span>
          </span>
          <svg 
            className="w-4 h-4 text-muted-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleExportPdf();
          }} 
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          <span>Exporter en PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
