import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { JobOffer } from '@/hooks/useJobOffers';
import { Button } from '@/components/ui/button';

export function ApplicationDeadlineCounter({ jobOffers }: { jobOffers: JobOffer[] }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  useEffect(() => {
    // Trouver la date de fin la plus éloignée parmi les offres
    const deadlines = jobOffers
      .map(job => job.date_limite || job.application_deadline)
      .filter(Boolean)
      .map(dateStr => new Date(dateStr).getTime());

    if (deadlines.length > 0) {
      const latestDeadline = new Date(Math.max(...deadlines));
      setTargetDate(latestDeadline);
    }
  }, [jobOffers]);

  useEffect(() => {
    if (!targetDate) return;

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

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
  }, [targetDate]);

  const [isVisible, setIsVisible] = useState(true);

  if (!timeLeft || !targetDate || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-auto max-w-md">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-xl border border-blue-500/30">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-300" />
            <span className="font-semibold">Date limite des candidatures</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="text-sm text-white/90">Date : </span>
            <span className="ml-2 font-mono text-sm bg-white/10 px-2 py-0.5 rounded">
              {targetDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-white/90">Temps restant :</span>
            <span className="ml-2 font-mono text-sm bg-white/10 px-2 py-0.5 rounded text-yellow-300">
              {timeLeft}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
