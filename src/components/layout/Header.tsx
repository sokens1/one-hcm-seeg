import { Button } from "@/components/ui/button";
import { Building2, LogOut, LogIn, UserPlus } from "lucide-react";
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
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] bg-primary text-white px-3 py-2 rounded">
        Aller au contenu principal
      </a>
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">OneHCM</h1>
            <p className="hidden sm:block text-xs text-muted-foreground">Talent Flow Gabon</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" className="hidden xs:inline-flex" onClick={handleGoToOffers}>
            Offres
          </Button>
          {isAuthenticated ? (
            <>
              {isCandidate && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Bonjour {user.user_metadata?.first_name}
                </span>
              )}
              {(isRecruiter || isAdmin) && (
                <Link to="/recruiter/dashboard">
                  <Button variant="ghost" size="sm">Espace Recruteur</Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 px-3">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2 px-3">
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2 px-3">
                  <UserPlus className="w-4 h-4" />
                  S'inscrire
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