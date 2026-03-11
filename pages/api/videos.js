import crypto from 'crypto'
import { getStore } from '@netlify/blobs'

const ADMIN_USER = 'FAHIM1515'
const ADMIN_PASS = '01533691811'
const SECRET = 'fahim9422-admin-panel-secret'
const STORE_NAME = 'videos'
const BLOB_KEY = 'video-list'

function generateToken() {
  return crypto.createHmac('sha256', SECRET).update(ADMIN_USER + ADMIN_PASS).digest('hex')
}

function parseCookies(cookieHeader) {
  const cookies = {}
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) cookies[name] = rest.join('=')
  })
  return cookies
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie || '')
  return cookies.admin_token === generateToken()
}

async function getVideos() {
  try {
    const store = getStore({ name: STORE_NAME, consistency: 'strong' })
    const data = await store.get(BLOB_KEY, { type: 'json' })
    return data || []
  } catch {
    return []
  }
}

async function saveVideos(videos) {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' })
  await store.setJSON(BLOB_KEY, videos)
}

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const videos = await getVideos()
    return res.status(200).json(videos)
  }

  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { title, youtubeUrl } = req.body || {}
    if (!title || !youtubeUrl) {
      return res.status(400).json({ error: 'Title and YouTube URL are required' })
    }
    const youtubeId = extractYouTubeId(youtubeUrl)
    if (!youtubeId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' })
    }
    const videos = await getVideos()
    const newVideo = {
      id: crypto.randomUUID(),
      title,
      youtubeId,
      addedAt: new Date().toISOString()
    }
    videos.push(newVideo)
    await saveVideos(videos)
    return res.status(201).json(newVideo)
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) {
      return res.status(400).json({ error: 'Video ID is required' })
    }
    const videos = await getVideos()
    const filtered = videos.filter(v => v.id !== id)
    if (filtered.length === videos.length) {
      return res.status(404).json({ error: 'Video not found' })
    }
    await saveVideos(filtered)
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
