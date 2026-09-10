import pb from '@/lib/pocketbase/client'
import type { Order, OrderItem, OrderStatus } from '@/types'

export interface CreateOrderItemInput {
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CreateOrderDTO {
  clientId: string
  items: CreateOrderItemInput[]
}

export const getOrders = async (options?: {
  status?: string
  search?: string
}): Promise<Order[]> => {
  const filters: string[] = []

  if (options?.status && options.status !== 'Todos') {
    filters.push(`status = "${options.status}"`)
  }

  const filter = filters.length > 0 ? filters.join(' && ') : ''

  return pb.collection('orders').getFullList<Order>({
    filter,
    sort: '-created',
    expand: 'client',
    requestKey: null,
  })
}

export const getOrderById = async (id: string): Promise<{ order: Order; items: OrderItem[] }> => {
  const order = await pb.collection('orders').getOne<Order>(id, {
    expand: 'client',
    requestKey: null,
  })

  const items = await pb.collection('order_items').getFullList<OrderItem>({
    filter: `order = "${id}"`,
    expand: 'product',
    sort: 'created',
    requestKey: null,
  })

  return { order, items }
}

export const getOrderItemsForOrders = async (orderIds: string[]): Promise<OrderItem[]> => {
  if (orderIds.length === 0) return []
  const filter = orderIds.map((id) => `order = "${id}"`).join(' || ')
  return pb.collection('order_items').getFullList<OrderItem>({
    filter,
    expand: 'product',
    requestKey: null,
  })
}

export const createOrder = async (data: CreateOrderDTO): Promise<Order> => {
  if (!data.clientId) {
    throw new Error('Cliente é obrigatório')
  }
  if (!data.items || data.items.length === 0) {
    throw new Error('O pedido deve conter pelo menos um item')
  }

  const total = data.items.reduce((sum, item) => sum + item.subtotal, 0)

  // 1. Create order record
  const order = await pb.collection('orders').create<Order>(
    {
      client: data.clientId,
      status: 'Novo',
      total,
    },
    { requestKey: null },
  )

  // 2. Create order items
  for (const item of data.items) {
    await pb.collection('order_items').create(
      {
        order: order.id,
        product: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
      },
      { requestKey: null },
    )
  }

  return order
}

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  return pb.collection('orders').update<Order>(
    orderId,
    { status },
    {
      expand: 'client',
      requestKey: null,
    },
  )
}
