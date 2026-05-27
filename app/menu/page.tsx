import { SiteHeader } from '@/components/site-header'
import { MenuContent } from './menu-content'
import { HandwrittenTitle } from '@/components/handwritten-title'
import { Glow } from '@/components/glow'
import { getAvailableProducts } from '@/lib/actions/products'

export const metadata = {
  title: 'תפריט | לחם של אמא',
}

export default async function MenuPage() {
  const products = await getAvailableProducts()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4">
        <div className="relative">
          <Glow variant="top" className="opacity-60" />
          <HandwrittenTitle
            title="לחם של אמא"
            subtitle="הכל אפוי טרי, עם אהבה 🧡"
          />
        </div>
        <MenuContent products={products} />
      </main>
    </div>
  )
}
