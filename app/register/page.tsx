'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirm: '' })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('הסיסמאות אינן תואמות')
      return
    }
    if (form.password.length < 6) {
      toast.error('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName, phone: form.phone },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('נרשמת בהצלחה! ברוכים הבאים 🎉')
      router.push('/menu')
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🍞</div>
          <CardTitle className="text-2xl">הרשמה</CardTitle>
          <CardDescription>לחם של אמא — יצירת חשבון חדש</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="ישראל ישראלי"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="050-0000000"
                value={form.phone}
                onChange={handleChange}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@mail.com"
                value={form.email}
                onChange={handleChange}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">אימות סיסמה</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                required
                dir="ltr"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'נרשם...' : 'הרשמה'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-primary hover:underline">
              כניסה
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
