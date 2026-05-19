import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const typeChipVariants = cva(
  "inline-flex items-center font-mono uppercase tracking-[0.08em] text-[11px] font-medium px-[8px] py-[3px] rounded-[4px] border",
  {
    variants: {
      type: {
        prompt:
          "bg-[var(--color-brand-garnet-ghost)] text-[var(--color-brand-garnet)] border-[var(--color-brand-garnet-muted)]",
        system:
          "bg-[#E8EEF5] text-[#2F5D8A] border-[#8AAAC8]",
        persona:
          "bg-[#F0EBE0] text-[#7A6840] border-[#C4AD82]",
        template:
          "bg-[#E8EDF0] text-[#3D5E6B] border-[#8AAAB8]",
        config:
          "bg-[#EBF0E8] text-[#4A6B4A] border-[#8AB88A]",
      },
    },
    defaultVariants: {
      type: "prompt",
    },
  }
)

export interface TypeChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof typeChipVariants> { }

function TypeChip({ className, type, ...props }: TypeChipProps) {
  return (
    <div className={cn(typeChipVariants({ type }), className)} {...props}>
      [{type}]
    </div>
  )
}

const tagVariants = cva(
  "inline-flex items-center rounded-full border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-[10px] py-[4px] text-[12px] font-[var(--font-geist-sans)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand-garnet-muted)] hover:text-[var(--color-brand-garnet)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-garnet)] focus:ring-offset-2",
  {
    variants: {},
    defaultVariants: {},
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof tagVariants> { }

function Tag({ className, ...props }: TagProps) {
  return (
    <div className={cn(tagVariants(), className)} {...props} />
  )
}

export { TypeChip, typeChipVariants, Tag, tagVariants }
