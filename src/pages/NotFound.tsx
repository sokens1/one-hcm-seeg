import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3 sm:px-4">
      <div className="text-center space-y-4 sm:space-y-6">
        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold text-gray-800">404</h1>
        <div className="space-y-2 sm:space-y-3">
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-medium">Oops! Page introuvable</p>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <div className="pt-4">
          <a 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm sm:text-base"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
