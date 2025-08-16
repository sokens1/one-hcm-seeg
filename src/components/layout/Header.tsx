import { Button } from "@/components/ui/button";
import { Users, Building2, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRecruiterAuth } from "@/hooks/useRecruiterAuth";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { useToast } from "@/components/ui/use-toast";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated: isRecruiterAuth, logout: recruiterLogout } = useRecruiterAuth();
  const { isAuthenticated: isCandidateAuth, user: candidateUser, logout: candidateLogout } = useCandidateAuth();
  const isRecruiterSide = location.pathname.startsWith('/recruiter');

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
                <>
                  <Link to="/">
                    <Button variant="candidate" size="sm">
                      Voir les Offres
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleRecruiterLogout} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </Button>
                </>
              )}
            </>
          ) : (
            // Interface candidat
            <>
              {isCandidateAuth ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Bonjour {candidateUser?.firstName}
                  </span>
                  <Link to="/candidate/dashboard">
                    <Button variant="outline" size="sm">
                      Mon Espace
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleCandidateLogout} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </Button>
                </>
              ) : (
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
              <Link to="/recruiter">
                <Button variant="recruiter" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  Espace Recruteur
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}