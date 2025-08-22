import { useEffect, useState } from 'react';
import { Clock, X, Calendar, CalendarDays } from 'lucide-react';
import { JobOffer } from '@/hooks/useJobOffers';
import { Button } from '@/components/ui/button';

export function ApplicationDeadlineCounter({ jobOffers }: { jobOffers: JobOffer[] }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [endDate] = useState<Date>(new Date('2025-08-31'));

  // Toujours en mode "during" - compte à rebours jusqu'au 31 août

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("Les candidatures sont closes");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`);
    };

    // Mettre à jour immédiatement
    updateTimer();

    // Mettre à jour toutes les secondes
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const [isVisible, setIsVisible] = useState(true);

  if (!timeLeft || !isVisible) return null;

  const getStatusColor = () => {
    return 'border-[#631120]/50';
  };

  const getStatusIcon = () => {
    return <Clock className="w-5 h-5 mr-2 text-red-200 animate-pulse" />;
  };

  const getStatusTitle = () => {
    return 'Candidatures ouvertes';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-auto max-w-sm">
      <div 
        className={`text-white p-5 rounded-xl shadow-2xl border backdrop-blur-sm ${getStatusColor()}`}
        style={{
          background: 'linear-gradient(135deg,rgb(146, 31, 52) 0%,rgb(229, 15, 58) 100%)'
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="font-bold text-sm">{getStatusTitle()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {/* Période de candidatures */}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-white/80 mb-2 font-medium">PÉRIODE DE CANDIDATURES</div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-white/70" />
                <span className="font-mono">25/08/2025</span>
              </div>
              <div className="text-white/60 mx-2">→</div>
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5 text-white/70" />
                <span className="font-mono">31/08/2025</span>
              </div>
            </div>
          </div>

          {/* Compte à rebours */}
          <div className="bg-white/15 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-white/80 mb-2 font-medium">COMPTE À REBOURS</div>
            <div className="font-mono text-lg font-bold text-center tracking-wider">
              {timeLeft.split(': ')[1] || timeLeft}
            </div>
            {status !== 'after' && (
              <div className="text-xs text-white/70 text-center mt-1">
                {timeLeft.split(': ')[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
