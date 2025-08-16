import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // OneHCM Custom variants
        hero: "bg-gradient-hero text-primary-foreground hover:shadow-glow transition-all duration-300 hover:scale-105",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-soft hover:shadow-medium",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-soft",
        ocean: "bg-ocean text-ocean-foreground hover:bg-ocean/90 shadow-soft hover:shadow-medium",
        gradient: "bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300",
        recruiter: "bg-primary-dark text-primary-foreground hover:bg-primary shadow-medium hover:shadow-strong",
        candidate: "bg-gradient-warm text-secondary-foreground hover:shadow-glow transition-all duration-300"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)