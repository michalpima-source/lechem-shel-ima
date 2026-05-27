'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendOrderConfirmation } from '@/lib/email'
import type { CartItem, Order, OrderStatus } from '@/lib/types'

export async function createOrder(
  items: CartItem[],
  formData: {
    customer_name: string
    phone: string
    email?: string
    pickup_date: string
    notes?: string
  }
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const total_amount = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  )

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ ...formData, user_id: user?.id ?? null, total_amount })
    .select()
    .single()

  if (orderError) return { success: false, error: orderError.message }

  const orderItems = items.map(i => ({
    order_id: order.id,
    product_id: i.product.id,
    product_name: i.product.name,
    quantity: i.quantity,
    unit_price: i.product.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { success: false, error: itemsError.message }

  if (formData.email && process.env.RESEND_API_KEY) {
    sendOrderConfirmation({
      to: formData.email,
      customerName: formData.customer_name,
      orderNumber: order.order_number,
      pickupDate: formData.pickup_date,
      items,
      totalAmount: total_amount,
      notes: formData.notes,
    }).catch(() => {})
  }

  return { success: true, orderId: order.id }
}

export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('phone', phone.trim())
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getOrders(): Promise<Order[]> {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/orders')
  return { success: true }
}

export async function togglePaid(
  id: string,
  is_paid: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('orders').update({ is_paid }).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/orders')
  return { success: true }
}
