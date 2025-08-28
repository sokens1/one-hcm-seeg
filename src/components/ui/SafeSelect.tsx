import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Safe wrapper pour éviter les erreurs DOM removeChild
const SafeSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>
>(({ children, ...props }, ref) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <SelectPrimitive.Root {...props}>
      {children}
    </SelectPrimitive.Root>
  );
});
SafeSelect.displayName = "SafeSelect";

const SafeSelectGroup = SelectPrimitive.Group;

const SafeSelectValue = SelectPrimitive.Value;

const SafeSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SafeSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SafeSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SafeSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SafeSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SafeSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SafeSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  const [contentRef, setContentRef] = React.useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  // Gestion sécurisée du portal
  React.useEffect(() => {
    if (contentRef) {
      setIsVisible(true);
      
      // Cleanup function pour éviter les erreurs removeChild
      return () => {
        setIsVisible(false);
        // Délai pour permettre à l'animation de se terminer
        setTimeout(() => {
          try {
            if (contentRef && contentRef.parentNode) {
              contentRef.parentNode.removeChild(contentRef);
            }
          } catch (error) {
            // Ignorer silencieusement les erreurs removeChild
            console.debug('SafeSelect cleanup (non-critical):', error);
          }
        }, 100);
      };
    }
  }, [contentRef]);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={(node) => {
          setContentRef(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
        style={{
          ...props.style,
          visibility: isVisible ? 'visible' : 'hidden',
        }}
      >
        <SafeSelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SafeSelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SafeSelectContent.displayName = SelectPrimitive.Content.displayName;

const SafeSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SafeSelectLabel.displayName = SelectPrimitive.Label.displayName;

const SafeSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SafeSelectItem.displayName = SelectPrimitive.Item.displayName;

const SafeSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SafeSelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  SafeSelect as Select,
  SafeSelectGroup as SelectGroup,
  SafeSelectValue as SelectValue,
  SafeSelectTrigger as SelectTrigger,
  SafeSelectContent as SelectContent,
  SafeSelectLabel as SelectLabel,
  SafeSelectItem as SelectItem,
  SafeSelectSeparator as SelectSeparator,
  SafeSelectScrollUpButton as SelectScrollUpButton,
  SafeSelectScrollDownButton as SelectScrollDownButton,
};
