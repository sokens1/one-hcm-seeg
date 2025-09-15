import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  Eye,
  LogOut,
  User,
  Brain
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ObserverLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: "Tableau de Bord",
    href: "/observer/dashboard",
    icon: BarChart3,
    description: "Vue d'ensemble des statistiques"
  },
  {
    name: "Candidats",
    href: "/observer/candidates",
    icon: Users,
    description: "Liste des candidats"
  },
  {
    name: "Traitements IA",
    href: "/observer/traitements-ia",
    icon: Brain,
    description: "Gestion IA des candidatures"
  },
  {
    name: "Espace Candidature",
    href: "/jobs",
    icon: Eye,
    description: "Voir les offres publiques"
  }
];

export function ObserverLayout({ children }: ObserverLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex h-full flex-col">
          {/* Logo et titre */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Talent Flow</h1>
                <p className="text-xs text-muted-foreground">Mode Observateur</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Profil utilisateur */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email || "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground">Observateur</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Indicateur de mode observateur flottant */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Mode Observateur</span>
        </div>
      </div>
    </div>
  );
}
