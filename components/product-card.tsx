'use client'

import Image from 'next/image'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const cartItem = items.find(i => i.product.id === product.id)
  const quantity = cartItem?.quantity ?? 0

  return (
    <Card className="overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl">
            {product.category === 'עוגות' ? '🎂' : product.category === 'ממתקים' ? '🍪' : '🍞'}
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 text-xs"
        >
          {product.category}
        </Badge>
      </div>

      <CardContent className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold">₪{product.price.toFixed(0)}</span>

          {quantity === 0 ? (
            <Button
              size="sm"
              onClick={() => addItem(product)}
              className="gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              הוסף לסל
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => addItem(product)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
