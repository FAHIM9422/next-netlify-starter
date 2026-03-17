import { getStore } from '@netlify/blobs'

const DEFAULT_PACKAGES = [
  { name: '25 Diamond', price: '25', diamond: '💎', desc: 'শুধু ২৫ টাকা' },
  { name: '50 Diamond', price: '50', diamond: '💎💎', desc: 'শুধু ৫০ টাকা' },
  { name: 'Weekly Lite', price: '50', icon: 'fas fa-calendar-day', desc: 'শুধু ৫০ টাকা', badge: 'নতুন!', variant: 'weekly-lite' },
  { name: '115 Diamond', price: '80', diamond: '💎💎💎', desc: 'শুধু ৮০ টাকা', badge: 'জনপ্রিয়' },
  { name: '240 Diamond', price: '160', diamond: '💎💎💎💎', desc: 'শুধু ১৬০ টাকা' },
  { name: '610 Diamond', price: '390', diamond: '💎×৬', desc: 'শুধু ৩৯০ টাকা' },
  { name: '1240 Diamond', price: '790', diamond: '💎×১২', desc: 'শুধু ৭৯০ টাকা' },
  { name: '2530 Diamond', price: '1560', diamond: '💎×২৫', desc: 'শুধু ১৫৬০ টাকা', badge: 'বেস্ট' },
  { name: 'Weekly Pack', price: '165', icon: 'fas fa-calendar-week', desc: 'শুধু ১৬৫ টাকা' },
  { name: 'Monthly Pack', price: '790', icon: 'fas fa-calendar-alt', desc: 'শুধু ৭৯০ টাকা' },
]

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
    const packages = await store.get('packages', { type: 'json' })
    return Response.json(packages || DEFAULT_PACKAGES)
  }

  if (req.method === 'PUT') {
    if (!(await verifyAdmin(req))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const packages = await req.json()
    await store.setJSON('packages', packages)
    return Response.json({ success: true })
  }

  return new Response('Method not allowed', { status: 405 })
}

export const config = {
  path: '/api/packages',
  method: ['GET', 'PUT'],
}
