import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  Beef,
  DollarSign,
  AlertCircle,
  Loader2,
  Check,
  UserPlus,
  X,
} from 'lucide-react'
import { getClients, createClient } from '@/services/clients'
import { getProducts } from '@/services/products'
import { createOrder } from '@/services/orders'
import { formatCurrency } from '@/lib/formatters'
import { useToast } from '@/hooks/use-toast'
import type { Client, Product, ClientType } from '@/types'

interface OrderRowItem {
  id: string // temporary client id for react list
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

const CLIENT_TYPES: ClientType[] = ['Ambulante', 'Barraqueiro', 'Comerciante', 'Outros']

export default function NewOrderPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Order state
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [items, setItems] = useState<OrderRowItem[]>([])
  const [formErrors, setFormErrors] = useState<{ client?: string; items?: string }>({})

  // Quick Client Creation Modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [clientSubmitting, setClientSubmitting] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: '',
    phone: '',
    type: 'Ambulante' as ClientType,
    address_region: '',
    notes: '',
  })
  const [clientErrors, setClientErrors] = useState<{ [key: string]: string }>({})

  // Load active clients & active products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loadedClients, loadedProducts] = await Promise.all([
          getClients({ activeOnly: true }),
          getProducts({ activeOnly: true }),
        ])
        setClients(loadedClients)
        setProducts(loadedProducts)

        // Pre-add 1 empty row if products exist
        if (loadedProducts.length > 0) {
          const firstProduct = loadedProducts[0]
          setItems([
            {
              id: Math.random().toString(36).substring(2, 9),
              productId: firstProduct.id,
              quantity: 20,
              unitPrice: firstProduct.price,
              subtotal: 20 * firstProduct.price,
            },
          ])
        }
      } catch (err) {
        console.error('Erro ao carregar dados para o pedido:', err)
        toast({
          title: 'Erro ao inicializar',
          description: 'Não foi possível carregar a lista de produtos ou clientes.',
          variant: 'destructive',
        })
      } finally {
        setLoadingInitial(false)
      }
    }

    fetchData()
  }, [toast])

  // Total order value
  const orderTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }, [items])

  // Selected client record
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId)
  }, [clients, selectedClientId])

  // Handle product selection change
  const handleProductChange = (rowIndex: number, newProductId: string) => {
    // Check if this product is already in another row
    const isDuplicate = items.some(
      (item, idx) => idx !== rowIndex && item.productId === newProductId,
    )
    if (isDuplicate) {
      toast({
        title: 'Produto já adicionado',
        description: 'Este espetinho já está no pedido. Ajuste a quantidade na linha existente.',
        variant: 'destructive',
      })
      return
    }

    const prod = products.find((p) => p.id === newProductId)
    const price = prod ? prod.price : 0

    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== rowIndex) return item
        const q = item.quantity || 1
        return {
          ...item,
          productId: newProductId,
          unitPrice: price,
          subtotal: q * price,
        }
      }),
    )
  }

  // Handle quantity change
  const handleQuantityChange = (rowIndex: number, newQuantity: number) => {
    const q = Math.max(1, newQuantity || 1)
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== rowIndex) return item
        return {
          ...item,
          quantity: q,
          subtotal: q * item.unitPrice,
        }
      }),
    )
  }

  // Handle unit price change (allows custom/override price)
  const handleUnitPriceChange = (rowIndex: number, newPrice: number) => {
    const p = Math.max(0, newPrice || 0)
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== rowIndex) return item
        return {
          ...item,
          unitPrice: p,
          subtotal: item.quantity * p,
        }
      }),
    )
  }

  // Add Item Row
  const handleAddItemRow = () => {
    // Find first product that is not already in items
    const availableProduct = products.find((p) => !items.some((i) => i.productId === p.id))
    if (!availableProduct) {
      toast({
        title: 'Todos os produtos já foram adicionados',
        description: 'Você já incluiu todos os espetinhos ativos no pedido.',
        variant: 'destructive',
      })
      return
    }

    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        productId: availableProduct.id,
        quantity: 10,
        unitPrice: availableProduct.price,
        subtotal: 10 * availableProduct.price,
      },
    ])
  }

  // Remove Item Row
  const handleRemoveItemRow = (rowIndex: number) => {
    if (items.length <= 1) {
      toast({
        title: 'Mínimo de 1 produto',
        description: 'O pedido precisa ter pelo menos um produto adicionado.',
      })
      return
    }
    setItems((prev) => prev.filter((_, idx) => idx !== rowIndex))
  }

  // Quick Create Client
  const handleQuickCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: { [key: string]: string } = {}
    if (!newClientData.name.trim()) errs.name = 'Informe o nome do revendedor'
    if (!newClientData.phone.trim()) errs.phone = 'Informe o telefone'
    if (!newClientData.address_region.trim()) errs.address_region = 'Informe a região ou endereço'
    setClientErrors(errs)
    if (Object.keys(errs).length > 0) return

    setClientSubmitting(true)
    try {
      const created = await createClient({
        name: newClientData.name.trim(),
        phone: newClientData.phone.trim(),
        type: newClientData.type,
        address_region: newClientData.address_region.trim(),
        notes: newClientData.notes.trim() || undefined,
        active: true,
      })
      setClients((prev) => [created, ...prev])
      setSelectedClientId(created.id)
      setIsClientModalOpen(false)
      toast({
        title: 'Revendedor cadastrado!',
        description: `"${created.name}" foi selecionado para este pedido.`,
      })
      // Reset
      setNewClientData({
        name: '',
        phone: '',
        type: 'Ambulante',
        address_region: '',
        notes: '',
      })
    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err)
      toast({
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o revendedor.',
        variant: 'destructive',
      })
    } finally {
      setClientSubmitting(false)
    }
  }

  // Submit Order
  const handleSubmitOrder = async () => {
    const errors: { client?: string; items?: string } = {}

    if (!selectedClientId) {
      errors.client = 'Selecione um cliente para o pedido'
    }

    if (items.length === 0) {
      errors.items = 'Adicione ao menos um produto'
    } else {
      // Validate duplicates
      const prodIds = items.map((it) => it.productId)
      const hasDuplicates = new Set(prodIds).size !== prodIds.length
      if (hasDuplicates) {
        errors.items = 'Existem produtos duplicados no pedido'
      }
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const newOrder = await createOrder({
        clientId: selectedClientId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal,
        })),
      })

      toast({
        title: 'Pedido registrado com sucesso!',
        description: `Pedido #${newOrder.id.slice(-6).toUpperCase()} criado no status Novo.`,
      })

      navigate(`/pedidos/${newOrder.id}`)
    } catch (err) {
      console.error('Erro ao salvar pedido:', err)
      toast({
        title: 'Erro ao registrar pedido',
        description: 'Verifique os dados informados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingInitial) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C43A25]" />
        <p className="text-sm text-[#7A716A]">Carregando catálogo e clientes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA]">
        <div className="flex items-center gap-3">
          <Link
            to="/pedidos"
            className="p-2 rounded-lg text-[#7A716A] hover:text-[#2A2420] hover:bg-white border border-[#E7E1DA] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2A2420] tracking-tight">Novo Pedido</h1>
            <p className="text-xs text-[#7A716A]">
              Lançamento de lote de espetinhos para revendedor
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Cliente */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#E7E1DA] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBE4]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#C43A25] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-bold text-base text-[#2A2420]">
                Selecionar Revendedor / Cliente
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsClientModalOpen(true)}
              className="text-xs font-semibold text-[#C43A25] hover:text-[#A82F1D] flex items-center gap-1 self-start sm:self-auto hover:underline"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Cadastrar novo revendedor</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
              Cliente cadastrado <span className="text-[#C43A25]">*</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value)
                setFormErrors((prev) => ({ ...prev, client: undefined }))
              }}
              className={`w-full bg-white border ${
                formErrors.client ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#E7E1DA]'
              } rounded-lg px-3.5 py-2.5 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25]`}
            >
              <option value="">-- Selecione o cliente / revendedor --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.type} ({c.address_region})
                </option>
              ))}
            </select>
            {formErrors.client && <p className="text-xs text-rose-600 mt-1">{formErrors.client}</p>}
          </div>

          {selectedClient && (
            <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E7E1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
              <div>
                <span className="font-semibold text-[#2A2420] text-sm block">
                  {selectedClient.name}
                </span>
                <span className="text-[#7A716A]">
                  {selectedClient.type} • {selectedClient.address_region}
                </span>
              </div>
              <div className="font-mono text-[#2A2420] font-medium bg-white px-3 py-1.5 rounded-md border border-[#E7E1DA] self-start sm:self-auto">
                {selectedClient.phone}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Itens do Pedido */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#E7E1DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE4]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#C43A25] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold text-base text-[#2A2420]">Itens de Espetinhos</h2>
            </div>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C43A25] bg-[#FCE9E4] hover:bg-[#fad4cc] rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Adicionar item</span>
            </button>
          </div>

          {formErrors.items && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formErrors.items}</span>
            </div>
          )}

          {/* Items dynamic list */}
          <div className="space-y-3">
            {items.map((row, index) => {
              const selectedProd = products.find((p) => p.id === row.productId)

              return (
                <div
                  key={row.id}
                  className="p-3.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5]/80 flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all"
                >
                  {/* Product select */}
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#7A716A] uppercase tracking-wider mb-1 md:hidden">
                      Produto
                    </label>
                    <select
                      value={row.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full bg-white border border-[#E7E1DA] rounded-lg px-3 py-2 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.weight_grams} g - {p.category}) — {formatCurrency(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 sm:flex items-center gap-2.5">
                    {/* Quantity */}
                    <div className="sm:w-28">
                      <label className="block text-[11px] font-semibold text-[#7A716A] uppercase tracking-wider mb-1 md:hidden">
                        Qtd
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          value={row.quantity}
                          onChange={(e) =>
                            handleQuantityChange(index, parseInt(e.target.value) || 1)
                          }
                          className="w-full bg-white border border-[#E7E1DA] rounded-lg px-2.5 py-2 text-sm text-center font-mono font-semibold text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25]"
                        />
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="sm:w-32">
                      <label className="block text-[11px] font-semibold text-[#7A716A] uppercase tracking-wider mb-1 md:hidden">
                        Unitário
                      </label>
                      <div className="relative">
                        <span className="text-xs text-[#7A716A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleUnitPriceChange(index, parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white border border-[#E7E1DA] rounded-lg pl-8 pr-2 py-2 text-sm font-mono text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25]"
                        />
                      </div>
                    </div>

                    {/* Subtotal (Read only) */}
                    <div className="sm:w-32">
                      <label className="block text-[11px] font-semibold text-[#7A716A] uppercase tracking-wider mb-1 md:hidden">
                        Subtotal
                      </label>
                      <div className="bg-white border border-[#E7E1DA] rounded-lg px-2.5 py-2 text-sm font-mono font-bold text-[#2A2420] text-right truncate">
                        {formatCurrency(row.subtotal)}
                      </div>
                    </div>

                    {/* Remove Action */}
                    <div className="col-span-3 sm:col-auto flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        title="Remover este produto"
                        className="p-2 text-[#7A716A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddItemRow}
              className="text-xs font-semibold text-[#C43A25] hover:text-[#A82F1D] flex items-center gap-1.5 p-1"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar outro tipo de espetinho</span>
            </button>
          </div>
        </div>

        {/* Step 3: Resumo e Fechamento */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#E7E1DA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0EBE4]">
            <span className="w-6 h-6 rounded-full bg-[#C43A25] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="font-bold text-base text-[#2A2420]">Resumo e Confirmação</h2>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#7A716A] block">
                Total do Pedido
              </span>
              <p className="text-xs text-[#7A716A]">
                {items.reduce((sum, it) => sum + it.quantity, 0)} espetinhos no total (
                {items.length} variedades)
              </p>
            </div>
            <div className="text-3xl font-extrabold text-[#C43A25] font-mono tracking-tight">
              {formatCurrency(orderTotal)}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EBE4]">
            <Link
              to="/pedidos"
              className="px-5 py-2.5 text-sm font-medium text-[#7A716A] hover:text-[#2A2420] transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] active:scale-[0.98] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando pedido...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Pedido</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Quick Create Client */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2A2420]/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => !clientSubmitting && setIsClientModalOpen(false)}
          />

          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E7E1DA] relative z-10 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E1DA] mb-4">
              <h3 className="font-bold text-base text-[#2A2420]">Novo Revendedor Rápido</h3>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-lg text-[#7A716A] hover:text-[#2A2420]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1">
                  Nome do Revendedor <span className="text-[#C43A25]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                  className={`w-full border ${
                    clientErrors.name ? 'border-rose-500' : 'border-[#E7E1DA]'
                  } rounded-lg px-3 py-2 text-sm text-[#2A2420] focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25]`}
                />
                {clientErrors.name && (
                  <p className="text-xs text-rose-600 mt-0.5">{clientErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1">
                  Telefone / WhatsApp <span className="text-[#C43A25]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                  className={`w-full border ${
                    clientErrors.phone ? 'border-rose-500' : 'border-[#E7E1DA]'
                  } rounded-lg px-3 py-2 text-sm text-[#2A2420] focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25]`}
                />
                {clientErrors.phone && (
                  <p className="text-xs text-rose-600 mt-0.5">{clientErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1">
                  Tipo
                </label>
                <select
                  value={newClientData.type}
                  onChange={(e) =>
                    setNewClientData({ ...newClientData, type: e.target.value as ClientType })
                  }
                  className="w-full border border-[#E7E1DA] rounded-lg px-3 py-2 text-sm text-[#2A2420] focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25]"
                >
                  {CLIENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1">
                  Endereço / Região <span className="text-[#C43A25]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Centro - Ponto Praça da Sé"
                  value={newClientData.address_region}
                  onChange={(e) =>
                    setNewClientData({ ...newClientData, address_region: e.target.value })
                  }
                  className={`w-full border ${
                    clientErrors.address_region ? 'border-rose-500' : 'border-[#E7E1DA]'
                  } rounded-lg px-3 py-2 text-sm text-[#2A2420] focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25]`}
                />
                {clientErrors.address_region && (
                  <p className="text-xs text-rose-600 mt-0.5">{clientErrors.address_region}</p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E7E1DA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#7A716A] hover:text-[#2A2420]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={clientSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#C43A25] hover:bg-[#A82F1D] rounded-lg disabled:opacity-60"
                >
                  {clientSubmitting ? 'Salvando...' : 'Cadastrar e Selecionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
