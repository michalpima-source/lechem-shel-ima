'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { getOrdersByPhone } from '@/lib/actions/orders'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Order } from '@/lib/types'

interface Props {
  initialOrders: Order[]
  isLoggedIn: boolean
}

export function MyOrdersContent({ initialOrders, isLoggedIn }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [phone, setPhone] = useState('')
  const [searched, setSearched] = useState(isLoggedIn)
  const [isPending, startTransition] = useTransition()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return
    startTransition(async () => {
      try {
        const result = await getOrdersByPhone(phone)
        setOrders(result)
        setSearched(true)
        if (result.length === 0) toast.info('לא נמצאו הזמנות עבור מספר זה')
      } catch {
        toast.error('שגיאה בטעינת ההזמנות')
      }
    })
  }

  if (!isLoggedIn && !searched) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>מצא את ההזמנות שלך</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">מספר טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="050-0000000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'מחפש...' : 'חפש הזמנות'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              יש לך חשבון?{' '}
              <Link href="/login" className="text-primary hover:underline">התחבר</Link>
              {' '}כדי לראות את כל ההזמנות שלך
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isLoggedIn && searched && orders.length === 0) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg font-medium">לא נמצאו הזמנות</p>
          <p className="text-sm text-muted-foreground mt-1">למספר {phone}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => { setSearched(false); setOrders([]) }}>
          חפש מספר אחר
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold">עדיין אין הזמנות</h2>
        <p className="text-muted-foreground mt-2">הזמן עוד היום מהתפריט שלנו</p>
        <Button className="mt-6" nativeButton={false} render={<Link href="/menu" />}>לתפריט</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {!isLoggedIn && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{orders.length} הזמנות עבור {phone}</p>
          <Button variant="ghost" size="sm" onClick={() => { setSearched(false); setOrders([]) }}>
            חפש מספר אחר
          </Button>
        </div>
      )}

      {orders.map(order => (
        <Card key={order.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base font-semibold">
                הזמנה #{order.order_number}
              </CardTitle>
              <div className="flex items-center gap-2">
                {order.is_paid ? (
                  <span className="text-xs text-green-600 font-medium">✓ שולם</span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">ממתין לתשלום</span>
                )}
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-4 mt-1">
              <span>הוזמן: {new Date(order.created_at).toLocaleDateString('he-IL')}</span>
              <span>איסוף: {new Date(order.pickup_date).toLocaleDateString('he-IL')}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {order.order_items && order.order_items.length > 0 && (
              <>
                <div className="space-y-1 text-sm">
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex justify-between text-muted-foreground">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>₪{(item.unit_price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
              </>
            )}
            <div className="flex justify-between font-bold">
              <span>סה״כ</span>
              <span>₪{order.total_amount.toFixed(0)}</span>
            </div>
            {order.notes && (
              <p className="mt-2 text-sm text-muted-foreground border-t pt-2">
                הערה: {order.notes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
