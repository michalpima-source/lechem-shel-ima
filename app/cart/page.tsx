'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { useCart } from '@/lib/cart-context'
import { createOrder } from '@/lib/actions/orders'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ShinyButton } from '@/components/shiny-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [wantsAccount, setWantsAccount] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    pickup_date: '',
    notes: '',
    password: '',
  })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true)
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => {
            if (data) {
              setProfile(data)
              setForm(f => ({
                ...f,
                customer_name: data.full_name ?? '',
                phone: data.phone ?? '',
                email: user.email ?? '',
              }))
            }
          })
      }
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) { toast.error('הסל ריק'); return }
    if (wantsAccount && form.password.length < 6) {
      toast.error('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    startTransition(async () => {
      const result = await createOrder(items, {
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email || undefined,
        pickup_date: form.pickup_date,
        notes: form.notes || undefined,
      })
      if (!result.success) {
        toast.error('שגיאה בשליחת ההזמנה: ' + result.error)
        return
      }

      if (wantsAccount && form.email && form.password) {
        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.customer_name, phone: form.phone } },
        })
        if (error) {
          toast.warning('ההזמנה נשלחה, אך הרישום נכשל: ' + error.message)
        } else {
          toast.success('ההזמנה נשלחה והחשבון נוצר! 🎉')
        }
      } else {
        toast.success('ההזמנה נשלחה בהצלחה! 🎉')
      }

      clearCart()
      router.push('/my-orders')
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-6">
          <div className="text-6xl">🛒</div>
          <h2 className="text-2xl font-bold">הסל ריק</h2>
          <p className="text-muted-foreground">הוסף מוצרים מהתפריט כדי להמשיך</p>
          <Button nativeButton={false} render={<Link href="/menu" />}>לתפריט</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">הסל שלי</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <Card key={product.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">🍞</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">₪{product.price.toFixed(0)} ליחידה</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="outline" className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, quantity - 1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-6 text-center font-medium">{quantity}</span>
                    <Button size="icon" variant="outline" className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, quantity + 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-right shrink-0 w-16">
                    <p className="font-bold">₪{(product.price * quantity).toFixed(0)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-bold text-lg">סה״כ</span>
              <span className="font-bold text-xl">₪{total.toFixed(0)}</span>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  פרטי הזמנה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">שם מלא *</Label>
                    <Input id="customer_name" name="customer_name" value={form.customer_name}
                      onChange={handleChange} placeholder="ישראל ישראלי" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון *</Label>
                    <Input id="phone" name="phone" type="tel" value={form.phone}
                      onChange={handleChange} placeholder="050-0000000" required dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל</Label>
                    <Input id="email" name="email" type="email" value={form.email}
                      onChange={handleChange} placeholder="example@mail.com" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup_date">תאריך איסוף רצוי *</Label>
                    <Input id="pickup_date" name="pickup_date" type="date" value={form.pickup_date}
                      onChange={handleChange} min={new Date().toISOString().split('T')[0]}
                      required dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">הערות</Label>
                    <Textarea id="notes" name="notes" value={form.notes}
                      onChange={handleChange} placeholder="אלרגיות, בקשות מיוחדות..." rows={3} />
                  </div>

                  {!isLoggedIn && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={wantsAccount}
                            onCheckedChange={c => setWantsAccount(!!c)}
                          />
                          <span className="text-sm font-medium">צור לי חשבון כדי לעקוב אחרי ההזמנות</span>
                        </label>
                        {wantsAccount && (
                          <div className="space-y-2 pr-6">
                            <Label htmlFor="password">סיסמה</Label>
                            <Input id="password" name="password" type="password"
                              value={form.password} onChange={handleChange}
                              placeholder="לפחות 6 תווים" dir="ltr"
                              required={wantsAccount} />
                            <p className="text-xs text-muted-foreground">
                              האימייל שהזנת למעלה ישמש לכניסה
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>סה״כ לתשלום</span>
                    <span>₪{total.toFixed(0)}</span>
                  </div>
                  <ShinyButton
                    type="submit"
                    className="w-full py-3 text-base"
                    disabled={isPending}
                  >
                    {isPending ? 'שולח...' : 'שלח הזמנה 🍞'}
                  </ShinyButton>
                  {!isLoggedIn && !wantsAccount && (
                    <p className="text-center text-xs text-muted-foreground">
                      כבר יש לך חשבון?{' '}
                      <Link href="/login" className="text-primary hover:underline">התחבר</Link>
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
