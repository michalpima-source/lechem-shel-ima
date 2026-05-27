'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart-context'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedNav } from '@/components/animated-nav'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount } = useCart()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/menu" className="flex items-center gap-2 text-xl font-bold">
            <span>🍞</span>
            <span>לחם של אמא</span>
          </Link>
          <nav className="hidden md:flex items-center">
            <AnimatedNav items={[
              { label: 'תפריט', href: '/menu' },
              { label: 'ההזמנות שלי', href: '/my-orders' },
            ]} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                {itemCount > 9 ? '9+' : itemCount}
              </Badge>
            )}
            <span className="sr-only">סל קניות</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  שלום, {profile?.full_name ?? user.email?.split('@')[0]}
                </span>
                {profile?.is_admin && (
                  <Link href="/admin/orders" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                    ניהול
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  התנתק
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                  התחבר
                </Link>
                <Link href="/register" className={cn(buttonVariants({ size: 'sm' }))}>
                  הרשם
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 flex flex-col gap-3">
          <Link href="/menu" className="text-sm" onClick={() => setMobileOpen(false)}>תפריט</Link>
          <Link href="/my-orders" className="text-sm" onClick={() => setMobileOpen(false)}>ההזמנות שלי</Link>
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">שלום, {profile?.full_name ?? user.email}</span>
              {profile?.is_admin && (
                <Link href="/admin/orders" className="text-sm" onClick={() => setMobileOpen(false)}>ניהול</Link>
              )}
              <button onClick={handleLogout} className="text-sm text-start">התנתק</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm" onClick={() => setMobileOpen(false)}>התחבר</Link>
              <Link href="/register" className="text-sm" onClick={() => setMobileOpen(false)}>הרשם</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
