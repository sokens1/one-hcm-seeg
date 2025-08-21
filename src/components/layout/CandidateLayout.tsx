import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { CandidateHeader } from "@/components/candidate/CandidateHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Briefcase, FileText, User, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useState, createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardMain } from "@/components/candidate/DashboardMain";
import { JobCatalog } from "@/components/candidate/JobCatalog";
import { CandidateApplications } from "@/components/candidate/CandidateApplications";
import { ApplicationTracking } from "@/components/candidate/ApplicationTracking";
import { CandidateProfile } from "@/components/candidate/CandidateProfile";
import { CandidateSettings } from "@/components/candidate/CandidateSettings";

type ViewType = "dashboard" | "jobs" | "applications" | "profile" | "settings" | "tracking";

interface CandidateLayoutContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const CandidateLayoutContext = createContext<CandidateLayoutContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCandidateLayout = () => {
  const context = useContext(CandidateLayoutContext);
  if (!context) {
    throw new Error("useCandidateLayout must be used within CandidateLayout");
  }
  return context;
};

const navigation = [
  { title: "Tableau de bord", view: "dashboard" as ViewType, icon: Home },
  { title: "Catalogue d'offres", view: "jobs" as ViewType, icon: Briefcase },
  { title: "Mes candidatures", view: "applications" as ViewType, icon: FileText },
  { title: "Paramètres", view: "settings" as ViewType, icon: Settings },
];

function CandidateSidebar() {
  const { state } = useSidebar();
  const { currentView, setCurrentView } = useCandidateLayout();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (view: ViewType) => {
    // Dedicated pages override the internal view state
    if (location.pathname.startsWith("/candidate/settings")) {
      return view === "settings";
    }
    if (location.pathname.startsWith("/candidate/profile")) {
      return view === "settings"; // legacy profile treated as settings
    }
    return currentView === view;
  };

  const getNavCls = (view: ViewType) =>
    isActive(view) ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const handleNavigation = (view: ViewType) => {
    // Settings is a dedicated page
    if (view === "settings") {
      navigate("/candidate/settings");
      return;
    }
    // For other views, use the internal view system
    setCurrentView(view);
    navigate("/candidate/dashboard");
  };

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Espace candidat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.view)}
                    className={getNavCls(item.view)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function CandidateMainContent() {
  const { currentView } = useCandidateLayout();

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardMain />;
      case "jobs":
        return <JobCatalog />;
      case "applications":
        return <CandidateApplications />;
      case "tracking":
        return <ApplicationTracking />;
      case "profile":
        return <CandidateProfile />;
      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent>
              <p>La page paramètres est en cours de développement et sera disponible prochainement.</p>
            </CardContent>
          </Card>
        );
      default:
        return <DashboardMain />;
    }
  };

  return <>{renderContent()}</>;
}

interface CandidateLayoutProps {
  children?: React.ReactNode;
}

export function CandidateLayout({ children }: CandidateLayoutProps) {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize view from query param if provided (e.g., /candidate/dashboard?view=jobs)
  // Keeps existing behavior when no param is present.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get("view") as ViewType | null;
    if (viewParam && ["dashboard","jobs","applications","profile","settings","tracking"].includes(viewParam)) {
      setCurrentView(viewParam);
    }
  }, [location.search]);


  return (
    <CandidateLayoutContext.Provider value={{ currentView, setCurrentView }}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Header avec SidebarTrigger */}
          <div className="flex flex-col w-full">
            <header className="h-16 flex items-center border-b bg-background">
              <SidebarTrigger className="ml-4" />
              <div className="flex-1">
                <CandidateHeader />
              </div>
            </header>

            <div className="flex flex-1">
              <CandidateSidebar />
              <main className="flex-1 p-6 bg-background">
                {children ? children : <CandidateMainContent />}
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </CandidateLayoutContext.Provider>
  );
}