import { getStore } from '@netlify/blobs'
import { verifyToken } from './auth'

function getVideosStore() {
  return getStore({ name: 'videos', siteID: process.env.SITE_ID || 'local', token: process.env.NETLIFY_AUTH_TOKEN || '' })
}

async function getVideos() {
  try {
    const store = getVideosStore()
    const data = await store.get('video-list', { type: 'json' })
    return data || []
  } catch {
    return []
  }
}

async function saveVideos(videos) {
  const store = getVideosStore()
  await store.setJSON('video-list', videos)
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const videos = await getVideos()
    return res.status(200).json(videos)
  }

  // All other methods require auth
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { title, youtubeUrl } = req.body
    if (!title || !youtubeUrl) {
      return res.status(400).json({ error: 'Title and YouTube URL are required' })
    }

    const videos = await getVideos()
    const newVideo = {
      id: Date.now().toString(),
      title,
      youtubeUrl,
      createdAt: new Date().toISOString()
    }
    videos.push(newVideo)
    await saveVideos(videos)
    return res.status(201).json(newVideo)
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
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

  return res.status(405).json({ error: 'Method not allowed' })
}
