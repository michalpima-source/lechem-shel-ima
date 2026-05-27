import { getAllProducts } from '@/lib/actions/products'
import { ProductsClient } from './products-client'

export const metadata = { title: 'ניהול מוצרים | לחם של אמא' }
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await getAllProducts()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ניהול מוצרים</h1>
        <p className="text-muted-foreground text-sm mt-1">{products.length} מוצרים</p>
      </div>
      <ProductsClient initialProducts={products} />
    </div>
  )
}
