import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [videos, setVideos] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth')
      if (res.ok) {
        setAuthenticated(true)
        loadVideos()
      }
    } catch {}
    setLoading(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (res.ok) {
        setAuthenticated(true)
        setUsername('')
        setPassword('')
        loadVideos()
      } else {
        setLoginError('Invalid username or password')
      }
    } catch {
      setLoginError('Login failed. Please try again.')
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    setAuthenticated(false)
    setVideos([])
  }

  async function loadVideos() {
    try {
      const res = await fetch('/api/videos')
      if (res.ok) {
        const data = await res.json()
        setVideos(data)
      }
    } catch {}
  }

  async function handleAddVideo(e) {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, youtubeUrl: newUrl })
      })
      if (res.ok) {
        setNewTitle('')
        setNewUrl('')
        setMessage('Video added successfully!')
        loadVideos()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to add video')
      }
    } catch {
      setMessage('Failed to add video. Please try again.')
    }
  }

  async function handleDeleteVideo(id) {
    if (!confirm('Are you sure you want to remove this video?')) return
    try {
      const res = await fetch('/api/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setMessage('Video removed successfully!')
        loadVideos()
      } else {
        setMessage('Failed to remove video')
      }
    } catch {
      setMessage('Failed to remove video. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="admin-container">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Panel | FAHIM9422</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <a href="/" className="admin-back-link">Back to Site</a>
        </div>

        {!authenticated ? (
          <div className="admin-login-box">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="admin-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {loginError && <p className="admin-error">{loginError}</p>}
              <button type="submit" className="admin-btn">Login</button>
            </form>
          </div>
        ) : (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <p>Logged in as admin</p>
              <button onClick={handleLogout} className="admin-btn admin-btn-secondary">Logout</button>
            </div>

            {message && <p className="admin-message">{message}</p>}

            <div className="admin-section">
              <h2>Add Video</h2>
              <form onSubmit={handleAddVideo} className="admin-add-form">
                <div className="admin-field">
                  <label htmlFor="videoTitle">Video Title</label>
                  <input
                    id="videoTitle"
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Enter video title"
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="videoUrl">YouTube URL</label>
                  <input
                    id="videoUrl"
                    type="text"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <button type="submit" className="admin-btn">Add Video</button>
              </form>
            </div>

            <div className="admin-section">
              <h2>Manage Videos ({videos.length})</h2>
              {videos.length === 0 ? (
                <p className="admin-empty">No videos added yet.</p>
              ) : (
                <div className="admin-video-list">
                  {videos.map(video => (
                    <div key={video.id} className="admin-video-item">
                      <div className="admin-video-preview">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.youtubeId}`}
                          title={video.title}
                          allowFullScreen
                        />
                      </div>
                      <div className="admin-video-details">
                        <h3>{video.title}</h3>
                        <p className="admin-video-id">ID: {video.youtubeId}</p>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="admin-btn admin-btn-danger"
                        >
                          Remove Video
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
