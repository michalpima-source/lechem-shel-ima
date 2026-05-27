'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus, togglePaid } from '@/lib/actions/orders'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Order, OrderStatus } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'

const STATUS_OPTIONS: OrderStatus[] = ['new', 'received', 'ready', 'completed']

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [, startTransition] = useTransition()

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (o.customer_name ?? '').toLowerCase().includes(q) ||
      (o.phone ?? '').includes(q) ||
      String(o.order_number ?? '').includes(q)
    return matchStatus && matchSearch
  })

  function handleStatusChange(orderId: string, status: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status)
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
        if (selected?.id === orderId) setSelected(o => o ? { ...o, status } : o)
        toast.success('סטטוס עודכן')
      } else {
        toast.error('שגיאה בעדכון הסטטוס')
      }
    })
  }

  function handlePaidToggle(orderId: string, is_paid: boolean) {
    startTransition(async () => {
      const result = await togglePaid(orderId, is_paid)
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, is_paid } : o))
        if (selected?.id === orderId) setSelected(o => o ? { ...o, is_paid } : o)
      } else {
        toast.error('שגיאה בעדכון התשלום')
      }
    })
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="חפש לפי שם, טלפון או מספר הזמנה..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', ...STATUS_OPTIONS] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-primary'
              }`}
            >
              {s === 'all' ? 'הכל' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>לקוח</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>איסוף</TableHead>
                <TableHead>סכום</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead className="w-24">שולם</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    לא נמצאו הזמנות
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(order => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(order)}
                  >
                    <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{order.phone}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.pickup_date).toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell className="font-medium">₪{order.total_amount.toFixed(0)}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="text-xs border rounded px-2 py-1 bg-background cursor-pointer"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={order.is_paid}
                        onCheckedChange={checked => handlePaidToggle(order.id, !!checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>הזמנה #{selected.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">לקוח: </span>{selected.customer_name}</div>
                <div dir="ltr" className="text-right"><span className="text-muted-foreground">טלפון: </span>{selected.phone}</div>
                {selected.email && <div><span className="text-muted-foreground">אימייל: </span>{selected.email}</div>}
                <div><span className="text-muted-foreground">הוזמן: </span>{new Date(selected.created_at).toLocaleDateString('he-IL')}</div>
                <div><span className="text-muted-foreground">איסוף: </span>{new Date(selected.pickup_date).toLocaleDateString('he-IL')}</div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">סטטוס:</span>
                  <OrderStatusBadge status={selected.status} />
                </div>
              </div>

              {selected.notes && (
                <div className="bg-muted/50 rounded p-3 text-sm">
                  <span className="font-medium">הערות: </span>{selected.notes}
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">פריטים</h4>
                {selected.order_items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>₪{(item.unit_price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>סה״כ</span>
                <span>₪{selected.total_amount.toFixed(0)}</span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1">
                  <select
                    value={selected.status}
                    onChange={e => handleStatusChange(selected.id, e.target.value as OrderStatus)}
                    className="w-full text-sm border rounded px-3 py-2 bg-background"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={selected.is_paid}
                    onCheckedChange={checked => handlePaidToggle(selected.id, !!checked)}
                  />
                  שולם
                </label>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
