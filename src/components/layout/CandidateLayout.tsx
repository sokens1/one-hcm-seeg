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
  { title: "Mon profil", view: "profile" as ViewType, icon: User },
  // { title: "Paramètres", view: "settings" as ViewType, icon: Settings }, // Masqué pour développement ultérieur
];

function CandidateSidebar() {
  const { state } = useSidebar();
  const { currentView, setCurrentView } = useCandidateLayout();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (view: ViewType) => {
    // Check if we're on a specific route that matches the view
    if (view === "profile" && location.pathname === "/candidate/profile") return true;
    return currentView === view;
  };
  
  const getNavCls = (view: ViewType) =>
    isActive(view) ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const handleNavigation = (view: ViewType) => {
    // For profile and settings, navigate to dedicated pages
    if (view === "profile") {
      navigate("/candidate/profile");
    } else {
      // For other views, use the internal view system
      setCurrentView(view);
      navigate("/candidate/dashboard");
    }
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
  const [promptedProfile, setPromptedProfile] = useState(false);

  // Initialize view from query param if provided (e.g., /candidate/dashboard?view=jobs)
  // Keeps existing behavior when no param is present.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get("view") as ViewType | null;
    if (viewParam && ["dashboard","jobs","applications","profile","settings","tracking"].includes(viewParam)) {
      setCurrentView(viewParam);
    }
  }, [location.search]);

  // Notification pour inciter à compléter le profil après connexion/inscription
  useEffect(() => {
    if (!user || promptedProfile) return;
    const run = async () => {
      const meta = (user as unknown as { user_metadata?: Record<string, unknown> })?.user_metadata || {};
      const firstName = (meta as Record<string, unknown>)["first_name"];
      const lastName = (meta as Record<string, unknown>)["last_name"];
      const currentPosition = (meta as Record<string, unknown>)["current_position"];
      const isIncomplete = !firstName || !lastName || !currentPosition;
      if (!isIncomplete) return;

      const title = "Complétez votre profil";
      // Vérifier s'il existe déjà une notification non lue de ce type
      const { data: existing, error: fetchErr } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', title)
        .eq('read', false)
        .limit(1);
      if (fetchErr) {
        console.warn('Notifications fetch error:', fetchErr.message);
      }

      if (!existing || existing.length === 0) {
        // Créer la notification
        const { error: insertErr } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title,
            message: "Bienvenue ! Pour optimiser vos candidatures, veuillez compléter vos informations dans la page Mon profil.",
            read: false,
            link: '/candidate/profile',
          });
        if (insertErr) {
          console.warn('Notification insert error:', insertErr.message);
        } else {
          toast({
            title,
            description: "Bienvenue ! Pour optimiser vos candidatures, veuillez compléter vos informations dans la page Mon profil.",
            duration: 6000,
          });
          setPromptedProfile(true);
        }
      } else {
        // Une notification non lue existe déjà; ne pas dupliquer ni toaster
        setPromptedProfile(true);
      }
    };
    void run();
  }, [user, promptedProfile, toast]);

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