"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);

const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within Popover");
  }
  return context;
};

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Popover = ({ open: controlledOpen, onOpenChange, children }: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (open && !target.closest('[data-popover]') && !target.closest('[data-popover-trigger]')) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: setOpen }}>
      <div className="relative" data-popover-container>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

const PopoverTrigger = React.forwardRef<HTMLDivElement, PopoverTriggerProps>(
  ({ asChild, children }, ref) => {
    const { open, onOpenChange } = usePopoverContext();
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onOpenChange(!open);
        },
        ref,
        "data-popover-trigger": true,
      } as any);
    }
    
    return (
      <div 
        ref={ref} 
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(!open);
        }} 
        className="inline-block"
        data-popover-trigger
      >
        {children}
      </div>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "end", side = "bottom", children, ...props }, ref) => {
    const { open } = usePopoverContext();

    if (!open) return null;

    return (
      <div
        ref={ref}
        data-popover
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "animate-in fade-in-0 zoom-in-95",
          side === "bottom" && "top-full mt-2 slide-in-from-top-2",
          side === "top" && "bottom-full mb-2 slide-in-from-bottom-2",
          side === "left" && "right-full mr-2 slide-in-from-right-2",
          side === "right" && "left-full ml-2 slide-in-from-left-2",
          align === "start" && "right-0",
          align === "end" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };

