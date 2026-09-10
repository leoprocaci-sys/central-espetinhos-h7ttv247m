import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Clock,
  DollarSign,
  Users,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { OrderStatusBadge } from '@/components/StatusBadges'
import { BrandLogo } from '@/components/BrandLogo'
import type { Order, Client } from '@/types'

export default function Index() {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeClientsCount, setActiveClientsCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch orders with expanded client
      const ordersRes = await pb.collection('orders').getFullList<Order>({
        sort: '-created',
        expand: 'client',
        requestKey: null,
      })
      setOrders(ordersRes)

      // 2. Fetch active clients count
      const clientsRes = await pb.collection('clients').getList(1, 1, {
        filter: 'active = true',
        requestKey: null,
      })
      setActiveClientsCount(clientsRes.totalItems)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime subscriptions for orders and clients
  useRealtime('orders', () => {
    loadData()
  })
  useRealtime('clients', () => {
    loadData()
  })

  // Computed metrics
  const stats = useMemo(() => {
    // Total orders excluding Cancelado
    const validOrders = orders.filter((o) => o.status !== 'Cancelado')
    const totalOrdersCount = validOrders.length

    // Pedidos em Aberto: Novo, Em preparação, Pronto
    const openOrdersCount = orders.filter(
      (o) => o.status === 'Novo' || o.status === 'Em preparação' || o.status === 'Pronto',
    ).length

    // Faturamento: sum of totals of non-canceled orders
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0)

    return {
      totalOrdersCount,
      openOrdersCount,
      totalRevenue,
      activeClientsCount,
    }
  }, [orders, activeClientsCount])

  // 5 Most recent orders
  const recentOrders = useMemo(() => {
    return orders.slice(0, 5)
  }, [orders])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E1DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A2420] tracking-tight">
            Painel Operacional
          </h1>
          <p className="text-sm text-[#7A716A] mt-0.5">
            Visão geral da produção, faturamento e pedidos
          </p>
        </div>
        <Link
          to="/pedidos/novo"
          className="inline-flex items-center justify-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all w-full sm:w-auto text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Pedido</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Pedidos */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A716A]">
              Pedidos Válidos
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2A2420] font-mono tracking-tight">
            {loading ? '—' : stats.totalOrdersCount}
          </div>
          <p className="text-xs text-[#7A716A] mt-1.5 flex items-center gap-1">
            <span className="text-slate-500 font-medium">Exclui pedidos cancelados</span>
          </p>
        </div>

        {/* Card 2: Pedidos em Aberto */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A716A]">
              Pedidos em Aberto
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tracking-tight">
            {loading ? '—' : stats.openOrdersCount}
          </div>
          <p className="text-xs text-[#7A716A] mt-1.5">Novo, Em preparação ou Pronto</p>
        </div>

        {/* Card 3: Faturamento */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A716A]">
              Faturamento Total
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#FEF4E5] text-[#F29F05] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2A2420] font-mono tracking-tight">
            {loading ? '—' : formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pedidos confirmados</span>
          </p>
        </div>

        {/* Card 4: Clientes */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E7E1DA] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A716A]">
              Clientes Ativos
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2A2420] font-mono tracking-tight">
            {loading ? '—' : stats.activeClientsCount}
          </div>
          <p className="text-xs text-[#7A716A] mt-1.5">Revendedores cadastrados</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-[#E7E1DA] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E7E1DA] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-[#2A2420]">Pedidos Recentes</h2>
            <p className="text-xs text-[#7A716A]">Últimas movimentações registradas</p>
          </div>
          <Link
            to="/pedidos"
            className="text-xs font-semibold text-[#C43A25] hover:text-[#A82F1D] flex items-center gap-1 p-1 hover:underline transition-all"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 && !loading ? (
          /* Empty state */
          <div className="py-14 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
              <BrandLogo variant="mark" className="w-14 h-14" />
            </div>
            <h3 className="text-lg font-bold text-[#2A2420]">Nenhum pedido registrado ainda</h3>
            <p className="text-sm text-[#7A716A] max-w-sm mt-1 mb-6">
              Comece cadastrando o primeiro pedido de distribuição de espetinhos para seus
              revendedores.
            </p>
            <Link
              to="/pedidos/novo"
              className="inline-flex items-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar primeiro pedido</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E7E1DA] bg-[#FAF8F5] text-[11px] font-semibold text-[#7A716A] uppercase tracking-wider">
                    <th className="py-3 px-5">Pedido</th>
                    <th className="py-3 px-5">Cliente / Revendedor</th>
                    <th className="py-3 px-5">Data</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Total</th>
                    <th className="py-3 px-5 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE4]">
                  {recentOrders.map((order) => {
                    const client = order.expand?.client
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#FAF8F5] transition-colors group cursor-pointer"
                        onClick={() => (window.location.href = `/pedidos/${order.id}`)}
                      >
                        <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#2A2420]">
                          #{order.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-[#2A2420]">
                            {client?.name || 'Cliente não identificado'}
                          </div>
                          <div className="text-xs text-[#7A716A]">
                            {client?.address_region || client?.phone || ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-[#7A716A]">
                          {formatDate(order.created)}
                        </td>
                        <td className="py-3.5 px-5">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-[#2A2420]">
                          {formatCurrency(order.total)}
                        </td>
                        <td
                          className="py-3.5 px-5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            to={`/pedidos/${order.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#7A716A] hover:text-[#C43A25] hover:bg-[#FCE9E4] transition-colors"
                            title="Ver detalhes do pedido"
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

            {/* Mobile Stacked Cards */}
            <div className="md:hidden divide-y divide-[#F0EBE4]">
              {recentOrders.map((order) => {
                const client = order.expand?.client
                return (
                  <Link
                    key={order.id}
                    to={`/pedidos/${order.id}`}
                    className="p-4 block hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-semibold text-[#7A716A]">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="font-semibold text-sm text-[#2A2420] mb-0.5">
                      {client?.name || 'Cliente não identificado'}
                    </div>
                    <div className="text-xs text-[#7A716A] mb-3">
                      {client?.address_region || client?.phone || ''}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE4] text-xs">
                      <span className="text-[#7A716A]">{formatDate(order.created)}</span>
                      <span className="font-mono font-bold text-sm text-[#2A2420]">
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

      {/* Quick operational guide */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#FCE9E4]/60 border border-[#C43A25]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#C43A25] text-white shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#2A2420]">
              Fluxo Operacional Central Espetinhos
            </h4>
            <p className="text-xs text-[#7A716A] mt-0.5 leading-relaxed">
              Mantenha os produtos com preço atualizado, cadastre seus revendedores e lance os
              pedidos para controlar o status de produção e entrega de cada lote de espetinhos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link
            to="/produtos"
            className="flex-1 sm:flex-none text-center px-3 py-2 text-xs font-semibold bg-white text-[#2A2420] border border-[#E7E1DA] hover:border-[#C43A25] rounded-lg transition-colors"
          >
            Catálogo
          </Link>
          <Link
            to="/clientes"
            className="flex-1 sm:flex-none text-center px-3 py-2 text-xs font-semibold bg-white text-[#2A2420] border border-[#E7E1DA] hover:border-[#C43A25] rounded-lg transition-colors"
          >
            Revendedores
          </Link>
        </div>
      </div>
    </div>
  )
}
