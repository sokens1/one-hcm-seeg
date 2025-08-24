import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

export function Spinner({ 
  size = "md", 
  className, 
  text,
  fullScreen = false 
}: SpinnerProps) {
  const spinner = (
    <div className={cn(
      "flex items-center justify-center gap-2",
      fullScreen && "min-h-screen",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-primary",
        sizeClasses[size]
      )} />
      {text && (
        <span className="text-muted-foreground text-sm">
          {text}
        </span>
      )}
    </div>
  );

  return spinner;
}

// Composant pour les états de chargement pleine page
export function FullPageSpinner({ text = "Chargement..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" text={text} />
    </div>
  );
}

// Composant pour les états de chargement de contenu
export function ContentSpinner({ text = "Chargement..." }: { text?: string }) {
  return (
    <div className="flex justify-center items-center py-12">
      <Spinner size="lg" text={text} />
    </div>
  );
}