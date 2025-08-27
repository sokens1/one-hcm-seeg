import { AlertCircle, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function ProfileCompletionBanner() {
  const { status, isLoading } = useProfileCompletion();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissed state when profile becomes incomplete again
  useEffect(() => {
    if (!status.isComplete) {
      setIsDismissed(false);
    }
  }, [status.isComplete]);

  if (isLoading || status.isComplete || isDismissed) {
    return null;
  }

  const getAlertVariant = () => {
    if (status.completionPercentage >= 80) return 'default';
    if (status.completionPercentage >= 50) return 'default';
    return 'destructive';
  };

  const getBorderColor = () => {
    if (status.completionPercentage >= 80) return 'border-yellow-200';
    if (status.completionPercentage >= 50) return 'border-orange-200';
    return 'border-red-200';
  };

  return (
    <Alert className={`mb-4 ${getBorderColor()} bg-gradient-to-r from-blue-50 to-indigo-50`} variant={getAlertVariant()}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-medium text-sm">
                Profil {status.completionPercentage}% complété
              </span>
              <Progress value={status.completionPercentage} className="flex-1 max-w-32" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {status.message}
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" className="h-8">
                <Link to="/candidate/settings">
                  <Settings className="w-3 h-3 mr-1" />
                  Compléter mon profil
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => setIsDismissed(true)}
              >
                Plus tard
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-transparent"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
