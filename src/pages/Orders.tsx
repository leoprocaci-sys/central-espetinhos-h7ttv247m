import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  Loader2,
  ShoppingBag,
  ArrowRight,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { OrderStatusBadge } from '@/components/StatusBadges'
import { useToast } from '@/hooks/use-toast'
import type { Order, OrderItem, OrderStatus } from '@/types'

const STATUSES: (OrderStatus | 'Todos')[] = [
  'Todos',
  'Novo',
  'Em preparação',
  'Pronto',
  'Entregue',
  'Cancelado',
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Todos'>('Todos')
  const [searchTerm, setSearchTerm] = useState('')

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch all orders with expanded client
      const list = await pb.collection('orders').getFullList<Order>({
        sort: '-created',
        expand: 'client',
        requestKey: null,
      })
      setOrders(list)

      // 2. Fetch distinct item counts per order
      const allItems = await pb.collection('order_items').getFullList<OrderItem>({
        requestKey: null,
      })
      const countMap: Record<string, number> = {}
      for (const it of allItems) {
        countMap[it.order] = (countMap[it.order] || 0) + 1
      }
      setOrderItemsMap(countMap)
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível buscar a lista de pedidos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('orders', () => {
    loadData()
  })

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const clientName = o.expand?.client?.name || ''
      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E1DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A2420] tracking-tight">Pedidos</h1>
          <p className="text-sm text-[#7A716A] mt-0.5">
            Gestão de remessas de espetinhos, itens e fluxo de status
          </p>
        </div>
        <Link
          to="/pedidos/novo"
          className="inline-flex items-center justify-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all w-full sm:w-auto text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Pedido</span>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E1DA] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A716A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por cliente ou código do pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF8F5] md:bg-white border border-[#E7E1DA] rounded-lg pl-10 pr-3.5 py-2 text-sm text-[#2A2420] placeholder-[#7A716A]/70 focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#7A716A] uppercase tracking-wider shrink-0 hidden sm:inline">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'Todos')}
            className="bg-white border border-[#E7E1DA] rounded-lg px-3 py-2 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] transition-all"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'Todos' ? 'Todos os status' : st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C43A25]" />
          <p className="text-sm text-[#7A716A]">Carregando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E7E1DA] p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-[#7A716A]/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#2A2420]">Nenhum pedido encontrado</h3>
          <p className="text-sm text-[#7A716A] mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'Todos'
              ? 'Tente remover os filtros ou pesquisar por outro cliente.'
              : 'Registre o primeiro pedido para começar a acompanhar as entregas.'}
          </p>
          {!searchTerm && statusFilter === 'Todos' && (
            <Link
              to="/pedidos/novo"
              className="mt-4 inline-flex items-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Criar pedido</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E7E1DA] shadow-xs overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7E1DA] bg-[#FAF8F5] text-[11px] font-semibold text-[#7A716A] uppercase tracking-wider">
                  <th className="py-3 px-5">Pedido</th>
                  <th className="py-3 px-5">Cliente / Ponto</th>
                  <th className="py-3 px-5">Data do Pedido</th>
                  <th className="py-3 px-5">Itens</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Total</th>
                  <th className="py-3 px-5 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE4]">
                {filteredOrders.map((order) => {
                  const client = order.expand?.client
                  const itemsCount = orderItemsMap[order.id] || 0
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                      onClick={() => (window.location.href = `/pedidos/${order.id}`)}
                    >
                      <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#2A2420]">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-[#2A2420] group-hover:text-[#C43A25] transition-colors">
                          {client?.name || 'Cliente Removido'}
                        </div>
                        <div className="text-xs text-[#7A716A]">
                          {client?.address_region || client?.phone || ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#7A716A] font-mono">
                        {formatDate(order.created)}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#2A2420]">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E7E1DA] font-mono font-medium">
                          {itemsCount} {itemsCount === 1 ? 'produto' : 'produtos'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-base text-[#2A2420]">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/pedidos/${order.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#7A716A] hover:text-[#C43A25] hover:bg-[#FCE9E4] transition-colors"
                          title="Visualizar pedido"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((order) => {
              const client = order.expand?.client
              const itemsCount = orderItemsMap[order.id] || 0
              return (
                <Link
                  key={order.id}
                  to={`/pedidos/${order.id}`}
                  className="bg-white p-4 rounded-xl border border-[#E7E1DA] shadow-xs active:bg-[#FAF8F5] block transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-[#7A716A]">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <h3 className="font-bold text-sm text-[#2A2420]">
                    {client?.name || 'Cliente Removido'}
                  </h3>
                  <p className="text-xs text-[#7A716A] mb-3">
                    {client?.address_region || client?.phone || ''}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE4] text-xs">
                    <span className="text-[#7A716A]">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'itens'} •{' '}
                      {formatDate(order.created)}
                    </span>
                    <span className="font-mono font-bold text-base text-[#2A2420]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
