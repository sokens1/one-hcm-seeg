import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RecruiterSidebar } from "./RecruiterSidebar";
import { Header } from "./Header";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

interface RecruiterLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function RecruiterLayout({ children, className = "" }: RecruiterLayoutProps) {
  const { signOut, isObserver } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }
      // Force une navigation complète pour éviter les problèmes de cache
      window.location.href = '/';
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur, rediriger vers la page d'accueil
      window.location.href = '/';
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <RecruiterSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 sm:h-14 flex items-center justify-between border-b bg-background px-2 sm:px-4">
            <div className="flex items-center min-w-0">
              <SidebarTrigger className="mr-2 sm:mr-4" />
              <h1 className="text-sm sm:text-lg font-semibold truncate">
                <span className="hidden sm:inline">{isObserver ? "Espace Observateur" : "Espace Recruteur"}</span>
                <span className="sm:hidden">{isObserver ? "Observateur" : "Recruteur"}</span>
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/recruiter/profile">
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Profil</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">Sortir</span>
              </Button>
            </div>
          </header>
          
          <main className={`flex-1 overflow-x-hidden ${className}`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}