'use client'

import React from 'react'
import { motion, type AnimationProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const animationProps: AnimationProps = {
  initial: { '--x': '100%', scale: 0.8 } as never,
  animate: { '--x': '-100%', scale: 1 } as never,
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: 'loop',
    repeatDelay: 1,
    type: 'spring',
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: { type: 'spring', stiffness: 200, damping: 5, mass: 0.5 },
  },
}

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
  return (
    <motion.button
      {...animationProps}
      {...(props as never)}
      className={cn(
        'relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow-md bg-primary',
        className
      )}
    >
      <span
        className="relative block size-full text-sm uppercase tracking-wide text-primary-foreground"
        style={{
          maskImage:
            'linear-gradient(-75deg, var(--color-primary) calc(var(--x) + 20%), transparent calc(var(--x) + 30%), var(--color-primary) calc(var(--x) + 100%))',
        }}
      >
        {children}
      </span>
      <span
        className="absolute inset-0 z-10 block rounded-[inherit] p-px"
        style={{
          background: `linear-gradient(-75deg,
            color-mix(in oklch, var(--color-primary) 10%, transparent) calc(var(--x) + 20%),
            color-mix(in oklch, var(--color-primary) 50%, transparent) calc(var(--x) + 25%),
            color-mix(in oklch, var(--color-primary) 10%, transparent) calc(var(--x) + 100%))`,
          mask: 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box, linear-gradient(rgb(0,0,0), rgb(0,0,0))',
          maskComposite: 'exclude',
        }}
      />
    </motion.button>
  )
}
