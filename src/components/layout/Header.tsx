import { Button } from "@/components/ui/button";
import { LogOut, LogIn, UserPlus, Building2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, isRecruiter, isCandidate, isAdmin } = useAuth();
  const isAuthenticated = !!user;
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
    </>
  );
}