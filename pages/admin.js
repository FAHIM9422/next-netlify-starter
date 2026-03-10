import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Admin() {
  const [videos, setVideos] = useState([])
  const [title, setTitle] = useState('')
  const [youtubeId, setYoutubeId] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const getCredentials = () => {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('adminCredentials')
  }

  useEffect(() => {
    const credentials = getCredentials()
    if (!credentials) {
      router.push('/login')
      return
    }

    // Verify credentials
    const token = sessionStorage.getItem('adminToken')
    fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', token }),
    })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          // Token expired but credentials may still be valid, allow access
        }
        loadVideos()
      })
      .catch(() => {
        loadVideos()
      })
  }, [])

  const loadVideos = async () => {
    try {
      const res = await fetch('/.netlify/functions/videos')
      const data = await res.json()
      setVideos(data.videos || [])
    } catch {
      setVideos([])
    }
    setLoading(false)
  }

  const handleAddVideo = async (e) => {
    e.preventDefault()
    setMessage('')

    const credentials = getCredentials()
    if (!credentials) {
      router.push('/login')
      return
    }

    // Extract YouTube ID from URL if a full URL was pasted
    let extractedId = youtubeId.trim()
    const urlMatch = extractedId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
    if (urlMatch) {
      extractedId = urlMatch[1]
    }

    try {
      const res = await fetch('/.netlify/functions/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Credentials': credentials,
          'Authorization': 'Bearer admin',
        },
        body: JSON.stringify({ title: title.trim(), youtubeId: extractedId }),
      })

      const data = await res.json()

      if (data.success) {
        setTitle('')
        setYoutubeId('')
        setMessage('Video added successfully!')
        loadVideos()
      } else {
        setMessage(data.error || 'Failed to add video')
      }
    } catch {
      setMessage('Connection error. Please try again.')
    }
  }

  const handleDeleteVideo = async (videoId) => {
    const credentials = getCredentials()
    if (!credentials) {
      router.push('/login')
      return
    }

    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const res = await fetch('/.netlify/functions/videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Credentials': credentials,
          'Authorization': 'Bearer admin',
        },
        body: JSON.stringify({ videoId }),
      })

      const data = await res.json()

      if (data.success) {
        loadVideos()
      }
    } catch {
      setMessage('Failed to delete video')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminCredentials')
    sessionStorage.removeItem('adminToken')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Panel | FAHIM9422</title>
      </Head>

      <nav>
        <div className="logo">
          <span>FAHIM9422</span> Admin
        </div>
        <div className="nav-links">
          <a href="/">View Site</a>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="admin-container">
        <div className="admin-header">
          <h1>Video Manager</h1>
          <p>{videos.length} video{videos.length !== 1 ? 's' : ''} published</p>
        </div>

        <div className="add-video-form">
          <h2>Add New Video</h2>
          <form onSubmit={handleAddVideo}>
            <div className="form-group">
              <label htmlFor="title">Video Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="youtubeId">YouTube Video ID or URL</label>
              <input
                id="youtubeId"
                type="text"
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="e.g. dQw4w9WgXcQ or full YouTube URL"
                required
              />
            </div>
            <button type="submit" className="btn-add">Add Video</button>
            {message && <p style={{ marginTop: '15px', color: message.includes('success') ? '#27ae60' : '#e74c3c' }}>{message}</p>}
          </form>
        </div>

        <h2 style={{ marginBottom: '20px' }}>Published Videos</h2>

        {videos.length === 0 ? (
          <div className="no-videos">
            <p>No videos published yet. Add your first video above!</p>
          </div>
        ) : (
          <ul className="video-list">
            {videos.map((video) => (
              <li key={video.id} className="video-list-item">
                <div>
                  <h3>{video.title}</h3>
                  <p>YouTube ID: {video.youtubeId}</p>
                </div>
                <button className="btn-delete" onClick={() => handleDeleteVideo(video.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
