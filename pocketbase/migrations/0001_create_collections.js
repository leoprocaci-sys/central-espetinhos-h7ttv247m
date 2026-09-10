migrate(
  (app) => {
    // 1. products collection
    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: ['Bovino', 'Frango', 'Suíno', 'Kafta', 'Linguiça', 'Outros'],
          maxSelect: 1,
        },
        { name: 'weight_grams', type: 'number', required: true, min: 1 },
        { name: 'price', type: 'number', required: true, min: 0 },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_products_active ON products (active)',
        'CREATE INDEX idx_products_category ON products (category)',
      ],
    })
    app.save(products)

    // 2. clients collection
    const clients = new Collection({
      name: 'clients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['Ambulante', 'Barraqueiro', 'Comerciante', 'Outros'],
          maxSelect: 1,
        },
        { name: 'address_region', type: 'text', required: true },
        { name: 'notes', type: 'text' },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_clients_active ON clients (active)',
        'CREATE INDEX idx_clients_name ON clients (name)',
        'CREATE INDEX idx_clients_phone ON clients (phone)',
      ],
    })
    app.save(clients)

    // 3. orders collection (references clients)
    const savedClients = app.findCollectionByNameOrId('clients')
    const orders = new Collection({
      name: 'orders',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'client',
          type: 'relation',
          required: true,
          collectionId: savedClients.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Novo', 'Em preparação', 'Pronto', 'Entregue', 'Cancelado'],
          maxSelect: 1,
        },
        { name: 'total', type: 'number', required: true, min: 0 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_orders_status ON orders (status)',
        'CREATE INDEX idx_orders_client ON orders (client)',
        'CREATE INDEX idx_orders_created ON orders (created DESC)',
      ],
    })
    app.save(orders)

    // 4. order_items collection (references orders and products)
    const savedOrders = app.findCollectionByNameOrId('orders')
    const savedProducts = app.findCollectionByNameOrId('products')
    const orderItems = new Collection({
      name: 'order_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'order',
          type: 'relation',
          required: true,
          collectionId: savedOrders.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'product',
          type: 'relation',
          required: true,
          collectionId: savedProducts.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'unit_price', type: 'number', required: true, min: 0 },
        { name: 'subtotal', type: 'number', required: true, min: 0 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_order_items_order ON order_items (order)',
        'CREATE INDEX idx_order_items_product ON order_items (product)',
      ],
    })
    app.save(orderItems)
  },
  (app) => {
    try {
      const orderItems = app.findCollectionByNameOrId('order_items')
      app.delete(orderItems)
    } catch (_) {}
    try {
      const orders = app.findCollectionByNameOrId('orders')
      app.delete(orders)
    } catch (_) {}
    try {
      const clients = app.findCollectionByNameOrId('clients')
      app.delete(clients)
    } catch (_) {}
    try {
      const products = app.findCollectionByNameOrId('products')
      app.delete(products)
    } catch (_) {}
  },
)
