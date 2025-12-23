"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

const useDropdownMenuContext = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu");
  }
  return context;
};

interface DropdownMenuProps {
  children: React.ReactNode;
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (open && !target.closest('[data-dropdown-menu]')) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: setOpen }}>
      <div className="relative" data-dropdown-menu>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps {
  children?: React.ReactNode;
  className?: string;
}

const DropdownMenuTrigger = ({ children, className }: DropdownMenuTriggerProps) => {
  const { open, onOpenChange } = useDropdownMenuContext();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-colors",
        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={() => onOpenChange(!open)}
    >
      {children || <ChevronDown className="h-4 w-4" />}
    </button>
  );
};

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "end", children, ...props }, ref) => {
    const { open } = useDropdownMenuContext();

    if (!open) return null;

    return (
      <div
        ref={ref}
        data-dropdown-menu
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          align === "end" && "left-0",
          align === "start" && "right-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive";
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, variant = "default", children, onClick, ...props }, ref) => {
    const { onOpenChange } = useDropdownMenuContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(false);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          variant === "destructive" && "text-destructive focus:text-destructive",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };

