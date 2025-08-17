import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, User, FileText, LogOut, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CandidateHeaderProps {
  user: any;
  onLogout: () => void;
  showTrigger?: boolean;
}

export function CandidateHeader({ user, onLogout, showTrigger = true }: CandidateHeaderProps) {
  return (
    <header className="bg-card shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo SEEG */}
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SEEG</h1>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="outline" size="sm" className="gap-2 relative">
              <Bell className="w-4 h-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                2
              </Badge>
            </Button>

            {/* Profil utilisateur avec dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  {user?.firstName} {user?.lastName}
                  <span className="text-muted-foreground">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end">
                <div className="px-3 py-2">
                  <p className="font-medium">Mon Profil</p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p><strong>Nom:</strong> {user?.firstName} {user?.lastName}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    {user?.matricule && <p><strong>Matricule:</strong> {user.matricule}</p>}
                    {user?.currentPosition && <p><strong>Poste actuel:</strong> {user.currentPosition}</p>}
                  </div>
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
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}