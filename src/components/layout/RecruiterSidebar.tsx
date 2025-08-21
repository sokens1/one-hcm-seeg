import { LayoutDashboard, Briefcase, Users, Settings } from "lucide-react";
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

const menuItems = [
  {
    title: "Tableau de bord",
    url: "/recruiter",
    icon: LayoutDashboard,
  },
  {
    title: "Listes des candidats",
    url: "/recruiter/candidates",
    icon: Users,
  },
  {
    title: "Poste à pourvoir",
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
  const currentPath = location.pathname;

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
            Recruteur
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavCls(item.url)} text-xs sm:text-sm lg:text-base py-2 sm:py-3`}
                      title={state === "collapsed" ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {state !== "collapsed" && (
                        <span className="ml-2 truncate">{item.title}</span>
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