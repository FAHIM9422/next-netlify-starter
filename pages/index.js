import Head from 'next/head'
import { useEffect, useState } from 'react'

const DEFAULT_CONTENT = {
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

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `video-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function extractYouTubeId(rawUrl) {
  try {
    const parsed = new URL(rawUrl)
    const host = parsed.hostname.toLowerCase()

    if (host.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').trim() || null
    }

    if (host.includes('youtube.com')) {
      if (parsed.searchParams.get('v')) {
        return parsed.searchParams.get('v')
      }

      if (parsed.pathname.includes('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || null
      }

      if (parsed.pathname.includes('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] || null
      }
    }
  } catch {
    return null
  }

  return null
}

function normalizeVideo(videoInput, index) {
  const title = (videoInput.title || '').trim()
  const inputUrl = (videoInput.url || '').trim()

  if (!title || !inputUrl) {
    return null
  }

  if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
    return null
  }

  const directVideoPattern = /\.(mp4|webm|ogg)(\?.*)?$/i
  if (directVideoPattern.test(inputUrl)) {
    return {
      id: videoInput.id || `video-${index + 1}`,
      title,
      url: inputUrl,
      type: 'direct',
    }
  }

  if (inputUrl.includes('youtube.com/embed?')) {
    return {
      id: videoInput.id || `video-${index + 1}`,
      title,
      url: inputUrl,
      type: 'youtube',
    }
  }

  const youtubeId = extractYouTubeId(inputUrl)
  if (youtubeId) {
    return {
      id: videoInput.id || `video-${index + 1}`,
      title,
      url: `https://www.youtube.com/embed/${youtubeId}`,
      type: 'youtube',
    }
  }

  return {
    id: videoInput.id || `video-${index + 1}`,
    title,
    url: inputUrl,
    type: 'embed',
  }
}

export default function Home() {
  const [siteContent, setSiteContent] = useState(DEFAULT_CONTENT)
  const [instagramInput, setInstagramInput] = useState(DEFAULT_CONTENT.instagramUrl)
  const [videosInput, setVideosInput] = useState(
    DEFAULT_CONTENT.videos.map((video) => ({ id: video.id, title: video.title, url: video.url })),
  )
  const [adminToken, setAdminToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadSiteContent() {
      try {
        const response = await fetch('/api/site-content')
        if (!response.ok) {
          throw new Error('Unable to load content')
        }

        const data = await response.json()
        if (!mounted) {
          return
        }

        setSiteContent(data)
        setInstagramInput(data.instagramUrl || DEFAULT_CONTENT.instagramUrl)
        setVideosInput(
          (data.videos || []).map((video) => ({ id: video.id, title: video.title, url: video.url })),
        )
      } catch {
        if (mounted) {
          setLoadingError('Saved content could not be loaded. Default content is shown.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSiteContent()

    return () => {
      mounted = false
    }
  }, [])

  function addVideoRow() {
    setVideosInput((current) => [...current, { id: createId(), title: '', url: '' }])
  }

  function updateVideoField(id, field, value) {
    setVideosInput((current) => current.map((video) => (video.id === id ? { ...video, [field]: value } : video)))
  }

  function removeVideoRow(id) {
    setVideosInput((current) => current.filter((video) => video.id !== id))
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaveMessage('')

    const normalizedVideos = videosInput
      .map((video, index) => normalizeVideo(video, index))
      .filter((video) => video !== null)

    if (normalizedVideos.length === 0) {
      setSaveMessage('Add at least one valid video title and URL before saving.')
      return
    }

    const payload = {
      instagramUrl: instagramInput.trim() || DEFAULT_CONTENT.instagramUrl,
      videos: normalizedVideos,
    }

    setSaving(true)

    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      if (adminToken.trim()) {
        headers['x-admin-token'] = adminToken.trim()
      }

      const response = await fetch('/api/site-content', {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Save failed')
      }

      setSiteContent(result.content)
      setInstagramInput(result.content.instagramUrl)
      setVideosInput(
        result.content.videos.map((video) => ({ id: video.id, title: video.title, url: video.url })),
      )
      setSaveMessage('Changes saved. The website video list has been updated.')
    } catch (error) {
      setSaveMessage(error.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Head>
        <title>FAHIM9422 | Official YouTube Channel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav>
        <div className="logo">
          <img src="/channel-logo.jpg" alt="FAHIM9422 logo" />
          <span>FAHIM9422</span>
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#videos">All Videos</a>
          <a href="#control-panel">Control Panel</a>
        </div>
        <a
          href="https://www.youtube.com/@FAHIM9422"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-subscribe"
        >
          Subscribe
        </a>
      </nav>

      <section className="hero" id="home">
        <h1>Welcome to FAHIM9422</h1>
        <p>Join the community! Watch the latest videos, tutorials, and entertainment content.</p>
        <div className="hero-actions">
          <a
            href="https://www.youtube.com/@FAHIM9422?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-subscribe hero-subscribe"
          >
            Subscribe to Channel
          </a>
          <a href={siteContent.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-instagram">
            Follow Instagram
          </a>
        </div>
      </section>

      <section className="section" id="about">
        <h2 className="section-title">About The Channel</h2>
        <div className="about-grid">
          <div className="about-text">
            <p>
              Welcome to the official website of <strong>FAHIM9422</strong>. This channel is dedicated to
              providing high-quality content for viewers.
            </p>
            <p>
              Whether you are here for gaming, tech reviews, vlogs, or entertainment, new videos are
              uploaded regularly. Subscribe and turn on notifications so you never miss an upload.
            </p>
            <p>
              <strong>Upload Schedule:</strong> New videos every week.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000&auto=format&fit=crop"
              alt="Channel Setup"
            />
          </div>
        </div>
      </section>

      <section className="section" id="videos">
        <h2 className="section-title">All Uploaded Videos</h2>
        <p className="video-intro">
          Watch old and new uploads from <strong>FAHIM9422</strong> directly on this website.
        </p>
        {loadingError ? <p className="info-message warning">{loadingError}</p> : null}
        {loading ? <p className="info-message">Loading videos...</p> : null}
        <div className="video-grid">
          {siteContent.videos.map((video) => (
            <div className="video-card" key={video.id}>
              <div className="thumbnail">
                {video.type === 'direct' ? (
                  <video controls preload="metadata" src={video.url} />
                ) : (
                  <iframe src={video.url} title={video.title} allowFullScreen></iframe>
                )}
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  Open Source Link &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="control-panel">
        <h2 className="section-title">Video Control Panel</h2>
        <p className="video-intro">
          Change Instagram link and upload video links for the website. YouTube URLs are converted to embeds
          automatically.
        </p>

        <form className="control-panel" onSubmit={handleSave}>
          <label htmlFor="instagram-url">Instagram URL</label>
          <input
            id="instagram-url"
            type="url"
            value={instagramInput}
            onChange={(event) => setInstagramInput(event.target.value)}
            placeholder="https://www.instagram.com/fahim___9422/"
          />

          <label htmlFor="admin-token">Admin Token (optional)</label>
          <input
            id="admin-token"
            type="password"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            placeholder="Use if VIDEO_PANEL_TOKEN is configured"
          />

          <div className="panel-header-row">
            <h3>Website Videos</h3>
            <button type="button" onClick={addVideoRow} className="btn-secondary">
              Add Video
            </button>
          </div>

          <div className="panel-videos">
            {videosInput.map((video, index) => (
              <div className="panel-video-row" key={video.id}>
                <input
                  type="text"
                  value={video.title}
                  onChange={(event) => updateVideoField(video.id, 'title', event.target.value)}
                  placeholder={`Video ${index + 1} title`}
                />
                <input
                  type="url"
                  value={video.url}
                  onChange={(event) => updateVideoField(video.id, 'url', event.target.value)}
                  placeholder="YouTube or direct video URL"
                />
                <button type="button" onClick={() => removeVideoRow(video.id)} className="btn-danger">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-subscribe save-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Website Content'}
          </button>
          {saveMessage ? <p className="info-message">{saveMessage}</p> : null}
        </form>
      </section>

      <footer>
        <div className="social-icons">
          <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
          <a href={siteContent.instagramUrl} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://www.youtube.com/@FAHIM9422/videos" target="_blank" rel="noopener noreferrer">
            Videos
          </a>
        </div>
        <p>&copy; 2026 FAHIM9422. All Rights Reserved.</p>
      </footer>

      <style jsx>{`
        :global(html),
        :global(body) {
          --sky-blue: #38bdf8;
          --sky-blue-dark: #0284c7;
          --sky-blue-soft: #e0f2fe;
          --text-dark: #0f172a;
          --panel-border: #bae6fd;
          background-color: #ffffff;
          color: var(--text-dark);
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          scroll-behavior: smooth;
        }

        :global(*) {
          box-sizing: border-box;
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 5%;
          background-color: rgba(255, 255, 255, 0.95);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--panel-border);
          backdrop-filter: blur(8px);
        }

        .logo {
          font-size: 1.4rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--sky-blue);
          display: block;
        }

        .logo span {
          color: var(--sky-blue-dark);
        }

        .nav-links a {
          color: var(--text-dark);
          text-decoration: none;
          margin-left: 20px;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-links a:hover {
          color: var(--sky-blue-dark);
        }

        .btn-subscribe {
          background-color: var(--sky-blue-dark);
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: bold;
          transition: transform 0.2s ease, background-color 0.2s ease;
          display: inline-block;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .btn-subscribe:hover {
          transform: scale(1.05);
          background-color: var(--sky-blue);
        }

        .hero {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          background: linear-gradient(140deg, var(--sky-blue-soft) 0%, #ffffff 55%, #f0f9ff 100%);
          padding: 20px;
        }

        .hero h1 {
          font-size: 3.5rem;
          margin-bottom: 20px;
          color: var(--sky-blue-dark);
        }

        .hero p {
          font-size: 1.2rem;
          color: #334155;
          max-width: 600px;
          margin-bottom: 30px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hero-subscribe {
          font-size: 1.1rem;
          padding: 15px 30px;
        }

        .btn-instagram {
          border: 1px solid var(--sky-blue-dark);
          color: var(--sky-blue-dark);
          background: #ffffff;
          padding: 15px 26px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 700;
        }

        .section {
          padding: 80px 10%;
          background: #ffffff;
        }

        .section-title {
          font-size: 2rem;
          margin-bottom: 40px;
          border-left: 5px solid var(--sky-blue);
          padding-left: 15px;
          color: var(--sky-blue-dark);
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .about-text p {
          margin-bottom: 20px;
          color: #334155;
        }

        .about-image img {
          width: 100%;
          border-radius: 10px;
          display: block;
          border: 1px solid var(--panel-border);
        }

        .video-intro {
          color: #334155;
          margin: 0 0 24px;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .video-card {
          background-color: #ffffff;
          border: 1px solid var(--panel-border);
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .video-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 28px rgba(2, 132, 199, 0.12);
        }

        .thumbnail {
          width: 100%;
          height: 240px;
          background-color: var(--sky-blue-soft);
        }

        iframe,
        video {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .video-info {
          padding: 15px;
        }

        .video-info h3 {
          font-size: 1.1rem;
          margin: 0 0 10px;
          color: var(--text-dark);
        }

        .video-info a {
          color: var(--sky-blue-dark);
          text-decoration: none;
          font-size: 0.9rem;
        }

        .control-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          background: #f8fdff;
        }

        .control-panel label {
          font-weight: 700;
          color: #0f172a;
          margin-top: 6px;
        }

        .control-panel input {
          border: 1px solid #94d8fb;
          border-radius: 8px;
          padding: 12px;
          font-size: 0.95rem;
        }

        .panel-header-row {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .panel-header-row h3 {
          margin: 0;
          color: #0f172a;
        }

        .panel-videos {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .panel-video-row {
          display: grid;
          grid-template-columns: 1fr 1.4fr auto;
          gap: 10px;
        }

        .btn-secondary,
        .btn-danger {
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 10px 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-secondary {
          background: #e0f2fe;
          color: #0f172a;
          border-color: #94d8fb;
        }

        .btn-danger {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .save-button {
          margin-top: 8px;
          width: fit-content;
        }

        .info-message {
          margin: 4px 0 0;
          font-size: 0.95rem;
          color: #0369a1;
        }

        .info-message.warning {
          color: #b45309;
        }

        footer {
          background: linear-gradient(180deg, #f8fdff 0%, #e0f2fe 100%);
          padding: 40px 10%;
          text-align: center;
          border-top: 1px solid var(--panel-border);
        }

        .social-icons {
          margin-bottom: 20px;
        }

        .social-icons a {
          color: var(--sky-blue-dark);
          margin: 0 10px;
          text-decoration: none;
          font-size: 1.1rem;
        }

        @media (max-width: 900px) {
          .panel-video-row {
            grid-template-columns: 1fr;
          }

          .save-button,
          .btn-secondary,
          .btn-danger {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }

          .about-grid {
            grid-template-columns: 1fr;
          }

          nav {
            flex-direction: column;
            gap: 15px;
          }

          .nav-links {
            margin-bottom: 5px;
          }

          .nav-links a {
            margin: 0 10px;
          }

          .thumbnail {
            height: 220px;
          }
        }
      `}</style>
    </>
  )
}
