'use client'

import { motion } from 'framer-motion'

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] as const },
      opacity: { duration: 0.5 },
    },
  },
}

export function HandwrittenTitle({
  title = 'כותרת',
  subtitle,
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <div className="relative w-full max-w-4xl mx-auto py-16">
      <div className="absolute inset-0 pointer-events-none">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 400"
          initial="hidden"
          animate="visible"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 950 60
               C 1200 200, 1050 340, 600 360
               C 250 360, 100 310, 100 200
               C 100 90, 330 40, 600 40
               C 870 40, 970 130, 950 60"
            fill="none"
            strokeWidth="6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            className="text-primary opacity-60"
          />
        </motion.svg>
      </div>

      <div className="relative z-10 text-center flex flex-col items-center justify-center gap-3">
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-foreground tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-lg md:text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  )
}
