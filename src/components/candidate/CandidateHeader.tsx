import { Bell, User, LogOut, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function CandidateHeader() {
  const { user, logout } = useCandidateAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">SEEG</h1>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="w-4 h-4" />
          <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">3</Badge>
        </Button>

        {/* Profil utilisateur avec dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              {user?.firstName} ▼
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">Mon Profil</div>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {user?.email}
            </div>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Matricule: {user?.matricule || "N/A"}
            </div>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Poste: {user?.currentPosition || "N/A"}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Informations personnelles
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" />
              Mes documents
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