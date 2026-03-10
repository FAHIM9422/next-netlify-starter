import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      })

      const data = await res.json()

      if (data.success) {
        // Store credentials for API calls
        const credentials = btoa(`${username}:${password}`)
        sessionStorage.setItem('adminCredentials', credentials)
        sessionStorage.setItem('adminToken', data.token)
        router.push('/admin')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Connection error. Please try again.')
    }

    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Admin Login | FAHIM9422</title>
      </Head>

      <nav>
        <div className="logo">
          <span>FAHIM9422</span>
        </div>
        <div className="nav-links">
          <a href="/">Back to Site</a>
        </div>
      </nav>

      <div className="login-container">
        <h1>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </>
  )
}
