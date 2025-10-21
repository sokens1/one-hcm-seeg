import { useEffect, useState } from 'react';
import { Clock, X, Calendar, CalendarDays } from 'lucide-react';
import { JobOffer } from '@/hooks/useJobOffers';
import { Button } from '@/components/ui/button';

export function ApplicationDeadlineCounter({ jobOffers }: { jobOffers: JobOffer[] }) {
  // Périodes pour EXTERNES et INTERNES
  const [startDateExterne] = useState<Date>(new Date('2025-10-13T00:00:00'));
  const [endDateExterne] = useState<Date>(new Date('2025-11-21T23:59:59'));
  const [startDateInterne] = useState<Date>(new Date('2025-10-18T00:00:00'));
  const [endDateInterne] = useState<Date>(new Date('2025-10-26T23:59:59'));

  const [timeLeftExterne, setTimeLeftExterne] = useState<string>('');
  const [timeLeftInterne, setTimeLeftInterne] = useState<string>('');

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();
      
      // Calcul pour EXTERNES
      if (now < startDateExterne) {
        const diff = startDateExterne.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftExterne(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      } else if (now >= startDateExterne && now <= endDateExterne) {
        const diff = endDateExterne.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftExterne(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeftExterne("0j 00h 00m 00s");
      }

      // Calcul pour INTERNES
      if (now < startDateInterne) {
        const diff = startDateInterne.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftInterne(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      } else if (now >= startDateInterne && now <= endDateInterne) {
        const diff = endDateInterne.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftInterne(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeftInterne("0j 00h 00m 00s");
      }
    };

    // Mettre à jour immédiatement
    updateTimers();

    // Mettre à jour toutes les secondes
    const timer = setInterval(updateTimers, 1000);

    return () => clearInterval(timer);
  }, [startDateExterne, endDateExterne, startDateInterne, endDateInterne]);

  const [isVisible, setIsVisible] = useState(true);

  if (!timeLeftExterne || !isVisible) return null;

  const getStatusColor = () => {
    return 'border-[#631120]/50';
  };

  const getStatusIcon = () => {
    return <Clock className="w-5 h-5 text-yellow-400 animate-pulse mr-2" />;
  };

  const getStatusTitle = () => {
    return 'Candidatures ';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-auto max-w-sm">
      <div 
        className={`text-white p-5 rounded-xl shadow-2xl border backdrop-blur-sm ${getStatusColor()}`}
        style={{
          background: 'linear-gradient(135deg,rgba(128, 0, 0, 1) 0%,rgba(128, 0, 0, 1) 100%)'
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
          <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-sm space-y-2">
            {/* Candidatures EXTERNES */}
            <div>
              <div className="text-[11px] text-white/80 mb-1 font-medium">CANDIDATURES EXTERNES</div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-white/70" />
                  <span className="font-mono">13/10/2025</span>
                </div>
                <div className="text-white/60 mx-1.5">→</div>
                <div className="flex items-center">
                  <CalendarDays className="w-3.5 h-3.5 mr-1 text-white/70" />
                  <span className="font-mono">21/10/2025</span>
                </div>
              </div>
            </div>

            {/* Candidatures INTERNES */}
            <div>
              <div className="text-[11px] text-white/80 mb-1 font-medium">CANDIDATURES INTERNES</div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-white/70" />
                  <span className="font-mono">20/10/2025</span>
                </div>
                <div className="text-white/60 mx-1.5">→</div>
                <div className="flex items-center">
                  <CalendarDays className="w-3.5 h-3.5 mr-1 text-white/70" />
                  <span className="font-mono">26/10/2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compte à rebours */}
          <div className="bg-white/15 rounded-lg p-3 backdrop-blur-sm space-y-2">
            <div className="text-xs text-white/80 mb-2 font-medium">COMPTE À REBOURS</div>
            <div className="text-xs text-white/90 mb-2">Clôture des candidatures dans :</div>
            
            {/* Compte à rebours EXTERNES */}
            <div className="flex items-baseline gap-2">
              <div className="text-xs text-white/90 font-medium whitespace-nowrap">
                EXTERNES :
              </div>
              <div className="font-mono text-sm sm:text-base font-bold tracking-wider text-yellow-400">
                {timeLeftExterne}
              </div>
            </div>

            {/* Compte à rebours INTERNES */}
            <div className="flex items-baseline gap-2">
              <div className="text-xs text-white/90 font-medium whitespace-nowrap">
                INTERNES :
              </div>
              <div className="font-mono text-sm sm:text-base font-bold tracking-wider text-yellow-400">
                {timeLeftInterne}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


