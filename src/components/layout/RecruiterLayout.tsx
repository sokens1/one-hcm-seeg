import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RecruiterSidebar } from "./RecruiterSidebar";
import { Header } from "./Header";

interface RecruiterLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function RecruiterLayout({ children, className = "" }: RecruiterLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <RecruiterSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold">Espace Recruteur</h1>
          </header>
          
          <main className={`flex-1 ${className}`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}