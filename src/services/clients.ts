import pb from '@/lib/pocketbase/client'
import type { Client, ClientType } from '@/types'

export interface CreateClientDTO {
  name: string
  phone: string
  type: ClientType
  address_region: string
  notes?: string
  active?: boolean
}

export interface UpdateClientDTO {
  name?: string
  phone?: string
  type?: ClientType
  address_region?: string
  notes?: string
  active?: boolean
}

export const getClients = async (options?: {
  activeOnly?: boolean
  search?: string
}): Promise<Client[]> => {
  const filters: string[] = []

  if (options?.activeOnly) {
    filters.push('active = true')
  }

  if (options?.search) {
    const s = options.search.replace(/"/g, '\\"')
    filters.push(`(name ~ "${s}" || phone ~ "${s}")`)
  }

  const filter = filters.length > 0 ? filters.join(' && ') : ''

  return pb.collection('clients').getFullList<Client>({
    filter,
    sort: 'name',
    requestKey: null,
  })
}

export const getClientById = async (id: string): Promise<Client> => {
  return pb.collection('clients').getOne<Client>(id, { requestKey: null })
}

export const createClient = async (data: CreateClientDTO): Promise<Client> => {
  return pb.collection('clients').create<Client>(
    {
      ...data,
      active: data.active ?? true,
    },
    { requestKey: null },
  )
}

export const updateClient = async (id: string, data: UpdateClientDTO): Promise<Client> => {
  return pb.collection('clients').update<Client>(id, data, { requestKey: null })
}

export const toggleClientStatus = async (id: string, currentStatus: boolean): Promise<Client> => {
  // Check if client has active open orders before deactivating
  if (currentStatus) {
    const openOrders = await pb.collection('orders').getList(1, 1, {
      filter: `client = "${id}" && (status = "Novo" || status = "Em preparação" || status = "Pronto")`,
      requestKey: null,
    })
    if (openOrders.totalItems > 0) {
      throw new Error('Não é possível inativar: cliente possui pedidos em aberto')
    }
  }

  return pb
    .collection('clients')
    .update<Client>(id, { active: !currentStatus }, { requestKey: null })
}
