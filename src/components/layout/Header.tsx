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

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isRecruiter, isCandidate, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isAuthenticated = !!user;
  const preLaunch = isPreLaunch();
  const [showMaintenanceBanner, setShowMaintenanceBanner] = useState(false);

  // Roles are handled in FR ('candidat', 'recruteur') by useAuth; keep helpers as source of truth

  const handleLogout = async () => {
    await signOut();
    toast.info("Déconnexion réussie. À bientôt !");
    navigate('/');
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
    // Vérifier si nous sommes dans la plage de maintenance
    const now = new Date();
    const maintenanceStart = new Date();
    maintenanceStart.setHours(18, 0, 0); // 19h56
    const maintenanceEnd = new Date();
    maintenanceEnd.setHours(24, 40, 0); // 24h40

    if (now >= maintenanceStart && now <= maintenanceEnd) { 
      setShowMaintenanceBanner(true);
    }
  }, []);

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {showMaintenanceBanner && (
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