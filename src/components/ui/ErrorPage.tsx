import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wifi, RefreshCw, Monitor, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface ErrorPageProps {
  type?: 'connection' | 'refresh' | 'browser' | 'generic';
  title?: string;
  message?: string;
  showRetryButton?: boolean;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
}

const errorConfigs = {
  connection: {
    icon: Wifi,
    title: "Problème de Connexion",
    message: "Il semble que vous ayez des difficultés à vous connecter à nos serveurs. Vérifiez votre connexion internet et réessayez.",
    suggestions: [
      "Vérifiez votre connexion internet",
      "Assurez-vous que votre réseau est stable",
      "Essayez de vous reconnecter dans quelques instants"
    ],
    primaryAction: "Réessayer",
    secondaryAction: "Actualiser la page"
  },
  refresh: {
    icon: RefreshCw,
    title: "Page Obsolète",
    message: "Cette page semble être obsolète ou a expiré. Une actualisation devrait résoudre le problème.",
    suggestions: [
      "Actualisez la page avec F5 ou Ctrl+R",
      "Videz le cache de votre navigateur",
      "Fermez et rouvrez l'onglet"
    ],
    primaryAction: "Actualiser",
    secondaryAction: "Retour"
  },
  browser: {
    icon: Monitor,
    title: "Navigateur Non Compatible",
    message: "Votre navigateur actuel n'est pas compatible avec notre application. Veuillez utiliser un navigateur plus récent.",
    suggestions: [
      "Utilisez Chrome, Firefox, Safari ou Edge",
      "Mettez à jour votre navigateur",
      "Activez JavaScript dans votre navigateur"
    ],
    primaryAction: "Changer de navigateur",
    secondaryAction: "Retour"
  },
  generic: {
    icon: AlertTriangle,
    title: "Une Erreur s'est Produite",
    message: "Nous rencontrons actuellement un problème technique. Notre équipe a été notifiée et travaille à la résolution.",
    suggestions: [
      "Réessayez dans quelques minutes",
      "Contactez le support si le problème persiste",
      "Vérifiez votre connexion internet"
    ],
    primaryAction: "Réessayer",
    secondaryAction: "Retour"
  }
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  type = 'generic',
  title,
  message,
  showRetryButton = true,
  showHomeButton = true,
  showBackButton = true,
  onRetry,
  onGoHome,
  onGoBack
}) => {
  const navigate = useNavigate();
  const config = errorConfigs[type];
  const IconComponent = config.icon;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (type === 'refresh') {
      window.location.reload();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo et Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <div className="text-white text-2xl font-bold">TS</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Talent Source</h1>
          <p className="text-gray-600">Système de Gestion des Talents</p>
        </div>

        {/* Carte d'erreur principale */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <IconComponent className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {title || config.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Message principal */}
            <div className="text-center">
              <p className="text-gray-600 text-lg leading-relaxed">
                {message || config.message}
              </p>
            </div>

            {/* Suggestions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Suggestions :</h3>
              <ul className="space-y-2">
                {config.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-800">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showRetryButton && (
                <Button 
                  onClick={handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {config.primaryAction}
                </Button>
              )}
              
              {showBackButton && (
                <Button 
                  onClick={handleGoBack}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {config.secondaryAction}
                </Button>
              )}
              
              {showHomeButton && (
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Button>
              )}
            </div>

            {/* Code d'erreur (optionnel) */}
            {type === 'generic' && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Code d'erreur : {Date.now().toString(36).toUpperCase()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Si le problème persiste, contactez notre support technique
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2025 Talent Source - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant pour les erreurs de connexion
export const ConnectionErrorPage: React.FC<Omit<ErrorPageProps, 'type'>> = (props) => (
  <ErrorPage {...props} type="connection" />
);

// Composant pour les erreurs de rafraîchissement
export const RefreshErrorPage: React.FC<Omit<ErrorPageProps, 'type'>> = (props) => (
  <ErrorPage {...props} type="refresh" />
);

// Composant pour les erreurs de navigateur
export const BrowserErrorPage: React.FC<Omit<ErrorPageProps, 'type'>> = (props) => (
  <ErrorPage {...props} type="browser" />
);

// Composant pour les erreurs génériques
export const GenericErrorPage: React.FC<Omit<ErrorPageProps, 'type'>> = (props) => (
  <ErrorPage {...props} type="generic" />
);
