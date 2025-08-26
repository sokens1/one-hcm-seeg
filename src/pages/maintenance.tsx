// src/pages/maintenance.tsx
import { useEffect, useState } from 'react';

export default function Maintenance() {
    const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes en secondes

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prevTime => Math.max(0, prevTime - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8 md:p-10">
                        <div className="text-center space-y-4 sm:space-y-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 text-blue-600">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                                🚧 Maintenance en cours
                            </h1>

                            <p className="text-gray-600 text-sm sm:text-base">
                                Notre site est actuellement en cours de mise à jour pour vous offrir une meilleure expérience.
                                Nous serons de retour dans :
                            </p>

                            <div className="py-2 sm:py-4">
                                <div className="inline-block bg-gray-50 rounded-lg px-6 py-3 sm:px-8 sm:py-4">
                                    <div className="text-4xl sm:text-5xl font-mono font-bold text-blue-600">
                                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-500">
                                Nous nous excusons pour la gêne occasionnée. Merci de votre patience.
                            </p>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400">
                                    Si vous avez besoin d'assistance, veuillez nous contacter à contact@votresite.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}