migrate(
  (app) => {
    // 1. Seed Auth User
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'leoprocaci@gmail.com')
    } catch (_) {
      adminUser = new Record(users)
      adminUser.setEmail('leoprocaci@gmail.com')
      adminUser.setPassword('Skip@Pass')
      adminUser.setVerified(true)
      adminUser.set('name', 'Leonardo Procaci')
      app.save(adminUser)
    }

    // 2. Seed Products
    const productsCol = app.findCollectionByNameOrId('products')
    const sampleProducts = [
      { name: 'Espetinho Bovino', category: 'Bovino', weight_grams: 100, price: 7.5, active: true },
      {
        name: 'Espetinho de Frango',
        category: 'Frango',
        weight_grams: 100,
        price: 7.0,
        active: true,
      },
      { name: 'Kafta', category: 'Kafta', weight_grams: 100, price: 8.0, active: true },
      { name: 'Churrasco Grego', category: 'Outros', weight_grams: 100, price: 9.0, active: true },
    ]

    const productRecords = {}
    for (const p of sampleProducts) {
      try {
        const existing = app.findFirstRecordByData('products', 'name', p.name)
        productRecords[p.name] = existing
      } catch (_) {
        const rec = new Record(productsCol)
        rec.set('name', p.name)
        rec.set('category', p.category)
        rec.set('weight_grams', p.weight_grams)
        rec.set('price', p.price)
        rec.set('active', p.active)
        app.save(rec)
        productRecords[p.name] = rec
      }
    }

    // 3. Seed Clients
    const clientsCol = app.findCollectionByNameOrId('clients')
    const sampleClients = [
      {
        name: 'João da Silva',
        phone: '(11) 98765-4321',
        type: 'Ambulante',
        address_region: 'Região Centro - Ponto Praça da Sé',
        notes: 'Pede semanalmente toda terça-feira. Prefere bovino e kafta.',
        active: true,
      },
      {
        name: 'Maria Santos',
        phone: '(11) 99876-5432',
        type: 'Barraqueiro',
        address_region: 'Região Norte - Feira da Vila Maria',
        notes: 'Trabalha com combo frango e grego aos finais de semana.',
        active: true,
      },
      {
        name: 'Padaria do Zé',
        phone: '(11) 97654-3210',
        type: 'Comerciante',
        address_region: 'Região Sul - Av. Santo Amaro, 1420',
        notes: 'Vende no happy hour do balcão. Entrega no período da manhã.',
        active: true,
      },
    ]

    const clientRecords = {}
    for (const c of sampleClients) {
      try {
        const existing = app.findFirstRecordByData('clients', 'name', c.name)
        clientRecords[c.name] = existing
      } catch (_) {
        const rec = new Record(clientsCol)
        rec.set('name', c.name)
        rec.set('phone', c.phone)
        rec.set('type', c.type)
        rec.set('address_region', c.address_region)
        rec.set('notes', c.notes)
        rec.set('active', c.active)
        app.save(rec)
        clientRecords[c.name] = rec
      }
    }

    // 4. Seed Orders & Order Items
    const ordersCol = app.findCollectionByNameOrId('orders')
    const orderItemsCol = app.findCollectionByNameOrId('order_items')

    // Check if we already have orders
    const existingOrders = app.findRecordsByFilter('orders', '', '-created', 1, 0)
    if (existingOrders.length === 0) {
      // Order 1: João da Silva (Novo)
      // 30 espetinhos bovinos (30 * 7.50 = 225.00) + 20 kaftas (20 * 8.00 = 160.00) = 385.00
      if (
        clientRecords['João da Silva'] &&
        productRecords['Espetinho Bovino'] &&
        productRecords['Kafta']
      ) {
        const order1 = new Record(ordersCol)
        order1.set('client', clientRecords['João da Silva'].id)
        order1.set('status', 'Novo')
        order1.set('total', 385.0)
        app.save(order1)

        const item1 = new Record(orderItemsCol)
        item1.set('order', order1.id)
        item1.set('product', productRecords['Espetinho Bovino'].id)
        item1.set('quantity', 30)
        item1.set('unit_price', 7.5)
        item1.set('subtotal', 225.0)
        app.save(item1)

        const item2 = new Record(orderItemsCol)
        item2.set('order', order1.id)
        item2.set('product', productRecords['Kafta'].id)
        item2.set('quantity', 20)
        item2.set('unit_price', 8.0)
        item2.set('subtotal', 160.0)
        app.save(item2)
      }

      // Order 2: Maria Santos (Em preparação)
      // 40 espetinhos de frango (40 * 7.00 = 280.00) + 15 churrasco grego (15 * 9.00 = 135.00) = 415.00
      if (
        clientRecords['Maria Santos'] &&
        productRecords['Espetinho de Frango'] &&
        productRecords['Churrasco Grego']
      ) {
        const order2 = new Record(ordersCol)
        order2.set('client', clientRecords['Maria Santos'].id)
        order2.set('status', 'Em preparação')
        order2.set('total', 415.0)
        app.save(order2)

        const item3 = new Record(orderItemsCol)
        item3.set('order', order2.id)
        item3.set('product', productRecords['Espetinho de Frango'].id)
        item3.set('quantity', 40)
        item3.set('unit_price', 7.0)
        item3.set('subtotal', 280.0)
        app.save(item3)

        const item4 = new Record(orderItemsCol)
        item4.set('order', order2.id)
        item4.set('product', productRecords['Churrasco Grego'].id)
        item4.set('quantity', 15)
        item4.set('unit_price', 9.0)
        item4.set('subtotal', 135.0)
        app.save(item4)
      }
    }
  },
  (app) => {
    // Rollback seeded records if needed
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'leoprocaci@gmail.com')
      app.delete(user)
    } catch (_) {}
  },
)
