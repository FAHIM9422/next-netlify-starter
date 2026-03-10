import Head from 'next/head'

export default function Home() {
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
          <a href="#videos">Videos</a>
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
        <a
          href="https://www.youtube.com/@FAHIM9422?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-subscribe hero-subscribe"
        >
          Subscribe to Channel
        </a>
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
        <h2 className="section-title">Latest Videos</h2>
        <div className="video-grid">
          <div className="video-card">
            <div className="thumbnail">
              <iframe
                src="https://www.youtube.com/embed/videoseries?list=UUFAHIM9422"
                title="Latest upload"
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
                title="Popular video"
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
                title="Trending video"
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
        </div>
      </section>

      <footer>
        <div className="social-icons">
          <a href="https://www.youtube.com/@FAHIM9422" target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
          <a href="#" aria-label="Instagram profile placeholder">
            Instagram
          </a>
          <a href="#" aria-label="Twitter profile placeholder">
            Twitter
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

        .hero-subscribe {
          font-size: 1.2rem;
          padding: 15px 30px;
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

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
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
          height: 180px;
          background-color: var(--sky-blue-soft);
        }

        iframe {
          width: 100%;
          height: 100%;
          border: none;
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
        }
      `}</style>
    </>
  )
}
