import crypto from 'crypto'

const ADMIN_USERNAME = 'FAHIM1515'
const ADMIN_PASSWORD = '01533691811'
const TOKEN_SECRET = 'fahim9422-admin-secret-key-2024'

export function generateToken() {
  return crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(ADMIN_USERNAME + ':' + ADMIN_PASSWORD)
    .digest('hex')
}

export function verifyToken(token) {
  return token === generateToken()
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({ token: generateToken() })
  }

  return res.status(401).json({ error: 'Invalid credentials' })
}
