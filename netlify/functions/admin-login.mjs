import { getStore } from '@netlify/blobs'

const ADMIN_USERNAME = 'FAHIMNILOY1515'
const ADMIN_PASSWORD = '0147896325'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { username, password } = await req.json()

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = btoa(`${ADMIN_USERNAME}:${Date.now()}`)
    const store = getStore('admin-sessions')
    await store.set(token, JSON.stringify({ username: ADMIN_USERNAME, createdAt: Date.now() }))

    return Response.json({ success: true, token })
  }

  return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
}

export const config = {
  path: '/api/admin/login',
  method: 'POST',
}
