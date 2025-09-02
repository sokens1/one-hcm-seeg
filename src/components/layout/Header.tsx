import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, LogIn, UserPlus, Building2, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { isPreLaunch } from "@/utils/launchGate";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { diagnoseDatabaseAccess } from "@/utils/databaseDiagnostics";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isRecruiter, isCandidate, isAdmin, refreshUserRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isAuthenticated = !!user;
  const preLaunch = isPreLaunch();
  const [showMaintenanceBanner, setShowMaintenanceBanner] = useState(false);
  const [showClosedBanner, setShowClosedBanner] = useState(false);

  // Roles are handled in FR ('candidat', 'recruteur') by useAuth; keep helpers as source of truth

  const handleLogout = async () => {
    try {
      // Fermer tous les popovers/modals ouverts avant la déconnexion
      setNotificationOpen(false);
      
      // Petit délai pour permettre aux composants de se fermer proprement
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { error } = await signOut();
      if (error) {
        toast.error("Erreur lors de la déconnexion");
        return;
      }
      toast.info("Déconnexion réussie. À bientôt !");
      
      // Délai supplémentaire pour permettre au toast de s'afficher
      setTimeout(() => {
        // Force une navigation complète pour éviter les problèmes de cache
        window.location.href = '/';
      }, 500);
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleRefreshRole = async () => {
    try {
      await refreshUserRole();
      toast.success("Rôle mis à jour !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const handleDiagnoseDatabase = async () => {
    try {
      const results = await diagnoseDatabaseAccess();
      console.log('Diagnostic results:', results);
      
      if (results.errors.length > 0) {
        toast.error(`Diagnostic: ${results.errors.length} erreur(s) détectée(s)`);
        console.error('Database diagnostic errors:', results.errors);
      } else {
        toast.success("Diagnostic: Base de données accessible");
      }
    } catch (error) {
      toast.error("Erreur lors du diagnostic");
      console.error('Diagnostic failed:', error);
    }
  };

  const handleGoToOffers = () => {
    if (location.pathname === '/') {
      document.getElementById('job-list')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      // Best effort scroll after navigation on next tick
      setTimeout(() => document.getElementById('job-list')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Vérifier si nous sommes dans la plage de maintenance (18h00 à 00h40)
    const isMaintenanceTime = 
      (currentHour === 18 && currentMinutes >= 0) ||  // À partir de 18h00
      (currentHour > 18 && currentHour < 24) ||       // Entre 19h et 23h59
      (currentHour === 0 && currentMinutes <= 40);    // Jusqu'à 00h40

    if (isMaintenanceTime) { 
      setShowMaintenanceBanner(true);
      setShowClosedBanner(false);
    } else {
      setShowMaintenanceBanner(false);
      setShowClosedBanner(true);
    }
  }, []);

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {showMaintenanceBanner ? (
          <div className="bg-red-700 text-yellow-400 text-center mb-2">
            <div className="bg-white/10 py-2 px-4">
              <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <span className="font-bold whitespace-nowrap">MISE À JOUR :</span>
                  <span className="text-white text-sm sm:text-base">Une indisponibilité du site est prévue de 00h00 à 00h40</span>
                </div>
              </div>
            </div>
          </div>
        ) : showClosedBanner && (
          <div className="bg-red-700 text-yellow-400 text-center mb-2">
            <div className="bg-white/10 py-2 px-4">
              <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <span className="font-bold whitespace-nowrap">APPEL À CANDIDATURE CLÔTURÉ :</span>
                  <span className="text-white text-sm sm:text-base">La période de dépôt des candidatures est terminée. Merci pour votre intérêt.</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="container mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <img src="/LOGO HCM4.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {isAuthenticated ? (
              <>
                {isCandidate && (
                  <span className="hidden md:block text-xs sm:text-sm text-muted-foreground truncate max-w-32">
                    Bonjour {user.user_metadata?.first_name}
                  </span>
                )}
                {isRecruiter && (
                  <Link to="/recruiter/dashboard" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                      Espace Recruteurs
                    </Button>
                  </Link>
                )}
                <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="p-2">
                      <div className="flex justify-between items-center mb-4 px-2">
                        <h4 className="font-medium">Notifications</h4>
                        {unreadCount > 0 && (
                          <Button variant="link" size="sm" onClick={() => markAllAsRead()}>
                            Tout marquer comme lu
                          </Button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-2 rounded-lg mb-1 cursor-pointer transition-colors ${!notif.read ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted'
                                }`}
                              onClick={() => {
                                if (!notif.read) {
                                  markAsRead(notif.id);
                                }
                                if (notif.link) {
                                  navigate(notif.link);
                                  setNotificationOpen(false);
                                }
                              }}
                            >
                              <div className="flex items-start">
                                {!notif.read && <div className="h-2 w-2 rounded-full bg-primary mr-3 mt-1.5 flex-shrink-0" />}
                                <div className="flex-grow">
                                  <p className="font-semibold text-sm">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            Aucune notification pour le moment.
                          </p>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshRole} 
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                  title="Rafraîchir le rôle utilisateur"
                >
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Actualiser</span>
                  <span className="sm:hidden">Actualiser</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleDiagnoseDatabase} className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Diagnostic</span>
                  <span className="sm:hidden">Diag</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                  <span className="sm:hidden">Sortir</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Se connecter</span>
                    <span className="sm:hidden">Connexion</span>
                  </Button>
                </Link>
                <Link
                  to="/auth"
                  onClick={(e) => {
                    if (preLaunch) {
                      e.preventDefault();
                      toast.info("Les inscriptions seront disponibles à partir du lundi 25 août 2025.");
                    }
                  }}
                  aria-disabled={preLaunch}
                  className={preLaunch ? "pointer-events-auto" : undefined}
                  title={preLaunch ? "Inscriptions indisponibles jusqu'au 25 août 2025" : undefined}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className={`gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 ${preLaunch ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">S'inscrire</span>
                    <span className="sm:hidden">Inscription</span>
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}