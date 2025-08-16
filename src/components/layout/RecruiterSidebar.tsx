import { LayoutDashboard, Briefcase, Users, Workflow } from "lucide-react";
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
    title: "Offres",
    url: "/recruiter/jobs",
    icon: Briefcase,
  },
  {
    title: "Liste des Candidats",
    url: "/recruiter/candidates",
    icon: Users,
  },
  {
    title: "Vue d'ensemble Pipeline",
    url: "/recruiter/pipeline",
    icon: Workflow,
  },
  {
    title: "Tunnel de recrutement",
    url: "/recruiter/tunnel",
    icon: Workflow,
  },
];

export function RecruiterSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar.state === "collapsed";
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
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-4">
            {!collapsed && "Recruteur"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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