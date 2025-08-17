import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RecruiterSidebar } from "./RecruiterSidebar";
import { Header } from "./Header";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRecruiterAuth } from "@/hooks/useRecruiterAuth";
import { useNavigate } from "react-router-dom";

interface RecruiterLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function RecruiterLayout({ children, className = "" }: RecruiterLayoutProps) {
  const { logout } = useRecruiterAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
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
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </header>
          
          <main className={`flex-1 ${className}`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}