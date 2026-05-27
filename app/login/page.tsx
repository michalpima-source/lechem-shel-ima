'use client'

import { Suspense, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/menu'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error('שגיאה בהתחברות: ' + (error.message === 'Invalid login credentials' ? 'אימייל או סיסמה שגויים' : error.message))
        return
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single()

        toast.success('התחברת בהצלחה!')
        router.push(profile?.is_admin ? '/admin/orders' : redirect)
        router.refresh()
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🍞</div>
          <CardTitle className="text-2xl">ברוכים הבאים</CardTitle>
          <CardDescription>לחם של אמא — כניסה לחשבון</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'מתחבר...' : 'כניסה'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            אין לך חשבון?{' '}
            <Link href="/register" className="text-primary hover:underline">
              הרשם עכשיו
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            בפעם הראשונה?{' '}
            <Link href="/admin-setup" className="text-primary hover:underline">
              הגדר גישת מנהל
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
