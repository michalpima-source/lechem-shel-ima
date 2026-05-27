'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Product, ProductCategory } from '@/lib/types'

export async function getAvailableProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('category')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createProduct(data: {
  name: string
  description: string
  price: number
  image_url: string
  category: ProductCategory
  is_available: boolean
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('products').insert(data)

  if (error) return { success: false, error: error.message }
  revalidatePath('/menu')
  revalidatePath('/admin/products')
  return { success: true }
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string
    description: string
    price: number
    image_url: string
    category: ProductCategory
    is_available: boolean
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('products').update(data).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/menu')
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/menu')
  revalidatePath('/admin/products')
  return { success: true }
}
