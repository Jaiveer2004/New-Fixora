// Responsive spacing component for consistent mobile/desktop spacing
import * as React from "react"
import { cn } from "@/lib/utils"

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  axis?: "vertical" | "horizontal" | "both"
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = "md", axis = "vertical", ...props }, ref) => {
    const sizeClasses = {
      xs: {
        vertical: "h-2 sm:h-3",
        horizontal: "w-2 sm:w-3",
        both: "h-2 w-2 sm:h-3 sm:w-3"
      },
      sm: {
        vertical: "h-4 sm:h-6",
        horizontal: "w-4 sm:w-6",
        both: "h-4 w-4 sm:h-6 sm:w-6"
      },
      md: {
        vertical: "h-6 sm:h-8",
        horizontal: "w-6 sm:w-8",
        both: "h-6 w-6 sm:h-8 sm:w-8"
      },
      lg: {
        vertical: "h-8 sm:h-12",
        horizontal: "w-8 sm:w-12",
        both: "h-8 w-8 sm:h-12 sm:w-12"
      },
      xl: {
        vertical: "h-12 sm:h-16",
        horizontal: "w-12 sm:w-16",
        both: "h-12 w-12 sm:h-16 sm:w-16"
      },
      "2xl": {
        vertical: "h-16 sm:h-24",
        horizontal: "w-16 sm:w-24",
        both: "h-16 w-16 sm:h-24 sm:w-24"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(sizeClasses[size][axis], className)}
        {...props}
      />
    )
  }
)
Spacer.displayName = "Spacer"

export { Spacer }
