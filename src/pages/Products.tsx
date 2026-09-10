import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Eye,
  Loader2,
  AlertCircle,
  X,
  Beef,
  Scale,
  DollarSign,
  Check,
} from 'lucide-react'
import { getProducts, createProduct, updateProduct, toggleProductStatus } from '@/services/products'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency } from '@/lib/formatters'
import { ActiveStatusBadge } from '@/components/StatusBadges'
import { useToast } from '@/hooks/use-toast'
import type { Product, ProductCategory } from '@/types'

const CATEGORIES: ProductCategory[] = ['Bovino', 'Frango', 'Suíno', 'Kafta', 'Linguiça', 'Outros']

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos')
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bovino' as ProductCategory,
    weight_grams: 100,
    price: 0,
    active: true,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const list = await getProducts()
      setProducts(list)
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os produtos do sistema.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('products', () => {
    loadData()
  })

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search by name
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Ativos' && p.active) ||
        (statusFilter === 'Inativos' && !p.active)

      // Category filter
      const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [products, searchTerm, statusFilter, categoryFilter])

  // Open modal for Create
  const handleOpenCreate = () => {
    setSelectedProduct(null)
    setFormData({
      name: '',
      category: 'Bovino',
      weight_grams: 100,
      price: 0,
      active: true,
    })
    setErrors({})
    setModalMode('create')
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEdit = (p: Product) => {
    setSelectedProduct(p)
    setFormData({
      name: p.name,
      category: p.category,
      weight_grams: p.weight_grams,
      price: p.price,
      active: p.active,
    })
    setErrors({})
    setModalMode('edit')
    setIsModalOpen(true)
  }

  // Open modal for View
  const handleOpenView = (p: Product) => {
    setSelectedProduct(p)
    setFormData({
      name: p.name,
      category: p.category,
      weight_grams: p.weight_grams,
      price: p.price,
      active: p.active,
    })
    setErrors({})
    setModalMode('view')
    setIsModalOpen(true)
  }

  // Toggle active/inactive
  const handleToggle = async (p: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleProductStatus(p.id, p.active)
      toast({
        title: p.active ? 'Produto inativado' : 'Produto ativado',
        description: `O produto "${p.name}" foi ${p.active ? 'inativado' : 'ativado'} com sucesso.`,
      })
      loadData()
    } catch (err) {
      console.error('Erro ao alterar status:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do produto.',
        variant: 'destructive',
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errs: { [key: string]: string } = {}
    if (!formData.name.trim()) {
      errs.name = 'Informe o nome do produto'
    }
    if (!formData.weight_grams || formData.weight_grams < 1) {
      errs.weight_grams = 'Informe o peso em gramas (mínimo 1 g)'
    }
    if (formData.price === undefined || formData.price < 0 || isNaN(formData.price)) {
      errs.price = 'Informe um preço válido (mínimo R$ 0,00)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Save (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormSubmitting(true)
    try {
      if (modalMode === 'create') {
        await createProduct({
          name: formData.name.trim(),
          category: formData.category,
          weight_grams: Number(formData.weight_grams),
          price: Number(formData.price),
          active: formData.active,
        })
        toast({
          title: 'Produto criado!',
          description: `"${formData.name}" foi cadastrado com sucesso.`,
        })
      } else if (modalMode === 'edit' && selectedProduct) {
        await updateProduct(selectedProduct.id, {
          name: formData.name.trim(),
          category: formData.category,
          weight_grams: Number(formData.weight_grams),
          price: Number(formData.price),
          active: formData.active,
        })
        toast({
          title: 'Produto atualizado!',
          description: `"${formData.name}" foi salvo com sucesso.`,
        })
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o produto.',
        variant: 'destructive',
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E1DA]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A2420] tracking-tight">Produtos</h1>
          <p className="text-sm text-[#7A716A] mt-0.5">
            Catálogo de espetinhos padronizados, pesos e preços de venda
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all w-full sm:w-auto text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Produto</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E1DA] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A716A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome do produto..."
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
            onChange={(e) => setStatusFilter(e.target.value as 'Todos' | 'Ativos' | 'Inativos')}
            className="bg-white border border-[#E7E1DA] rounded-lg px-3 py-2 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] transition-all"
          >
            <option value="Todos">Todos os status</option>
            <option value="Ativos">Apenas Ativos</option>
            <option value="Inativos">Apenas Inativos</option>
          </select>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#7A716A] uppercase tracking-wider shrink-0 hidden sm:inline">
            Categoria:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-[#E7E1DA] rounded-lg px-3 py-2 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] transition-all"
          >
            <option value="Todos">Todas categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C43A25]" />
          <p className="text-sm text-[#7A716A]">Carregando produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E7E1DA] p-12 text-center">
          <Beef className="w-12 h-12 text-[#7A716A]/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#2A2420]">Nenhum produto encontrado</h3>
          <p className="text-sm text-[#7A716A] mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'Todos' || categoryFilter !== 'Todos'
              ? 'Tente ajustar os filtros ou a busca acima.'
              : 'Comece adicionando seu primeiro espetinho no catálogo.'}
          </p>
          {!searchTerm && statusFilter === 'Todos' && categoryFilter === 'Todos' && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar produto</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E7E1DA] shadow-xs overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7E1DA] bg-[#FAF8F5] text-[11px] font-semibold text-[#7A716A] uppercase tracking-wider">
                  <th className="py-3 px-5">Produto</th>
                  <th className="py-3 px-5">Categoria</th>
                  <th className="py-3 px-5">Peso</th>
                  <th className="py-3 px-5">Preço Unitário</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE4]">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                    onClick={() => handleOpenView(product)}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#2A2420] group-hover:text-[#C43A25] transition-colors">
                        {product.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E7E1DA] text-xs font-medium text-[#2A2420]">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-[#7A716A] font-mono font-medium">
                      {product.weight_grams} g
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-[#2A2420]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-3.5 px-5">
                      <ActiveStatusBadge active={product.active} />
                    </td>
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Active Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggle(product, e)}
                          title={product.active ? 'Desativar produto' : 'Ativar produto'}
                          className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                            product.active
                              ? 'bg-stone-50 border-[#E7E1DA] text-[#7A716A] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {product.active ? 'Desativar' : 'Ativar'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          title="Editar produto"
                          className="p-1.5 rounded-lg text-[#7A716A] hover:text-[#2A2420] hover:bg-[#F6F3EF] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenView(product)}
                          title="Visualizar detalhes"
                          className="p-1.5 rounded-lg text-[#7A716A] hover:text-[#C43A25] hover:bg-[#FCE9E4] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleOpenView(product)}
                className="bg-white p-4 rounded-xl border border-[#E7E1DA] shadow-xs active:bg-[#FAF8F5] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#2A2420]">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E7E1DA] text-[#2A2420] font-medium">
                        {product.category}
                      </span>
                      <span className="text-xs text-[#7A716A] font-mono">
                        {product.weight_grams} g
                      </span>
                    </div>
                  </div>
                  <ActiveStatusBadge active={product.active} />
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F0EBE4]">
                  <div>
                    <span className="text-[10px] text-[#7A716A] uppercase font-semibold block">
                      Preço de venda
                    </span>
                    <span className="font-mono font-bold text-base text-[#2A2420]">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleToggle(product, e)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                        product.active
                          ? 'bg-stone-50 border-[#E7E1DA] text-[#7A716A]'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      {product.active ? 'Inativar' : 'Ativar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 rounded-lg border border-[#E7E1DA] text-[#2A2420] hover:bg-[#F6F3EF]"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Form (Create / Edit / View) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2A2420]/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => !formSubmitting && setIsModalOpen(false)}
          />

          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E7E1DA] relative z-10 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E1DA] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FCE9E4] flex items-center justify-center text-[#C43A25]">
                  <Beef className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#2A2420]">
                  {modalMode === 'create'
                    ? 'Novo Produto'
                    : modalMode === 'edit'
                      ? 'Editar Produto'
                      : 'Detalhes do Produto'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={formSubmitting}
                className="p-1 rounded-lg text-[#7A716A] hover:text-[#2A2420] hover:bg-[#F6F3EF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
                  Nome do Produto <span className="text-[#C43A25]">*</span>
                </label>
                <input
                  type="text"
                  disabled={modalMode === 'view' || formSubmitting}
                  placeholder="Ex: Espetinho Bovino Especial"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-white border ${
                    errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#E7E1DA]'
                  } rounded-lg px-3.5 py-2.5 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5] disabled:text-[#7A716A]`}
                />
                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
                  Categoria <span className="text-[#C43A25]">*</span>
                </label>
                <select
                  disabled={modalMode === 'view' || formSubmitting}
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ProductCategory })
                  }
                  className="w-full bg-white border border-[#E7E1DA] rounded-lg px-3.5 py-2.5 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Peso em gramas */}
                <div>
                  <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
                    Peso em Gramas <span className="text-[#C43A25]">*</span>
                  </label>
                  <div className="relative">
                    <Scale className="w-4 h-4 text-[#7A716A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      disabled={modalMode === 'view' || formSubmitting}
                      value={formData.weight_grams}
                      onChange={(e) =>
                        setFormData({ ...formData, weight_grams: Number(e.target.value) })
                      }
                      className={`w-full bg-white border ${
                        errors.weight_grams
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-[#E7E1DA]'
                      } rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-[#2A2420] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5]`}
                    />
                  </div>
                  {errors.weight_grams && (
                    <p className="text-xs text-rose-600 mt-1">{errors.weight_grams}</p>
                  )}
                </div>

                {/* Preço de venda */}
                <div>
                  <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
                    Preço de Venda (R$) <span className="text-[#C43A25]">*</span>
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-[#7A716A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      disabled={modalMode === 'view' || formSubmitting}
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-full bg-white border ${
                        errors.price ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#E7E1DA]'
                      } rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-[#2A2420] font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5]`}
                    />
                  </div>
                  {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
                </div>
              </div>

              {/* Status Toggle */}
              {modalMode !== 'view' && (
                <div className="pt-2 flex items-center justify-between p-3 rounded-lg bg-[#FAF8F5] border border-[#E7E1DA]">
                  <div>
                    <span className="text-sm font-semibold text-[#2A2420] block">
                      Produto Ativo
                    </span>
                    <span className="text-xs text-[#7A716A]">
                      Disponível para seleção em novos pedidos
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.active ? 'bg-[#C43A25]' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E7E1DA] flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={formSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-[#2A2420] hover:bg-[#F6F3EF] rounded-lg transition-colors"
                >
                  {modalMode === 'view' ? 'Fechar' : 'Cancelar'}
                </button>

                {modalMode === 'view' ? (
                  <button
                    type="button"
                    onClick={() => setModalMode('edit')}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#C43A25] hover:bg-[#A82F1D] rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C43A25] hover:bg-[#A82F1D] active:scale-[0.98] rounded-lg transition-all disabled:opacity-60"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Salvar Produto</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
