import { Button } from "@/components/ui/button";
import { Users, Building2, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRecruiterAuth } from "@/hooks/useRecruiterAuth";
import { useToast } from "@/components/ui/use-toast";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, logout } = useRecruiterAuth();
  const isRecruiterSide = location.pathname.startsWith('/recruiter');

  const handleLogout = () => {
    logout();
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
          {!isRecruiterSide && (
            <Link to="/recruiter">
              <Button variant="recruiter" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Espace Recruteur
              </Button>
            </Link>
          )}
          
          {isRecruiterSide && isAuthenticated && (
            <>
              <Link to="/">
                <Button variant="candidate" size="sm">
                  Voir les Offres
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}