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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="w-19 h-19 rounded-lg overflow-hidden bg-white flex items-center justify-center">
            <img src="/LOGO HCM4.png" alt="Logo" className="w-20 h-35 object-contain" />
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
              {isRecruiter && (
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