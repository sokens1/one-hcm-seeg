import { useEffect, useState } from 'react';
import { MAINTENANCE_MESSAGE } from '@/config/maintenance';
import '../index.css';

const Maintenance = () => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        // Calculer le temps restant jusqu'à 00:40
        const calculateTimeLeft = () => {
            const now = new Date();
            const startTime = new Date();
            const endTime = new Date();
            
            // Définir l'heure de début à minuit (00:00)
            startTime.setHours(0, 0, 0, 0);
            
            // Définir l'heure de fin à 00:40
            endTime.setHours(0, 40, 0, 0);
            
            // Si nous sommes avant minuit, on part de minuit du jour même
            if (now < startTime) {
                // Si on est avant minuit, on attend minuit
                return Math.floor((startTime.getTime() - now.getTime()) / 1000);
            } 
            // Si nous sommes entre minuit et 00:40, on affiche le temps restant
            else if (now < endTime) {
                return Math.floor((endTime.getTime() - now.getTime()) / 1000);
            }
            // Si nous sommes après 00:40, on affiche 0
            return 0;
        };

        // Mettre à jour le temps restant immédiatement
        setTimeLeft(calculateTimeLeft());

        // Mettre à jour le temps restant toutes les secondes
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            
            // Si le temps est écoulé, on arrête le timer
            if (newTimeLeft <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        // Nettoyer l'intervalle lors du démontage du composant
        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8 md:p-10">
                    <div className="text-center space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Maintenance en cours</h1>
                            <p className="text-gray-600">
                                {MAINTENANCE_MESSAGE}
                            </p>
                        </div>

                        {timeLeft > 0 && (
                            <div className="py-2 sm:py-4">
                                <div className="inline-block bg-gray-50 rounded-lg px-6 py-3 sm:px-8 sm:py-4">
                                    <div className="text-4xl sm:text-5xl font-mono font-bold text-blue-600">
                                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <p className="text-sm text-gray-500">
                                Merci de votre patience. Nous serons de retour très bientôt.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;