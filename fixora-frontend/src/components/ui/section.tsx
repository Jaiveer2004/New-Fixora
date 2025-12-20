// Mobile-optimized section component with responsive padding
import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  variant?: "default" | "muted" | "gradient"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, variant = "default", padding = "md", ...props }, ref) => {
    const variantClasses = {
      default: "bg-transparent",
      muted: "bg-gray-800",
      gradient: "bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900"
    }

    const paddingClasses = {
      none: "py-0",
      sm: "py-6 sm:py-8",
      md: "py-8 sm:py-12 md:py-16",
      lg: "py-12 sm:py-16 md:py-20",
      xl: "py-16 sm:py-20 md:py-24"
    }

    return (
      <section
        ref={ref}
        className={cn(
          "px-4 sm:px-6",
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </section>
    )
  }
)
Section.displayName = "Section"

export { Section }
