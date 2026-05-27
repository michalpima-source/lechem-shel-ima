import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import type { OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
