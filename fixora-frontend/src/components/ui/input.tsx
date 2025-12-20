// This will be our standard text input field used in forms across the site.

// src/components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm sm:text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 min-h-[44px]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }