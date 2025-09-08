import React from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { BarChart3, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DashboardToggleProps {
  currentView: 'classic' | 'advanced';
  onToggle: (view: 'classic' | 'advanced') => void;
}

export function DashboardToggle({ currentView, onToggle }: DashboardToggleProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdvancedClick = () => {
    // Rediriger vers la page Traitement IA
    // Déterminer le rôle de l'utilisateur basé sur l'URL actuelle
    const currentPath = window.location.pathname;
    if (currentPath.includes('/observer/')) {
      navigate('/observer/traitements-ia');
    } else {
      navigate('/recruiter/traitements-ia');
    }
  };

  return (
    <Card className="shadow-soft mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Vue du Dashboard</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={currentView === 'classic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToggle('classic')}
              className="gap-2"
            >
              <LayoutDashboard className="w-3 h-3" />
              Classique
            </Button>
            
            <Button
              variant={currentView === 'advanced' ? 'default' : 'outline'}
              size="sm"
              onClick={handleAdvancedClick}
              className="gap-2"
            >
              <BarChart3 className="w-3 h-3" />
              Avancé (IA)
            </Button>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          {currentView === 'classic' 
            ? 'Vue classique avec métriques de base et gestion des offres'
            : 'Vue avancée avec graphiques interactifs et analyses détaillées'
          }
        </div>
      </CardContent>
    </Card>
  );
}
