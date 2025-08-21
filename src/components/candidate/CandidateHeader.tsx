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
    <div className="flex items-center justify-between px-4">
      {/* Logo SEEG */}
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
          <img src="/logo-SEEG.png" alt="Logo SEEG" className="w-10 h-10 object-contain" />
        </div>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-4">
        {/* Notifications masquées pour le moment */}

        {/* Profil utilisateur avec dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              {(user?.user_metadata?.first_name || user?.email || 'Profil')} ▼
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">Paramètres</div>
            {user?.email && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
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