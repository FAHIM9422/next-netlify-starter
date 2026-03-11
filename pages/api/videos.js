import { getStore } from '@netlify/blobs'
import { verifyToken } from './auth'

function getVideoStore() {
  return getStore({ name: 'videos', consistency: 'strong' })
}

export default async function handler(req, res) {
  // GET - public, returns all videos
  if (req.method === 'GET') {
    try {
      const store = getVideoStore()
      const videosData = await store.get('video-list')
      const videos = videosData ? JSON.parse(videosData) : []
      return res.status(200).json({ videos })
    } catch {
      return res.status(200).json({ videos: [] })
    }
  }

  // POST and DELETE require auth
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.slice(7)
  const user = verifyToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  const store = getVideoStore()

  if (req.method === 'POST') {
    const { title, youtubeUrl } = req.body

    if (!title || !youtubeUrl) {
      return res.status(400).json({ error: 'Title and YouTube URL are required' })
    }

    // Extract YouTube video ID
    const videoId = extractYouTubeId(youtubeUrl)
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' })
    }

    try {
      const videosData = await store.get('video-list')
      const videos = videosData ? JSON.parse(videosData) : []

      const newVideo = {
        id: Date.now().toString(),
        title,
        youtubeUrl,
        videoId,
        addedAt: new Date().toISOString(),
      }

      videos.unshift(newVideo)
      await store.set('video-list', JSON.stringify(videos))
      return res.status(201).json({ video: newVideo })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to add video' })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Video ID is required' })
    }

    try {
      const videosData = await store.get('video-list')
      const videos = videosData ? JSON.parse(videosData) : []
      const filtered = videos.filter((v) => v.id !== id)

      if (filtered.length === videos.length) {
        return res.status(404).json({ error: 'Video not found' })
      }

      await store.set('video-list', JSON.stringify(filtered))
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to remove video' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

function extractYouTubeId(url) {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v') || null
    }
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1) || null
    }
    return null
  } catch {
    return null
  }
}
