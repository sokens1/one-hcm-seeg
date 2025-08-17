import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
import { 
  Home, 
  Briefcase, 
  FileText, 
  User,
  Bell,
  Settings
} from "lucide-react";

interface CandidateLayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

const sidebarItems = [
  { title: "Tableau de bord", url: "/candidate/dashboard", icon: Home },
  { title: "Catalogue des offres", url: "/candidate/jobs", icon: Briefcase },
  { title: "Mes candidatures", url: "/candidate/applications", icon: FileText },
  { title: "Mon profil", url: "/candidate/profile", icon: User },
  { title: "Paramètres", url: "/candidate/settings", icon: Settings },
];

function CandidateSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
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

export function CandidateLayout({ children, user, onLogout }: CandidateLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Global header with trigger */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="flex items-center h-16 px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1">
              <CandidateHeader user={user} onLogout={onLogout} />
            </div>
          </div>
        </header>

        <CandidateSidebar />
        
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}