import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "info" | "warning"
  size?: "default" | "sm"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
      outline: "text-foreground border border-input",
      success: "border-transparent bg-green-100 text-green-800 shadow",
      info: "border-transparent bg-blue-100 text-blue-800 shadow",
      warning: "border-transparent bg-yellow-100 text-yellow-800 shadow",
    }
    const sizes = {
      default: "px-2.5 py-0.5 text-xs",
      sm: "px-2 py-0.5 text-[10px]",
    }
    return (
      <div 
        ref={ref} 
        className={cn("inline-flex items-center rounded-md border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], sizes[size], className)} 
        {...props} 
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }

