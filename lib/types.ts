export type OrderStatus = 'new' | 'received' | 'ready' | 'completed'
export type ProductCategory = 'חלות' | 'עוגות' | 'ממתקים'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: ProductCategory
  is_available: boolean
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  order_number: number
  user_id: string | null
  customer_name: string
  phone: string
  email: string | null
  pickup_date: string
  notes: string | null
  status: OrderStatus
  is_paid: boolean
  total_amount: number
  created_at: string
  order_items?: OrderItem[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'חדש',
  received: 'התקבלה',
  ready: 'מוכן לאיסוף',
  completed: 'הושלמה',
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  received: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-600',
}

export const CATEGORIES: ProductCategory[] = ['חלות', 'עוגות', 'ממתקים']
