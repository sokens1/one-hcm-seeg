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
          {isAuthenticated ? (
            <>
              {isCandidate && (
                <span className="text-sm text-muted-foreground">
                  Bonjour {user.user_metadata?.first_name}
                </span>
              )}
              {(isRecruiter || isAdmin) && (
                <Link to="/recruiter/dashboard">
                  <Button variant="ghost" size="sm">Espace Recruteur</Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" />
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