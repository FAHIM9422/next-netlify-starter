import Head from 'next/head'
import { useEffect, useState } from 'react'

function extractEmbedUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (match) return 'https://www.youtube.com/embed/' + match[1]
  return url
}

export default function Home() {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.ok ? res.json() : [])
      .then(data => setVideos(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      const handler = function (e) {
        e.preventDefault()
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        })
      }
      anchor.addEventListener('click', handler)
    })
  }, [])

  return (
    <>
      <Head>
        <title>FAHIM9422 | Official YouTube Channel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav>
        <div className="logo">
          <span>FAHIM9422</span>
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#videos">Videos</a>
          <a href="/admin">Admin</a>
        </div>
        <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer" className="btn-subscribe">
          Subscribe
        </a>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <h1>Welcome to FAHIM9422</h1>
        <p>Join the community! Watch the latest videos, tutorials, and entertainment content.</p>
        <a
          href="https://www.youtube.com/@FAHIM9422?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-subscribe"
          style={{ fontSize: '1.2rem', padding: '15px 30px' }}
        >
          Subscribe to Channel
        </a>
      </section>

      {/* About Section */}
      <section className="section" id="about">
        <h2 className="section-title">About The Channel</h2>
        <div className="about-grid">
          <div className="about-text">
            <p>Welcome to the official website of <strong>FAHIM9422</strong>. This channel is dedicated to providing high-quality content for our viewers.</p>
            <p>Whether you are here for gaming, tech reviews, vlogs, or entertainment, we upload new videos regularly. Make sure to hit that subscribe button and turn on notifications so you never miss an upload!</p>
            <p><strong>Upload Schedule:</strong> New videos every week.</p>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000&auto=format&fit=crop"
              alt="Channel Setup"
              style={{ width: '100%', borderRadius: '10px' }}
            />
          </div>
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="section" id="videos">
        <h2 className="section-title">Latest Videos</h2>
        <div className="video-grid">
          {videos.length > 0 ? (
            videos.map(video => (
              <div className="video-card" key={video.id}>
                <div className="thumbnail">
                  <iframe
                    src={extractEmbedUrl(video.youtubeUrl)}
                    title={video.title}
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    Watch on YouTube &rarr;
                  </a>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Default placeholder videos */}
              <div className="video-card">
                <div className="thumbnail">
                  <iframe
                    src="https://www.youtube.com/embed/videoseries?list=UUFAHIM9422"
                    title="YouTube video player"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h3>Latest Upload</h3>
                  <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer">
                    Watch on YouTube &rarr;
                  </a>
                </div>
              </div>

              <div className="video-card">
                <div className="thumbnail">
                  <iframe
                    src="https://www.youtube.com/embed/videoseries?list=UUFAHIM9422"
                    title="YouTube video player"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h3>Popular Video</h3>
                  <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer">
                    Watch on YouTube &rarr;
                  </a>
                </div>
              </div>

              <div className="video-card">
                <div className="thumbnail">
                  <iframe
                    src="https://www.youtube.com/embed/videoseries?list=UUFAHIM9422"
                    title="YouTube video player"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h3>Trending Now</h3>
                  <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer">
                    Watch on YouTube &rarr;
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="social-icons">
          <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="https://www.instagram.com/fahim___9422" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="#">Twitter</a>
        </div>
        <p style={{ color: '#bae6fd' }}>&copy; 2023 FAHIM9422. All Rights Reserved.</p>
      </footer>
    </>
  )
}
