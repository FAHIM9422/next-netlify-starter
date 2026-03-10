import Head from 'next/head'
import { useEffect, useState } from 'react'

export default function Home() {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })

    // Load videos
    fetch('/.netlify/functions/videos')
      .then(res => res.json())
      .then(data => {
        if (data.videos) setVideos(data.videos)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <Head>
        <title>FAHIM9422 | Official Channel</title>
        <meta name="description" content="Official website of FAHIM9422. Watch the latest videos, tutorials, and entertainment content." />
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
        </div>
        <div className="nav-buttons">
          <a href="https://www.instagram.com/fahim___9422/" target="_blank" rel="noopener noreferrer" className="btn-instagram">
            Instagram
          </a>
          <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer" className="btn-subscribe">
            Subscribe
          </a>
        </div>
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000&auto=format&fit=crop"
              alt="Channel Setup"
              style={{ width: '100%', borderRadius: '10px' }}
            />
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section className="section" id="videos">
        <h2 className="section-title">Latest Videos</h2>
        <div className="video-grid">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div className="video-card" key={video.id}>
                <div className="thumbnail">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allowFullScreen
                  />
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer">
                    Watch on YouTube &rarr;
                  </a>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="video-card">
                <div className="thumbnail">
                  <iframe
                    src="https://www.youtube.com/embed/videoseries?list=UUFAHIM9422"
                    title="Latest Upload"
                    allowFullScreen
                  />
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
                    title="Popular Video"
                    allowFullScreen
                  />
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
                    title="Trending Now"
                    allowFullScreen
                  />
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
          <a href="https://www.instagram.com/fahim___9422/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
        <p>&copy; 2026 FAHIM9422. All Rights Reserved.</p>
      </footer>
    </>
  )
}
