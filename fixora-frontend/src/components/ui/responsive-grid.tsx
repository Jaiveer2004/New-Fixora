// Responsive grid component for better mobile layouts
import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "sm" | "md" | "lg"
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, children, cols = { default: 1, sm: 2, lg: 3, xl: 4 }, gap = "md", ...props }, ref) => {
    const colClasses = [
      cols.default && `grid-cols-${cols.default}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`
    ].filter(Boolean).join(' ')

    const gapClasses = {
      sm: "gap-3 sm:gap-4",
      md: "gap-4 sm:gap-6",
      lg: "gap-6 sm:gap-8"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          colClasses,
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResponsiveGrid.displayName = "ResponsiveGrid"

export { ResponsiveGrid }
