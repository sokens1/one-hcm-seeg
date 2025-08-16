import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Home, Briefcase, User, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface CandidateLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function CandidateLayout({ children, showFooter = false }: CandidateLayoutProps) {
  const location = useLocation();

  const navItems = [
    { 
      path: "/candidate/dashboard", 
      label: "Tableau de bord", 
      icon: Home 
    },
    { 
      path: "/candidate/jobs", 
      label: "Offres d'emploi", 
      icon: Briefcase 
    },
    { 
      path: "/candidate/profile", 
      label: "Mon profil", 
      icon: User 
    },
    { 
      path: "/candidate/notifications", 
      label: "Notifications", 
      icon: Bell 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Sidebar Navigation */}
      <div className="flex">
        <aside className="w-64 bg-card border-r min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
}