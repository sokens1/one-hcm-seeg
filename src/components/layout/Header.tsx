import { Button } from "@/components/ui/button";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const isAuthenticated = !!user;
  const isRecruiter = user?.user_metadata?.role === 'recruiter';
  const isCandidate = user?.user_metadata?.role === 'candidate';

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate('/');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-19 lg:h-19 rounded-lg overflow-hidden bg-white flex items-center justify-center">
            <img src="/LOGO HCM4.png" alt="Logo" className="w-14 h-12 sm:w-16 sm:h-14 lg:w-20 lg:h-35 object-contain" />
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
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
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
  );
}