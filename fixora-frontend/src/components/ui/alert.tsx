import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning";
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", onClose, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-blue-900/30 border-blue-700 text-blue-200",
      destructive: "bg-red-900/30 border-red-700 text-red-200",
      success: "bg-green-900/30 border-green-700 text-green-200",
      warning: "bg-yellow-900/30 border-yellow-700 text-yellow-200",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 backdrop-blur-sm",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
