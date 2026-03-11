import crypto from 'crypto'

const ADMIN_USERNAME = 'FAHIM1515'
const ADMIN_PASSWORD_HASH = '0dee095b25d354ec76082f84c4a9609f3f6238e114606a0e9067aa5b20eb1e49'
const TOKEN_SECRET = 'fahim9422-admin-secret-key-2024'

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function createToken(username) {
  const payload = JSON.stringify({ username, ts: Date.now() })
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
  return Buffer.from(payload).toString('base64') + '.' + signature
}

export function verifyToken(token) {
  try {
    const [payloadB64, signature] = token.split('.')
    const payload = Buffer.from(payloadB64, 'base64').toString()
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
    if (signature !== expectedSig) return null
    const data = JSON.parse(payload)
    // Token valid for 24 hours
    if (Date.now() - data.ts > 24 * 60 * 60 * 1000) return null
    return data
  } catch {
    return null
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  if (username !== ADMIN_USERNAME || hashPassword(password) !== ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = createToken(username)
  return res.status(200).json({ token })
}
