const { getStore } = require('@netlify/blobs')
const crypto = require('crypto')

const ADMIN_USERNAME = 'FAHIM1515'
const ADMIN_PASSWORD_HASH = '0dee095b25d354ec76082f84c4a9609f3f6238e114606a0e9067aa5b20eb1e49'

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function isAuthenticated(event) {
  const authHeader = event.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return false

  // Verify token via auth function's token store
  // For simplicity, we'll verify credentials directly from a header
  const credentials = event.headers['x-admin-credentials']
  if (!credentials) return false

  try {
    const decoded = Buffer.from(credentials, 'base64').toString()
    const [username, password] = decoded.split(':')
    return username === ADMIN_USERNAME && hashPassword(password) === ADMIN_PASSWORD_HASH
  } catch {
    return false
  }
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Credentials',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  const store = getStore('videos')

  // GET - public endpoint to list all videos
  if (event.httpMethod === 'GET') {
    try {
      const data = await store.get('video-list', { type: 'json' })
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ videos: data || [] }),
      }
    } catch {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ videos: [] }),
      }
    }
  }

  // POST - admin only: add a video
  if (event.httpMethod === 'POST') {
    const authenticated = await isAuthenticated(event)
    if (!authenticated) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    try {
      const { title, youtubeId } = JSON.parse(event.body || '{}')
      if (!title || !youtubeId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Title and YouTube ID required' }) }
      }

      let videos = []
      try {
        videos = await store.get('video-list', { type: 'json' }) || []
      } catch {
        videos = []
      }

      const newVideo = {
        id: crypto.randomBytes(8).toString('hex'),
        title,
        youtubeId,
        createdAt: new Date().toISOString(),
      }

      videos.unshift(newVideo)
      await store.setJSON('video-list', videos)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, video: newVideo }),
      }
    } catch {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) }
    }
  }

  // DELETE - admin only: remove a video
  if (event.httpMethod === 'DELETE') {
    const authenticated = await isAuthenticated(event)
    if (!authenticated) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    try {
      const { videoId } = JSON.parse(event.body || '{}')
      if (!videoId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Video ID required' }) }
      }

      let videos = []
      try {
        videos = await store.get('video-list', { type: 'json' }) || []
      } catch {
        videos = []
      }

      videos = videos.filter(v => v.id !== videoId)
      await store.setJSON('video-list', videos)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      }
    } catch {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) }
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
}
