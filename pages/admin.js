import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Admin() {
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [videos, setVideos] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchVideos()
    }
  }, [token])

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || 'Login failed')
      } else {
        localStorage.setItem('admin_token', data.token)
        setToken(data.token)
        setPassword('')
      }
    } catch {
      setLoginError('Network error')
    }
    setLoading(false)
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    setToken(null)
    setVideos([])
    setUsername('')
  }

  async function fetchVideos() {
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      setVideos(data.videos || [])
    } catch {
      setMessage('Failed to load videos')
    }
  }

  async function handleAddVideo(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle, youtubeUrl: newUrl }),
      })
      const data = await res.json()
      if (res.status === 401) {
        handleLogout()
        setLoginError('Session expired. Please login again.')
        return
      }
      if (!res.ok) {
        setMessage(data.error || 'Failed to add video')
      } else {
        setMessage('Video added successfully!')
        setNewTitle('')
        setNewUrl('')
        fetchVideos()
      }
    } catch {
      setMessage('Network error')
    }
    setLoading(false)
  }

  async function handleRemoveVideo(id) {
    if (!confirm('Are you sure you want to remove this video?')) return
    setMessage('')
    try {
      const res = await fetch('/api/videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })
      if (res.status === 401) {
        handleLogout()
        setLoginError('Session expired. Please login again.')
        return
      }
      if (res.ok) {
        setMessage('Video removed successfully!')
        fetchVideos()
      } else {
        setMessage('Failed to remove video')
      }
    } catch {
      setMessage('Network error')
    }
  }

  // Login screen
  if (!token) {
    return (
      <>
        <Head>
          <title>Admin Login | FAHIM9422</title>
        </Head>
        <div className="admin-container">
          <div className="login-box">
            <h1>Admin Login</h1>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  required
                />
              </div>
              {loginError && <p className="error-msg">{loginError}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <a href="/" className="back-link">&larr; Back to Home</a>
          </div>
        </div>
      </>
    )
  }

  // Admin dashboard
  return (
    <>
      <Head>
        <title>Admin Dashboard | FAHIM9422</title>
      </Head>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Video Management</h1>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>

        {/* Add Video Form */}
        <div className="admin-card">
          <h2>Add New Video</h2>
          <form onSubmit={handleAddVideo}>
            <div className="form-group">
              <label htmlFor="videoTitle">Video Title</label>
              <input
                id="videoTitle"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="videoUrl">YouTube URL</label>
              <input
                id="videoUrl"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Video'}
            </button>
          </form>
          {message && <p className="status-msg">{message}</p>}
        </div>

        {/* Video List */}
        <div className="admin-card">
          <h2>Current Videos ({videos.length})</h2>
          {videos.length === 0 ? (
            <p className="no-videos">No videos added yet. Add your first video above!</p>
          ) : (
            <div className="video-list">
              {videos.map((video) => (
                <div key={video.id} className="video-list-item">
                  <div className="video-list-info">
                    <h3>{video.title}</h3>
                    <p className="video-list-url">{video.youtubeUrl}</p>
                    <p className="video-list-date">
                      Added: {new Date(video.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveVideo(video.id)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <a href="/" className="back-link">&larr; Back to Home</a>
      </div>
    </>
  )
}
