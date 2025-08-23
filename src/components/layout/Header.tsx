import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, LogIn, UserPlus, Building2, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/components/ui/use-toast";
import { isPreLaunch } from "@/utils/launchGate";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, isRecruiter, isCandidate, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isAuthenticated = !!user;
  const preLaunch = isPreLaunch();

  // Roles are handled in FR ('candidat', 'recruteur') by useAuth; keep helpers as source of truth

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
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

  return (
    <>
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    Espace Recruteur
                  </Button>
                </Link>
              )}
              
              {/* Notification Bell */}
              <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative p-2">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAllAsRead()}
                          className="text-xs"
                        >
                          Tout marquer comme lu
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                          onClick={() => {
                            if (!notification.read) markAsRead(notification.id);
                            if (notification.link) navigate(notification.link);
                            setNotificationOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{notification.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucune notification</p>
                      </div>
                    )}
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
                    toast({
                      title: "Information",
                      description: "Les inscriptions seront disponibles à partir du lundi 25 août 2025.",
                    });
                  }
                }}
              >
                <Button variant="default" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 cursor-pointer">
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