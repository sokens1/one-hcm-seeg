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
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <RecruiterSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold">Espace Recruteur</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/recruiter/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Profil</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </header>
          
          <main className={`flex-1 ${className}`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}