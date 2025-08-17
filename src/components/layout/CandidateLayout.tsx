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
import { useLocation } from "react-router-dom";
import { Home, Briefcase, FileText, User, Settings } from "lucide-react";
import { useState, createContext, useContext } from "react";
import { DashboardMain } from "@/components/candidate/DashboardMain";
import { JobCatalog } from "@/components/candidate/JobCatalog";

type ViewType = "dashboard" | "jobs" | "applications" | "profile" | "settings";

interface CandidateLayoutContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const CandidateLayoutContext = createContext<CandidateLayoutContextType | undefined>(undefined);

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
  { title: "Mon profil", view: "profile" as ViewType, icon: User },
  { title: "Paramètres", view: "settings" as ViewType, icon: Settings },
];

function CandidateSidebar() {
  const { state } = useSidebar();
  const { currentView, setCurrentView } = useCandidateLayout();

  const isActive = (view: ViewType) => currentView === view;
  const getNavCls = (view: ViewType) =>
    isActive(view) ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => setCurrentView(item.view)}
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
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Mes candidatures</h2>
              <p className="text-lg text-muted-foreground">
                Suivi détaillé de toutes vos candidatures
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">Contenu des candidatures à venir</p>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Mon profil</h2>
              <p className="text-lg text-muted-foreground">
                Gérez vos informations personnelles
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">Gestion du profil à venir</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Paramètres</h2>
              <p className="text-lg text-muted-foreground">
                Configurez vos préférences
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">Paramètres à venir</p>
            </div>
          </div>
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