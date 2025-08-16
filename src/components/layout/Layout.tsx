import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
    </div>
  );
}