import Head from 'next/head'
import { useEffect, useState } from 'react'

const DEFAULT_VIDEOS = [
  { id: 'default-1', title: 'Latest Upload', youtubeId: null },
  { id: 'default-2', title: 'Popular Video', youtubeId: null },
  { id: 'default-3', title: 'Trending Now', youtubeId: null },
]

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })

    fetch('/api/videos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setVideos(data)
        } else {
          setVideos(DEFAULT_VIDEOS)
        }
        setLoaded(true)
      })
      .catch(() => {
        setVideos(DEFAULT_VIDEOS)
        setLoaded(true)
      })
  }, [])

  return (
    <>
      <Head>
        <title>FAHIM9422 | Official YouTube Channel</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Official website of FAHIM9422 YouTube channel. Watch the latest videos, tutorials, and entertainment content." />
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
            />
          </div>
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="section" id="videos">
        <h2 className="section-title">Latest Videos</h2>
        <div className="video-grid">
          {(loaded ? videos : DEFAULT_VIDEOS).map(video => (
            <div key={video.id} className="video-card">
              <div className="thumbnail">
                {video.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allowFullScreen
                  />
                ) : (
                  <iframe
                    src="https://www.youtube.com/embed/videoseries?list=UUFAHIM9422"
                    title={video.title}
                    allowFullScreen
                  />
                )}
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer">
                  Watch on YouTube &rarr;
                </a>
              </div>
            </div>
          ))}
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
