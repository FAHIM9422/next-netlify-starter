import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import { createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto'

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
const DEFAULT_ADMIN_USERNAME = 'FAHIM1515'
const DEFAULT_PASSWORD_SALT = 'fahim-admin-v1'
const DEFAULT_PASSWORD_HASH = '204ae22b7a6ae9e86ccea15790dd10eac52920c1a21ec7d28b8a4c3634af2dda'
const DEFAULT_SESSION_SECRET = '6f8cb42a64df51166baf4251f6ea16de'
const SESSION_TTL_SECONDS = 60 * 60 * 12

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

function readAdminCredentials() {
  const username = sanitizeString(Netlify.env.get('ADMIN_USERNAME'), DEFAULT_ADMIN_USERNAME)
  const passwordHash = sanitizeString(Netlify.env.get('ADMIN_PASSWORD_HASH'), DEFAULT_PASSWORD_HASH)
  const passwordSalt = sanitizeString(Netlify.env.get('ADMIN_PASSWORD_SALT'), DEFAULT_PASSWORD_SALT)
  return { username, passwordHash, passwordSalt }
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex')
}

function signaturesMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)

  if (expectedBuffer.length !== providedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, providedBuffer)
}

function buildSessionToken(username: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = JSON.stringify({ sub: username, exp: expiresAt })
  const payloadB64 = Buffer.from(payload).toString('base64url')
  const sessionSecret = sanitizeString(Netlify.env.get('ADMIN_SESSION_SECRET'), DEFAULT_SESSION_SECRET)
  const signature = createHmac('sha256', sessionSecret).update(payloadB64).digest('base64url')
  return `${payloadB64}.${signature}`
}

function verifySessionToken(token: string): boolean {
  const [payloadB64, providedSignature] = token.split('.')

  if (!payloadB64 || !providedSignature) {
    return false
  }

  const sessionSecret = sanitizeString(Netlify.env.get('ADMIN_SESSION_SECRET'), DEFAULT_SESSION_SECRET)
  const expectedSignature = createHmac('sha256', sessionSecret).update(payloadB64).digest('base64url')
  if (!signaturesMatch(expectedSignature, providedSignature)) {
    return false
  }

  try {
    const payloadText = Buffer.from(payloadB64, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadText) as { sub?: unknown; exp?: unknown }

    if (sanitizeString(payload.sub) !== sanitizeString(readAdminCredentials().username)) {
      return false
    }

    const exp = typeof payload.exp === 'number' ? payload.exp : 0
    return exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

function isAuthorized(request: Request): boolean {
  const authHeader = sanitizeString(request.headers.get('authorization'))
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const sessionToken = authHeader.slice(7).trim()
    if (verifySessionToken(sessionToken)) {
      return true
    }
  }

  const expectedToken = Netlify.env.get('VIDEO_PANEL_TOKEN')

  if (!expectedToken) {
    return false
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

  if (request.method === 'POST') {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400)
    }

    const username = sanitizeString((body as { username?: unknown })?.username)
    const password = sanitizeString((body as { password?: unknown })?.password)
    const adminCredentials = readAdminCredentials()
    const calculatedPasswordHash = hashPassword(password, adminCredentials.passwordSalt)
    const validUsername = signaturesMatch(adminCredentials.username, username)
    const validPassword = signaturesMatch(adminCredentials.passwordHash, calculatedPasswordHash)

    if (!validUsername || !validPassword) {
      return jsonResponse({ error: 'Invalid credentials' }, 401)
    }

    const token = buildSessionToken(adminCredentials.username)
    return jsonResponse({
      ok: true,
      token,
      expiresInSeconds: SESSION_TTL_SECONDS,
    })
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
