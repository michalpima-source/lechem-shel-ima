'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/product-card'
import type { Product, ProductCategory } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'

const ALL = 'הכל'

export function MenuContent({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ProductCategory | typeof ALL>(ALL)

  const filtered = products.filter(p => {
    const matchCategory = activeCategory === ALL || p.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="חפש מוצר..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[ALL, ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as ProductCategory | typeof ALL)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg">לא נמצאו מוצרים</p>
          <p className="text-sm mt-1">נסה לחפש מילה אחרת</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
