import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-brand-garnet)] text-[var(--color-bg-warm-white)] shadow-[var(--shadow-garnet)] hover:bg-[var(--color-brand-garnet-deep)] hover:shadow-[0_6px_20px_rgba(122,34,48,0.22)] active:translate-y-[1px]",
        secondary:
          "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-medium)] hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-brand-garnet-muted)]",
        ghost:
          "bg-transparent text-[var(--color-text-secondary)] font-normal hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]",
      },
      size: {
        default: "px-[20px] py-[10px]",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-8 py-3 rounded-lg text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
