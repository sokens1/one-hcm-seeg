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
import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, FileText, User, Settings } from "lucide-react";

const navigation = [
  { title: "Tableau de bord", url: "/candidate/dashboard", icon: Home },
  { title: "Catalogue d'offres", url: "/candidate/jobs", icon: Briefcase },
  { title: "Mes candidatures", url: "/candidate/applications", icon: FileText },
  { title: "Mon profil", url: "/candidate/profile", icon: User },
  { title: "Paramètres", url: "/candidate/settings", icon: Settings },
];

function CandidateSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

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
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
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

interface CandidateLayoutProps {
  children: React.ReactNode;
}

export function CandidateLayout({ children }: CandidateLayoutProps) {
  return (
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
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}