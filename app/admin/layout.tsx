import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Package, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin/orders')

  const profile = await getProfile()
  if (!profile?.is_admin) redirect('/menu')

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-base ml-2">
              🍞 לחם של אמא
            </Link>
            <span className="text-muted-foreground text-sm">|</span>
            <nav className="flex items-center gap-1">
              <Link
                href="/admin/orders"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-2')}
              >
                <ClipboardList className="h-4 w-4" />
                הזמנות
              </Link>
              <Link
                href="/admin/products"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-2')}
              >
                <Package className="h-4 w-4" />
                מוצרים
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile.full_name ?? user.email}
            </span>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                התנתק
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
