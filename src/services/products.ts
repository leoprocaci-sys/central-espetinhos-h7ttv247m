import pb from '@/lib/pocketbase/client'
import type { Product, ProductCategory } from '@/types'

export interface CreateProductDTO {
  name: string
  category: ProductCategory
  weight_grams: number
  price: number
  active?: boolean
}

export interface UpdateProductDTO {
  name?: string
  category?: ProductCategory
  weight_grams?: number
  price?: number
  active?: boolean
}

export const getProducts = async (options?: {
  activeOnly?: boolean
  search?: string
  category?: string
}): Promise<Product[]> => {
  const filters: string[] = []

  if (options?.activeOnly) {
    filters.push('active = true')
  }

  if (options?.category && options.category !== 'Todos') {
    filters.push(`category = "${options.category}"`)
  }

  if (options?.search) {
    const s = options.search.replace(/"/g, '\\"')
    filters.push(`name ~ "${s}"`)
  }

  const filter = filters.length > 0 ? filters.join(' && ') : ''

  return pb.collection('products').getFullList<Product>({
    filter,
    sort: 'name',
    requestKey: null,
  })
}

export const getProductById = async (id: string): Promise<Product> => {
  return pb.collection('products').getOne<Product>(id, { requestKey: null })
}

export const createProduct = async (data: CreateProductDTO): Promise<Product> => {
  return pb.collection('products').create<Product>(
    {
      ...data,
      active: data.active ?? true,
    },
    { requestKey: null },
  )
}

export const updateProduct = async (id: string, data: UpdateProductDTO): Promise<Product> => {
  return pb.collection('products').update<Product>(id, data, { requestKey: null })
}

export const toggleProductStatus = async (id: string, currentStatus: boolean): Promise<Product> => {
  return pb
    .collection('products')
    .update<Product>(id, { active: !currentStatus }, { requestKey: null })
}
