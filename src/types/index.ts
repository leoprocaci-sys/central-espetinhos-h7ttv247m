export type ProductCategory = 'Bovino' | 'Frango' | 'Suíno' | 'Kafta' | 'Linguiça' | 'Outros'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  weight_grams: number
  price: number
  active: boolean
  created: string
  updated: string
}

export type ClientType = 'Ambulante' | 'Barraqueiro' | 'Comerciante' | 'Outros'

export interface Client {
  id: string
  name: string
  phone: string
  type: ClientType
  address_region: string
  notes?: string
  active: boolean
  created: string
  updated: string
}

export type OrderStatus = 'Novo' | 'Em preparação' | 'Pronto' | 'Entregue' | 'Cancelado'

export interface Order {
  id: string
  client: string
  status: OrderStatus
  total: number
  created: string
  updated: string
  expand?: {
    client?: Client
  }
}

export interface OrderItem {
  id: string
  order: string
  product: string
  quantity: number
  unit_price: number
  subtotal: number
  created: string
  updated: string
  expand?: {
    product?: Product
  }
}

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
}
