import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
}

export function Layout({ children, className = "", showFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main id="main" tabIndex={-1} className={`flex-1 ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}