import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'

type VideoItem = {
  id: string
  title: string
  url: string
  type: 'youtube' | 'direct' | 'embed'
}

type SiteContent = {
  instagramUrl: string
  videos: VideoItem[]
}

const DEFAULT_CONTENT: SiteContent = {
  instagramUrl: 'https://www.instagram.com/fahim___9422/',
  videos: [
    {
      id: 'default-feed',
      title: 'FAHIM9422 Upload Feed',
      url: 'https://www.youtube.com/embed?listType=user_uploads&list=FAHIM9422',
      type: 'youtube',
    },
  ],
}

const STORE_NAME = 'channel-content'
const STORE_KEY = 'site-content'

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function sanitizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function sanitizeContent(input: unknown): SiteContent {
  if (!input || typeof input !== 'object') {
    return DEFAULT_CONTENT
  }

  const source = input as Partial<SiteContent> & { videos?: unknown }
  const instagramUrl = sanitizeString(source.instagramUrl, DEFAULT_CONTENT.instagramUrl)
  const rawVideos = Array.isArray(source.videos) ? source.videos : []

  const videos = rawVideos
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null
      }

      const item = entry as Partial<VideoItem>
      const id = sanitizeString(item.id)
      const title = sanitizeString(item.title)
      const url = sanitizeString(item.url)
      const type = sanitizeString(item.type, 'embed')

      if (!id || !title || !url) {
        return null
      }

      if (type !== 'youtube' && type !== 'direct' && type !== 'embed') {
        return null
      }

      return { id, title, url, type } as VideoItem
    })
    .filter((video): video is VideoItem => video !== null)

  return {
    instagramUrl: instagramUrl || DEFAULT_CONTENT.instagramUrl,
    videos: videos.length > 0 ? videos : DEFAULT_CONTENT.videos,
  }
}

function isAuthorized(request: Request): boolean {
  const expectedToken = Netlify.env.get('VIDEO_PANEL_TOKEN')

  if (!expectedToken) {
    return true
  }

  const providedToken = request.headers.get('x-admin-token')?.trim()
  return providedToken === expectedToken
}

export default async (request: Request): Promise<Response> => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' })

  if (request.method === 'GET') {
    const stored = await store.get(STORE_KEY, { type: 'json' })
    const content = sanitizeContent(stored)
    return jsonResponse(content)
  }

  if (request.method === 'PUT') {
    if (!isAuthorized(request)) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400)
    }

    const content = sanitizeContent(body)
    await store.setJSON(STORE_KEY, content)

    return jsonResponse({ ok: true, content })
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}

export const config: Config = {
  path: '/api/site-content',
}
