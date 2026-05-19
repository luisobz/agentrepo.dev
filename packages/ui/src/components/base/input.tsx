import * as React from "react"

import { cn } from "../../lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] px-[14px] py-[10px] text-[15px] font-[var(--font-geist-sans)] text-[var(--color-text-primary)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-text-placeholder)] focus-visible:outline-none focus-visible:border-[var(--color-brand-garnet)] focus-visible:shadow-[0_0_0_3px_rgba(122,34,48,0.08)] disabled:cursor-not-allowed disabled:opacity-50",
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
