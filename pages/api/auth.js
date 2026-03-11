import crypto from 'crypto'

const ADMIN_USER = 'FAHIM1515'
const ADMIN_PASS = '01533691811'
const SECRET = 'fahim9422-admin-panel-secret'

function generateToken() {
  return crypto.createHmac('sha256', SECRET).update(ADMIN_USER + ADMIN_PASS).digest('hex')
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body || {}
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = generateToken()
      res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`)
      return res.status(200).json({ success: true })
    }
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  if (req.method === 'GET') {
    const cookies = parseCookies(req.headers.cookie || '')
    const token = cookies.admin_token
    if (token && token === generateToken()) {
      return res.status(200).json({ authenticated: true })
    }
    return res.status(401).json({ authenticated: false })
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0')
    return res.status(200).json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

function parseCookies(cookieHeader) {
  const cookies = {}
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) cookies[name] = rest.join('=')
  })
  return cookies
}
