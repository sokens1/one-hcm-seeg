import { User, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Notifications UI masqué pour le moment

import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
// import { useNotifications } from "@/hooks/useNotifications";

export function CandidateHeader() {
  const { user, signOut: logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Notifications désactivées pour le moment

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/");
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
        {/* Notifications masquées pour le moment */}

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