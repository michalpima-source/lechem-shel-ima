import { SiteHeader } from '@/components/site-header'
import { MyOrdersContent } from './my-orders-content'
import { getMyOrders } from '@/lib/actions/orders'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'ההזמנות שלי | לחם של אמא' }

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const orders = user ? await getMyOrders() : []

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ההזמנות שלי</h1>
        <MyOrdersContent initialOrders={orders} isLoggedIn={!!user} />
      </main>
    </div>
  )
}
