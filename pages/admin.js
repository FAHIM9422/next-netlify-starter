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

  useEffect(() => {
    const saved = typeof window !== 'undefined' && sessionStorage.getItem('admin_token')
    if (saved) {
      setToken(saved)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchVideos()
    }
  }, [token])

  async function fetchVideos() {
    const res = await fetch('/api/videos')
    if (res.ok) {
      setVideos(await res.json())
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (res.ok) {
      const data = await res.json()
      setToken(data.token)
      sessionStorage.setItem('admin_token', data.token)
    } else {
      setLoginError('Invalid username or password')
    }
  }

  async function handleAddVideo(e) {
    e.preventDefault()
    setMessage('')
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ title: newTitle, youtubeUrl: newUrl })
    })
    if (res.ok) {
      setNewTitle('')
      setNewUrl('')
      setMessage('Video added successfully!')
      fetchVideos()
    } else {
      setMessage('Failed to add video')
    }
  }

  async function handleRemoveVideo(id) {
    const res = await fetch('/api/videos', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setMessage('Video removed!')
      fetchVideos()
    } else {
      setMessage('Failed to remove video')
    }
  }

  function handleLogout() {
    setToken(null)
    sessionStorage.removeItem('admin_token')
  }

  function extractEmbedUrl(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
    if (match) return 'https://www.youtube.com/embed/' + match[1]
    return url
  }

  if (!token) {
    return (
      <>
        <Head>
          <title>Admin Login | FAHIM9422</title>
        </Head>
        <div className="admin-login-wrapper">
          <form className="admin-login-form" onSubmit={handleLogin}>
            <h1>Admin Login</h1>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit">Login</button>
            <a href="/" className="admin-back-link">Back to Home</a>
          </form>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | FAHIM9422</title>
      </Head>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Video Management</h1>
          <div>
            <a href="/" className="admin-back-link" style={{ marginRight: '15px' }}>View Site</a>
            <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
          </div>
        </div>

        {message && <p className="admin-message">{message}</p>}

        <div className="admin-add-section">
          <h2>Add New Video</h2>
          <form onSubmit={handleAddVideo} className="admin-add-form">
            <input
              type="text"
              placeholder="Video Title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              required
            />
            <button type="submit">Add Video</button>
          </form>
        </div>

        <div className="admin-video-list">
          <h2>Current Videos ({videos.length})</h2>
          {videos.length === 0 && <p className="admin-empty">No videos added yet.</p>}
          {videos.map(video => (
            <div key={video.id} className="admin-video-item">
              <div className="admin-video-preview">
                <iframe
                  src={extractEmbedUrl(video.youtubeUrl)}
                  title={video.title}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="admin-video-details">
                <h3>{video.title}</h3>
                <p>{video.youtubeUrl}</p>
                <button
                  onClick={() => handleRemoveVideo(video.id)}
                  className="admin-remove-btn"
                >
                  Remove Video
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
