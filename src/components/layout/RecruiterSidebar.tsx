import { LayoutDashboard, Briefcase, Users, Settings, Brain, UserCheck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const menuItems = [
  {
    title: "Tableau de bord",
    url: "/recruiter",
    icon: LayoutDashboard,
  },
  {
    title: "Liste des candidatures",
    url: "/recruiter/candidates",
    icon: Users,
  },
  {
    title: "Demandes d'accès",
    url: "/recruiter/access-requests",
    icon: UserCheck,
    badge: true, // Afficher un badge pour les nouvelles demandes
  },
  //  {
  //   title: "Traitements IA",
  //   url: "/recruiter/traitements-ia",
  //   icon: Brain,
  //  },
  {
    title: "Postes à pourvoir",
    url: "/recruiter/jobs",
    icon: Briefcase,
  },
  {
    title: "Paramètres",
    url: "/recruiter/profile",
    icon: Settings,
  },
];

export function RecruiterSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isObserver } = useAuth();
  const currentPath = location.pathname;
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Récupérer le nombre de demandes en attente
  useEffect(() => {
    const fetchPendingRequests = async () => {
      const { count } = await supabase
        .from('access_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      setPendingRequestsCount(count || 0);
    };

    fetchPendingRequests();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('access_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'access_requests',
      }, () => {
        fetchPendingRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === "/recruiter") {
      return currentPath === "/recruiter";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-primary/10 text-primary font-medium" 
      : "hover:bg-muted/50";

  return (
    <Sidebar
      className={state === "collapsed" ? "w-12 sm:w-14" : "w-48 sm:w-56 lg:w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={`text-sm sm:text-base font-medium px-2 sm:px-3 ${state === "collapsed" ? "sr-only" : ""}`}>
            {isObserver ? "Observateur" : "Recruteur"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavCls(item.url)} text-xs sm:text-sm lg:text-base py-2 sm:py-3 relative`}
                      title={state === "collapsed" ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {state !== "collapsed" && (
                        <span className="ml-2 truncate">{item.title}</span>
                      )}
                      {item.badge && pendingRequestsCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {pendingRequestsCount}
                        </span>
                      )}
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