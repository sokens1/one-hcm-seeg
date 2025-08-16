import { Button } from "@/components/ui/button";
import { Users, Building2, LogOut, Bell, User, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRecruiterAuth } from "@/hooks/useRecruiterAuth";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated: isRecruiterAuth, logout: recruiterLogout } = useRecruiterAuth();
  const { isAuthenticated: isCandidateAuth, user: candidateUser, logout: candidateLogout } = useCandidateAuth();
  const isRecruiterSide = location.pathname.startsWith('/recruiter');
  const isCandidateSide = location.pathname.startsWith('/candidate');

  const handleRecruiterLogout = () => {
    recruiterLogout();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate('/');
  };

  const handleCandidateLogout = () => {
    candidateLogout();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate('/');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">OneHCM</h1>
            <p className="text-xs text-muted-foreground">Talent Flow Gabon</p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {isRecruiterSide ? (
            // Interface recruteur
            <>
              {isRecruiterAuth && (
                <Button variant="outline" size="sm" onClick={handleRecruiterLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
              )}
            </>
          ) : isCandidateSide && isCandidateAuth ? (
            // Interface candidat connecté
            <>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {candidateUser?.firstName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/candidate/profile" className="flex items-center gap-2 w-full">
                      <Settings className="w-4 h-4" />
                      Gérer mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCandidateLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // Page d'accueil - utilisateurs non connectés
            <>
              <Link to="/candidate/login">
                <Button variant="outline" size="sm">
                  Se connecter
                </Button>
              </Link>
              <Link to="/candidate/signup">
                <Button variant="default" size="sm">
                  S'inscrire
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}