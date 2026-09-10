import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Beef,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { getOrderById, updateOrderStatus } from '@/services/orders'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { OrderStatusBadge } from '@/components/StatusBadges'
import { useToast } from '@/hooks/use-toast'
import type { Order, OrderItem, OrderStatus } from '@/types'

const STATUS_LIST: OrderStatus[] = ['Novo', 'Em preparação', 'Pronto', 'Entregue', 'Cancelado']

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [pulseBadge, setPulseBadge] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const res = await getOrderById(id)
      setOrder(res.order)
      setItems(res.items)
    } catch (err) {
      console.error('Erro ao buscar pedido:', err)
      toast({
        title: 'Pedido não encontrado',
        description: 'O pedido solicitado não existe ou foi removido.',
        variant: 'destructive',
      })
      navigate('/pedidos')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('orders', () => {
    loadData()
  })
  useRealtime('order_items', () => {
    loadData()
  })

  // Change Status
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || order.status === newStatus || updatingStatus) return

    setUpdatingStatus(true)
    try {
      const updated = await updateOrderStatus(order.id, newStatus)
      setOrder(updated)
      setPulseBadge(true)
      setTimeout(() => setPulseBadge(false), 600)

      toast({
        title: 'Status atualizado!',
        description: `O pedido mudou para "${newStatus}".`,
      })
    } catch (err) {
      console.error('Erro ao mudar status:', err)
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível alterar o status do pedido.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C43A25]" />
        <p className="text-sm text-[#7A716A]">Carregando detalhes do pedido...</p>
      </div>
    )
  }

  if (!order) return null

  const client = order.expand?.client
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E7E1DA]">
        <div className="flex items-center gap-3">
          <Link
            to="/pedidos"
            className="p-2 rounded-lg text-[#7A716A] hover:text-[#2A2420] hover:bg-white border border-[#E7E1DA] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#2A2420] tracking-tight">
                Pedido #{order.id.slice(-6).toUpperCase()}
              </h1>
              <OrderStatusBadge status={order.status} pulse={pulseBadge} />
            </div>
            <p className="text-xs text-[#7A716A] mt-0.5">Criado em {formatDate(order.created)}</p>
          </div>
        </div>

        {/* Status Selector Dropdown */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E7E1DA] shadow-2xs">
          <span className="text-xs font-semibold text-[#7A716A] pl-2 uppercase tracking-wider shrink-0">
            Alterar Status:
          </span>
          <select
            value={order.status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="bg-[#FAF8F5] font-semibold text-xs text-[#2A2420] border border-[#E7E1DA] rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] cursor-pointer"
          >
            {STATUS_LIST.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {updatingStatus && <Loader2 className="w-4 h-4 animate-spin text-[#C43A25] ml-1" />}
        </div>
      </div>

      {/* Grid: Client details & Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Client details card */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-[#E7E1DA] shadow-xs space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7A716A]">
            Dados do Revendedor
          </h2>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#2A2420]">
                {client?.name || 'Cliente Removido'}
              </h3>
              <span className="inline-block px-2.5 py-0.5 mt-1 rounded-md bg-[#FAF8F5] border border-[#E7E1DA] text-xs font-medium text-[#2A2420]">
                {client?.type || 'Ambulante'}
              </span>
            </div>
            {client && (
              <Link to="/clientes" className="text-xs text-[#C43A25] font-semibold hover:underline">
                Ver clientes
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-[#F0EBE4] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#2A2420]">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-mono">{client?.phone || 'Sem telefone'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#7A716A]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{client?.address_region || 'Sem endereço'}</span>
            </div>
            {client?.notes && (
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E1DA] text-[#7A716A] text-[11px] leading-relaxed">
                <strong className="text-[#2A2420]">Observações do revendedor:</strong>{' '}
                {client.notes}
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white p-5 rounded-xl border border-[#E7E1DA] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7A716A] mb-3">
              Resumo da Remessa
            </h2>
            <div className="space-y-2 text-xs text-[#7A716A]">
              <div className="flex justify-between">
                <span>Total de espetinhos:</span>
                <strong className="text-[#2A2420] font-mono">{totalQuantity} un.</strong>
              </div>
              <div className="flex justify-between">
                <span>Variedades de carnes:</span>
                <strong className="text-[#2A2420] font-mono">{items.length} tipos</strong>
              </div>
              <div className="flex justify-between">
                <span>Status atual:</span>
                <strong className="text-[#2A2420]">{order.status}</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0EBE4] mt-4">
            <span className="text-[11px] font-semibold text-[#7A716A] uppercase block">
              Valor Total do Pedido
            </span>
            <span className="text-2xl font-extrabold text-[#C43A25] font-mono">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-xl border border-[#E7E1DA] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E7E1DA]">
          <h2 className="font-bold text-base text-[#2A2420]">Itens do Pedido</h2>
          <p className="text-xs text-[#7A716A]">Composição dos espetinhos e cálculo unitário</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E7E1DA] bg-[#FAF8F5] text-[11px] font-semibold text-[#7A716A] uppercase tracking-wider">
                <th className="py-3 px-5">Produto / Espetinho</th>
                <th className="py-3 px-5 text-center">Peso</th>
                <th className="py-3 px-5 text-center">Quantidade</th>
                <th className="py-3 px-5 text-right">Preço Unitário</th>
                <th className="py-3 px-5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE4]">
              {items.map((item) => {
                const product = item.expand?.product
                return (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#2A2420]">
                        {product?.name || 'Espetinho'}
                      </div>
                      <div className="text-xs text-[#7A716A]">{product?.category || ''}</div>
                    </td>
                    <td className="py-3.5 px-5 text-center text-xs text-[#7A716A] font-mono">
                      {product?.weight_grams ? `${product.weight_grams} g` : '100 g'}
                    </td>
                    <td className="py-3.5 px-5 text-center font-mono font-semibold text-[#2A2420]">
                      {item.quantity} un.
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-xs text-[#7A716A]">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-[#2A2420]">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#FAF8F5] border-t-2 border-[#E7E1DA]">
                <td colSpan={3} className="py-4 px-5 font-bold text-sm text-[#2A2420]">
                  Total Geral ({totalQuantity} espetinhos)
                </td>
                <td
                  colSpan={2}
                  className="py-4 px-5 text-right font-mono font-extrabold text-xl text-[#C43A25]"
                >
                  {formatCurrency(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Items Stack */}
        <div className="sm:hidden divide-y divide-[#F0EBE4]">
          {items.map((item) => {
            const product = item.expand?.product
            return (
              <div key={item.id} className="p-4 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#2A2420]">
                      {product?.name || 'Espetinho'}
                    </h4>
                    <span className="text-xs text-[#7A716A]">
                      {product?.category} • {product?.weight_grams || 100} g
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#2A2420]">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#7A716A] pt-1">
                  <span>
                    {item.quantity} un. × {formatCurrency(item.unit_price)}
                  </span>
                </div>
              </div>
            )
          })}
          <div className="p-4 bg-[#FAF8F5] flex items-center justify-between">
            <span className="font-bold text-sm text-[#2A2420]">Total</span>
            <span className="font-mono font-extrabold text-lg text-[#C43A25]">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
