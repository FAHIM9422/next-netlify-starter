const crypto = require('crypto')

const ADMIN_USERNAME = 'FAHIM1515'
const ADMIN_PASSWORD_HASH = '0dee095b25d354ec76082f84c4a9609f3f6238e114606a0e9067aa5b20eb1e49'

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

// Simple in-memory token store (resets on function cold start)
// For production, use a database or Netlify Blobs
const activeTokens = new Set()

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { action, username, password, token } = JSON.parse(event.body || '{}')

    if (action === 'login') {
      if (!username || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Username and password required' }) }
      }

      if (username === ADMIN_USERNAME && hashPassword(password) === ADMIN_PASSWORD_HASH) {
        const newToken = generateToken()
        activeTokens.add(newToken)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, token: newToken }),
        }
      }

      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) }
    }

    if (action === 'verify') {
      if (token && activeTokens.has(token)) {
        return { statusCode: 200, headers, body: JSON.stringify({ valid: true }) }
      }
      return { statusCode: 401, headers, body: JSON.stringify({ valid: false }) }
    }

    if (action === 'logout') {
      if (token) activeTokens.delete(token)
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) }
  }
}
