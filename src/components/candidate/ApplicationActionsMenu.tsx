import { useState } from 'react';
import { MoreVertical, FileText, Download, Eye, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { Application } from '@/types/application';
import { exportApplicationPdf } from '@/utils/exportPdfUtils';
import { Link } from 'react-router-dom';

interface ApplicationActionsMenuProps {
  application: Application;
  jobTitle: string;
  className?: string;
  variant?: 'button' | 'menu-item';
}

export function ApplicationActionsMenu({ application, jobTitle, className = '', variant = 'button' }: ApplicationActionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsLoading(true);
      await exportApplicationPdf(application, jobTitle);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'menu-item') {
    return (
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
    );
  }

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
