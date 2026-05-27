import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

async function makeAdmin() {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin-setup')

  const admin = await createAdminClient()
  await admin.from('profiles').update({ is_admin: true }).eq('id', user.id)
  redirect('/admin/orders')
}

export default async function AdminSetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/admin-setup')

  const { data: profile } = await (await createAdminClient())
    .from('profiles')
    .select('full_name, is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) redirect('/admin/orders')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-4xl mb-2">🔑</div>
          <CardTitle>הגדרת הרשאות אדמין</CardTitle>
          <CardDescription>
            שלום {profile?.full_name ?? user.email}!<br />
            לחץ כדי לקבל גישת ניהול מלאה לאפליקציה.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={makeAdmin}>
            <Button type="submit" className="w-full" size="lg">
              הפוך אותי לאדמין
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            עמוד זה מיועד להגדרה ראשונית בלבד
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
