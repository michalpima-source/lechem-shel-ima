'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
}

export function AnimatedNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 })
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  // set cursor under active tab on mount + route change
  useEffect(() => {
    const activeIndex = items.findIndex(
      item => pathname === item.href || pathname.startsWith(item.href + '/')
    )
    const el = itemRefs.current[activeIndex]
    if (el) {
      const { width } = el.getBoundingClientRect()
      setPosition({ width, opacity: 1, left: el.offsetLeft })
    }
  }, [pathname, items])

  return (
    <ul
      className="relative flex w-fit rounded-full border border-border bg-background p-1"
      onMouseLeave={() => {
        // return to active tab on mouse leave
        const activeIndex = items.findIndex(
          item => pathname === item.href || pathname.startsWith(item.href + '/')
        )
        const el = itemRefs.current[activeIndex]
        if (el) {
          const { width } = el.getBoundingClientRect()
          setPosition({ width, opacity: 1, left: el.offsetLeft })
        } else {
          setPosition(pv => ({ ...pv, opacity: 0 }))
        }
      }}
      dir="ltr"
    >
      {items.map((item, i) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <li
            key={item.href}
            ref={el => { itemRefs.current[i] = el }}
            onMouseEnter={() => {
              const el = itemRefs.current[i]
              if (!el) return
              const { width } = el.getBoundingClientRect()
              setPosition({ width, opacity: 1, left: el.offsetLeft })
            }}
            className="relative z-10 block cursor-pointer"
          >
            <Link
              href={item.href}
              className={`block px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                isActive ? 'text-primary-foreground' : 'text-foreground hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
      <Cursor position={position} />
    </ul>
  )
}

function Cursor({ position }: { position: { left: number; width: number; opacity: number } }) {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 top-1 h-[calc(100%-8px)] rounded-full bg-primary"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    />
  )
}
