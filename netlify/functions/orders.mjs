import { getStore } from '@netlify/blobs'

async function verifyAdmin(req) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  const store = getStore('admin-sessions')
  const session = await store.get(token, { type: 'text' })
  return !!session
}

export default async (req) => {
  const store = getStore({ name: 'orders', consistency: 'strong' })

  if (req.method === 'POST') {
    const order = await req.json()
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const orderData = {
      ...order,
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    await store.setJSON(orderId, orderData)

    const orderList = (await store.get('order-list', { type: 'json' })) || []
    orderList.unshift(orderId)
    await store.setJSON('order-list', orderList)

    return Response.json({ success: true, orderId })
  }

  if (req.method === 'GET') {
    if (!(await verifyAdmin(req))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const orderList = (await store.get('order-list', { type: 'json' })) || []
    const orders = []
    for (const orderId of orderList.slice(0, 100)) {
      const order = await store.get(orderId, { type: 'json' })
      if (order) orders.push(order)
    }
    return Response.json(orders)
  }

  return new Response('Method not allowed', { status: 405 })
}

export const config = {
  path: '/api/orders',
  method: ['GET', 'POST'],
}
