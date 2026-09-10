import React from 'react'
import type { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
  pulse?: boolean
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className, pulse }) => {
  // Pill-shaped (radius 999px), tinted background + colored text + small dot
  // "Novo" = blue tint (#1E73BE)
  // "Em preparação" = warm amber tint (#B26A00)
  // "Pronto" = green tint (#2E7D32)
  // "Entregue" = neutral slate tint (#4A5D6B)
  // "Cancelado" = red tint (#B3261E)

  const config = {
    Novo: {
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
      dot: 'bg-blue-600',
      label: 'Novo',
    },
    'Em preparação': {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      dot: 'bg-amber-600',
      label: 'Em preparação',
    },
    Pronto: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      dot: 'bg-emerald-600',
      label: 'Pronto',
    },
    Entregue: {
      bg: 'bg-slate-100 border-slate-300 text-slate-700',
      dot: 'bg-slate-500',
      label: 'Entregue',
    },
    Cancelado: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      dot: 'bg-rose-600',
      label: 'Cancelado',
    },
  }[status] || {
    bg: 'bg-neutral-100 border-neutral-200 text-neutral-700',
    dot: 'bg-neutral-500',
    label: status,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-200',
        config.bg,
        pulse && 'animate-pulse ring-2 ring-primary/20',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  )
}

export const ActiveStatusBadge: React.FC<{ active: boolean; className?: string }> = ({
  active,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        active
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-stone-100 border-stone-200 text-stone-600',
        className,
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-stone-400')}
      />
      {active ? 'Ativo' : 'Inativo'}
    </span>
  )
}
