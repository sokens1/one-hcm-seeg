import { User, LogOut, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

export function CandidateHeader() {
  const { user, signOut: logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { status: profileStatus } = useProfileCompletion();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la déconnexion",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      // Force une navigation complète pour éviter les problèmes de cache
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-between px-2 sm:px-4">
      {/* Logo SEEG */}
      <div className="flex items-center">
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
          <img src="/logo-SEEG.png" alt="Logo SEEG" className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain" />
        </div>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {(unreadCount > 0 || !profileStatus.isComplete) && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                  {unreadCount + (!profileStatus.isComplete ? 1 : 0)}
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
                {/* Notification de profil incomplet */}
                {!profileStatus.isComplete && (
                  <div
                    className="p-2 rounded-lg mb-1 cursor-pointer transition-colors bg-orange-50 hover:bg-orange-100 border border-orange-200"
                    onClick={() => {
                      navigate('/candidate/settings');
                      setNotificationOpen(false);
                    }}
                  >
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-orange-500 mr-3 mt-1.5 flex-shrink-0" />
                      <div className="flex-grow">
                        <p className="font-semibold text-sm">Profil incomplet</p>
                        <p className="text-xs text-muted-foreground">{profileStatus.message}</p>
                        <p className="text-xs text-orange-600 mt-1">
                          Cliquez pour compléter ({profileStatus.completionPercentage}%)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications normales */}
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2 rounded-lg mb-1 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted'
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
                ) : !profileStatus.isComplete ? null : (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Aucune notification pour le moment.
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Profil utilisateur avec dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {(user?.user_metadata?.first_name || user?.email || 'Profil')} ▼
              </span>
              <span className="sm:hidden">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mr-2 sm:mr-4" align="end" sideOffset={5}>
            <div className="px-2 py-1.5 text-sm font-medium">Paramètres</div>
            {user?.email && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                {user.email}
              </div>
            )}
            {user?.user_metadata?.first_name && user?.user_metadata?.last_name && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {(user.user_metadata.first_name as string)} {(user.user_metadata.last_name as string)}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/candidate/settings')}>
              <User className="w-4 h-4 mr-2" />
              Informations personnelles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}