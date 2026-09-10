import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Eye,
  Loader2,
  X,
  Users,
  Phone,
  MapPin,
  Check,
  FileText,
} from 'lucide-react'
import { getClients, createClient, updateClient, toggleClientStatus } from '@/services/clients'
import { useRealtime } from '@/hooks/use-realtime'
import { ActiveStatusBadge } from '@/components/StatusBadges'
import { useToast } from '@/hooks/use-toast'
import type { Client, ClientType } from '@/types'

const CLIENT_TYPES: ClientType[] = ['Ambulante', 'Barraqueiro', 'Comerciante', 'Outros']

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'Ambulante' as ClientType,
    address_region: '',
    notes: '',
    active: true,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const list = await getClients()
      setClients(list)
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os clientes/revendedores.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('clients', () => {
    loadData()
  })

  // Filtered list
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const s = searchTerm.toLowerCase()
      const matchesSearch =
        c.name.toLowerCase().includes(s) ||
        c.phone.toLowerCase().includes(s) ||
        c.address_region.toLowerCase().includes(s)

      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Ativos' && c.active) ||
        (statusFilter === 'Inativos' && !c.active)

      return matchesSearch && matchesStatus
    })
  }, [clients, searchTerm, statusFilter])

  // Open Create
  const handleOpenCreate = () => {
    setSelectedClient(null)
    setFormData({
      name: '',
      phone: '',
      type: 'Ambulante',
      address_region: '',
      notes: '',
      active: true,
    })
    setErrors({})
    setModalMode('create')
    setIsModalOpen(true)
  }

  // Open Edit
  const handleOpenEdit = (c: Client) => {
    setSelectedClient(c)
    setFormData({
      name: c.name,
      phone: c.phone,
      type: c.type,
      address_region: c.address_region,
      notes: c.notes || '',
      active: c.active,
    })
    setErrors({})
    setModalMode('edit')
    setIsModalOpen(true)
  }

  // Open View
  const handleOpenView = (c: Client) => {
    setSelectedClient(c)
    setFormData({
      name: c.name,
      phone: c.phone,
      type: c.type,
      address_region: c.address_region,
      notes: c.notes || '',
      active: c.active,
    })
    setErrors({})
    setModalMode('view')
    setIsModalOpen(true)
  }

  // Toggle active/inactive with open-orders rule
  const handleToggle = async (c: Client, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleClientStatus(c.id, c.active)
      toast({
        title: c.active ? 'Cliente inativado' : 'Cliente ativado',
        description: `O revendedor "${c.name}" foi ${c.active ? 'inativado' : 'ativado'}.`,
      })
      loadData()
    } catch (err: unknown) {
      console.error('Erro ao alterar status:', err)
      const msg =
        err instanceof Error ? err.message : 'Não foi possível alterar o status do cliente.'
      toast({
        title: 'Ação não permitida',
        description: msg,
        variant: 'destructive',
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errs: { [key: string]: string } = {}
    if (!formData.name.trim()) {
      errs.name = 'Informe o nome do revendedor'
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Informe o telefone / WhatsApp'
    }
    if (!formData.address_region.trim()) {
      errs.address_region = 'Informe o endereço ou ponto de venda'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormSubmitting(true)
    try {
      if (modalMode === 'create') {
        await createClient({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          type: formData.type,
          address_region: formData.address_region.trim(),
          notes: formData.notes.trim() || undefined,
          active: formData.active,
        })
        toast({
          title: 'Cliente cadastrado!',
          description: `"${formData.name}" foi adicionado com sucesso.`,
        })
      } else if (modalMode === 'edit' && selectedClient) {
        await updateClient(selectedClient.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          type: formData.type,
          address_region: formData.address_region.trim(),
          notes: formData.notes.trim() || undefined,
          active: formData.active,
        })
        toast({
          title: 'Cliente atualizado!',
          description: `"${formData.name}" foi atualizado com sucesso.`,
        })
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Erro ao salvar cliente:', err)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar os dados do cliente.',
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A2420] tracking-tight">
            Clientes / Revendedores
          </h1>
          <p className="text-sm text-[#7A716A] mt-0.5">
            Ambulantes, barraqueiros, pontos de rua e pequenos comércios
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all w-full sm:w-auto text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Cliente</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E1DA] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A716A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou região..."
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
            <option value="Todos">Todos os clientes</option>
            <option value="Ativos">Apenas Ativos</option>
            <option value="Inativos">Apenas Inativos</option>
          </select>
        </div>
      </div>

      {/* Clients Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C43A25]" />
          <p className="text-sm text-[#7A716A]">Carregando revendedores...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E7E1DA] p-12 text-center">
          <Users className="w-12 h-12 text-[#7A716A]/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#2A2420]">Nenhum revendedor encontrado</h3>
          <p className="text-sm text-[#7A716A] mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'Todos'
              ? 'Tente ajustar os filtros ou os termos pesquisados.'
              : 'Cadastre os ambulantes e barraqueiros que compram seus espetinhos.'}
          </p>
          {!searchTerm && statusFilter === 'Todos' && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar cliente</span>
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
                  <th className="py-3 px-5">Nome</th>
                  <th className="py-3 px-5">Telefone / WhatsApp</th>
                  <th className="py-3 px-5">Tipo</th>
                  <th className="py-3 px-5">Endereço / Região</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE4]">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                    onClick={() => handleOpenView(client)}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#2A2420] group-hover:text-[#C43A25] transition-colors">
                        {client.name}
                      </div>
                      {client.notes && (
                        <div className="text-xs text-[#7A716A] truncate max-w-xs">
                          {client.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs text-[#2A2420]">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{client.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E7E1DA] text-xs font-medium text-[#2A2420]">
                        {client.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-[#7A716A]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#7A716A]" />
                        <span className="truncate max-w-xs">{client.address_region}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <ActiveStatusBadge active={client.active} />
                    </td>
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Active */}
                        <button
                          type="button"
                          onClick={(e) => handleToggle(client, e)}
                          title={client.active ? 'Inativar revendedor' : 'Ativar revendedor'}
                          className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                            client.active
                              ? 'bg-stone-50 border-[#E7E1DA] text-[#7A716A] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {client.active ? 'Desativar' : 'Ativar'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(client)}
                          title="Editar revendedor"
                          className="p-1.5 rounded-lg text-[#7A716A] hover:text-[#2A2420] hover:bg-[#F6F3EF] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenView(client)}
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
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleOpenView(client)}
                className="bg-white p-4 rounded-xl border border-[#E7E1DA] shadow-xs active:bg-[#FAF8F5] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#2A2420]">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E7E1DA] text-[#2A2420] font-medium">
                        {client.type}
                      </span>
                    </div>
                  </div>
                  <ActiveStatusBadge active={client.active} />
                </div>

                <div className="space-y-1 my-2 text-xs text-[#7A716A]">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono text-[#2A2420]">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{client.address_region}</span>
                  </div>
                </div>

                <div
                  className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EBE4]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleToggle(client, e)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                      client.active
                        ? 'bg-stone-50 border-[#E7E1DA] text-[#7A716A]'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    {client.active ? 'Inativar' : 'Ativar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(client)}
                    className="p-1.5 rounded-lg border border-[#E7E1DA] text-[#2A2420] hover:bg-[#F6F3EF]"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
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
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#2A2420]">
                  {modalMode === 'create'
                    ? 'Novo Cliente / Revendedor'
                    : modalMode === 'edit'
                      ? 'Editar Revendedor'
                      : 'Detalhes do Revendedor'}
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
                  Nome Completo / Estabelecimento <span className="text-[#C43A25]">*</span>
                </label>
                <input
                  type="text"
                  disabled={modalMode === 'view' || formSubmitting}
                  placeholder="Ex: João da Silva (Ponto da Sé)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-white border ${
                    errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#E7E1DA]'
                  } rounded-lg px-3.5 py-2.5 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5]`}
                />
                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Telefone / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
                    Telefone / WhatsApp <span className="text-[#C43A25]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      disabled={modalMode === 'view' || formSubmitting}
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full bg-white border ${
                        errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#E7E1DA]'
                      } rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-[#2A2420] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5]`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                {/* Tipo de cliente */}
                <div>
                  <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
                    Tipo de Revendedor <span className="text-[#C43A25]">*</span>
                  </label>
                  <select
                    disabled={modalMode === 'view' || formSubmitting}
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as ClientType })
                    }
                    className="w-full bg-white border border-[#E7E1DA] rounded-lg px-3.5 py-2.5 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5]"
                  >
                    {CLIENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Endereço / Região */}
              <div>
                <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
                  Endereço ou Região / Ponto <span className="text-[#C43A25]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#7A716A] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    disabled={modalMode === 'view' || formSubmitting}
                    placeholder="Ex: Praça da Sé, Centro - São Paulo / SP"
                    value={formData.address_region}
                    onChange={(e) => setFormData({ ...formData, address_region: e.target.value })}
                    className={`w-full bg-white border ${
                      errors.address_region
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-[#E7E1DA]'
                    } rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5]`}
                  />
                </div>
                {errors.address_region && (
                  <p className="text-xs text-rose-600 mt-1">{errors.address_region}</p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-[#2A2420] uppercase tracking-wider mb-1.5">
                  Observações Gerais (Opcional)
                </label>
                <textarea
                  rows={3}
                  disabled={modalMode === 'view' || formSubmitting}
                  placeholder="Ex: Dias preferidos de entrega, restrições de horário, espetinhos mais vendidos..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-[#E7E1DA] rounded-lg px-3.5 py-2.5 text-sm text-[#2A2420] focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] disabled:bg-[#FAF8F5]"
                />
              </div>

              {/* Status Toggle */}
              {modalMode !== 'view' && (
                <div className="pt-2 flex items-center justify-between p-3 rounded-lg bg-[#FAF8F5] border border-[#E7E1DA]">
                  <div>
                    <span className="text-sm font-semibold text-[#2A2420] block">
                      Cliente Ativo
                    </span>
                    <span className="text-xs text-[#7A716A]">
                      Habilitado para pedidos e entregas
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
                        <span>Salvar Cliente</span>
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
