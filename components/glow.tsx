import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const glowVariants = cva('absolute w-full pointer-events-none', {
  variants: {
    variant: {
      top: 'top-0',
      above: '-top-32',
      bottom: 'bottom-0',
      below: '-bottom-32',
      center: 'top-1/2',
    },
  },
  defaultVariants: { variant: 'top' },
})

export const Glow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof glowVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(glowVariants({ variant }), className)} {...props}>
    <div
      className={cn(
        'absolute left-1/2 h-64 w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] sm:h-[512px]',
        variant === 'center' && '-translate-y-1/2'
      )}
      style={{
        background:
          'radial-gradient(ellipse at center, color-mix(in oklch, var(--color-primary) 18%, transparent) 10%, transparent 60%)',
      }}
    />
    <div
      className={cn(
        'absolute left-1/2 h-32 w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] sm:h-64',
        variant === 'center' && '-translate-y-1/2'
      )}
      style={{
        background:
          'radial-gradient(ellipse at center, color-mix(in oklch, var(--color-primary) 30%, transparent) 10%, transparent 60%)',
      }}
    />
  </div>
))
Glow.displayName = 'Glow'
