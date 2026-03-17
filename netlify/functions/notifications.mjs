import { getStore } from '@netlify/blobs'

const DEFAULT_NOTIFICATION = {
  title: 'নতুন অফার!',
  content: 'Weekly Lite শুধু ৫০ টাকা! এখনই অর্ডার করুন 💎',
  enabled: true,
}

async function verifyAdmin(req) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  const store = getStore('admin-sessions')
  const session = await store.get(token, { type: 'text' })
  return !!session
}

export default async (req) => {
  const store = getStore({ name: 'settings', consistency: 'strong' })

  if (req.method === 'GET') {
    const notification = await store.get('notification', { type: 'json' })
    return Response.json(notification || DEFAULT_NOTIFICATION)
  }

  if (req.method === 'PUT') {
    if (!(await verifyAdmin(req))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const notification = await req.json()
    await store.setJSON('notification', notification)
    return Response.json({ success: true })
  }

  return new Response('Method not allowed', { status: 405 })
}

export const config = {
  path: '/api/notifications',
  method: ['GET', 'PUT'],
}
