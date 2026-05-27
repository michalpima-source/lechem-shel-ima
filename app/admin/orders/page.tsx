import { getOrders } from '@/lib/actions/orders'
import { OrdersClient } from './orders-client'

export const metadata = { title: 'ניהול הזמנות | לחם של אמא' }
export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ניהול הזמנות</h1>
          <p className="text-muted-foreground text-sm mt-1">{orders.length} הזמנות בסך הכל</p>
        </div>
      </div>
      <OrdersClient initialOrders={orders} />
    </div>
  )
}
