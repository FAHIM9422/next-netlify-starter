import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'

const DEFAULT_USER = 'admin'
const DEFAULT_PASS = 'admin123'

const FF_PACKAGES = [
  { diamond: '100 Diamond', price: '120', emoji: '\u{1F48E}', desc: 'Only 120 Taka' },
  { diamond: '218 Diamond', price: '250', emoji: '\u{1F48E}\u{1F48E}', desc: 'Only 250 Taka' },
  { diamond: '522 Diamond', price: '550', emoji: '\u{1F48E}\u{1F48E}\u{1F48E}', desc: 'Only 550 Taka' },
  { diamond: '1060 Diamond', price: '1050', emoji: '\u{1F48E}\u{1F48E}\u{1F48E}\u{1F48E}', desc: 'Only 1050 Taka' },
  { diamond: '2180 Diamond', price: '2100', emoji: '\u{1F48E}\u{1F48E}\u{1F48E}\u{1F48E}\u{1F48E}', desc: 'Only 2100 Taka' },
  { diamond: '5600 Diamond', price: '5200', emoji: '\u{1F451}', desc: 'Only 5200 Taka' },
]

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminUser, setAdminUser] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [notifyText, setNotifyText] = useState('')
  const [notifyPhoto, setNotifyPhoto] = useState('')
  const [notifyVisible, setNotifyVisible] = useState(false)
  const [notifyTextInput, setNotifyTextInput] = useState('')
  const [notifyPhotoInput, setNotifyPhotoInput] = useState('')
  const [newPass, setNewPass] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('adminPass')) localStorage.setItem('adminPass', DEFAULT_PASS)
    if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]))
    if (!localStorage.getItem('notifyText')) localStorage.setItem('notifyText', 'Admin can set their photo and display important notifications here!')
    if (!localStorage.getItem('notifyPhoto')) localStorage.setItem('notifyPhoto', 'https://via.placeholder.com/65x65/FF4B2B/FFFFFF?text=Admin')
    if (!localStorage.getItem('notifyVisible')) localStorage.setItem('notifyVisible', 'false')

    setNotifyText(localStorage.getItem('notifyText'))
    setNotifyPhoto(localStorage.getItem('notifyPhoto'))
    setNotifyVisible(localStorage.getItem('notifyVisible') === 'true')
    setOrders(JSON.parse(localStorage.getItem('orders') || '[]'))
  }, [])

  const orderFF = useCallback((diamond, price) => {
    const msg = `Red Dot Topup Order:%0APackage: ${diamond}%0APrice: ${price} Taka%0APlease confirm my order.`
    window.open(`https://wa.me/8801912168328?text=${msg}`, '_blank')

    const currentOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const updated = [{
      id: Date.now(),
      item: diamond,
      price: price + ' Taka',
      status: 'Pending',
      date: new Date().toLocaleString('en-BD')
    }, ...currentOrders]
    localStorage.setItem('orders', JSON.stringify(updated))
    setOrders(updated)
  }, [])

  const handleLogin = useCallback(() => {
    const storedPass = localStorage.getItem('adminPass')
    if (adminUser === DEFAULT_USER && adminPass === storedPass) {
      setLoginOpen(false)
      setAdminUser('')
      setAdminPass('')
      setNotifyTextInput(localStorage.getItem('notifyText') || '')
      setNotifyPhotoInput(localStorage.getItem('notifyPhoto') || '')
      setAdminOpen(true)
    } else {
      alert('Wrong username or password!')
    }
  }, [adminUser, adminPass])

  const saveNotification = useCallback(() => {
    if (notifyTextInput) localStorage.setItem('notifyText', notifyTextInput)
    if (notifyPhotoInput) localStorage.setItem('notifyPhoto', notifyPhotoInput)
    setNotifyText(notifyTextInput || notifyText)
    setNotifyPhoto(notifyPhotoInput || notifyPhoto)
    alert('Notification saved!')
  }, [notifyTextInput, notifyPhotoInput, notifyText, notifyPhoto])

  const toggleNotification = useCallback(() => {
    const next = !notifyVisible
    localStorage.setItem('notifyVisible', String(next))
    setNotifyVisible(next)
  }, [notifyVisible])

  const changePassword = useCallback(() => {
    if (newPass && newPass.length >= 4) {
      localStorage.setItem('adminPass', newPass)
      setNewPass('')
      alert('Password updated!')
    } else {
      alert('Password must be at least 4 characters!')
    }
  }, [newPass])

  const updateOrder = useCallback((index, status) => {
    const current = JSON.parse(localStorage.getItem('orders') || '[]')
    if (current[index]) {
      current[index].status = status
      localStorage.setItem('orders', JSON.stringify(current))
      setOrders([...current])
    }
  }, [])

  const deleteOrder = useCallback((index) => {
    if (confirm('Delete this order?')) {
      const current = JSON.parse(localStorage.getItem('orders') || '[]')
      current.splice(index, 1)
      localStorage.setItem('orders', JSON.stringify(current))
      setOrders([...current])
    }
  }, [])

  return (
    <>
      <Head>
        <title>Red Dot Topup Shop - 01912168328 | Free Fire Diamond</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="logo">
          <i className="fas fa-gem"></i>
          <span>Red Dot Topup</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'15px',flexWrap:'wrap'}}>
          <a href="tel:+8801912168328" className="phone">
            <i className="fas fa-phone"></i> 01912-168328
          </a>
          <button className="admin-btn" onClick={() => setLoginOpen(true)}>
            <i className="fas fa-user-shield"></i> Admin Panel
          </button>
        </div>
      </header>

      {/* Floating Notification */}
      <div className={`notify-box${notifyVisible ? ' active' : ''}`}>
        <span className="notify-close" onClick={() => { setNotifyVisible(false); localStorage.setItem('notifyVisible', 'false') }}>&times;</span>
        <div className="notify-header">
          <i className="fas fa-bell"></i>
          <span className="notify-title">New Update</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="notify-img" src={notifyPhoto || 'https://via.placeholder.com/65x65/FF4B2B/FFFFFF?text=Admin'} alt="Admin Photo" />
        <div className="notify-content">{notifyText}</div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <h1>Red Dot Topup Shop</h1>
        <h2>Mobile Recharge + Free Fire Diamond | Best Prices</h2>
        <div className="big-phone">01912-168328</div>
        <a href="https://wa.me/8801912168328?text=Red%20Dot%20Topup%20order" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-whatsapp"></i> Order Now
        </a>
      </section>

      {/* Free Fire Diamonds */}
      <section className="ff-section">
        <h2 className="ff-title">Free Fire Diamond Topup</h2>
        <p className="ff-subtitle">Diamonds in your account in 1 minute | 100% Secure</p>
        <div className="ff-grid">
          {FF_PACKAGES.map((pkg) => (
            <div key={pkg.diamond} className="ff-card" onClick={() => orderFF(pkg.diamond, pkg.price)}>
              <span className="ff-diamond">{pkg.emoji}</span>
              <div className="ff-price">{pkg.diamond}</div>
              <div className="ff-desc">{pkg.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-grid">
          <div className="service-card">
            <i className="fas fa-mobile-alt"></i>
            <h3>Mobile Recharge</h3>
            <p>Instant recharge for all operators - GP, Robi, Banglalink, Airtel, Teletalk</p>
          </div>
          <div className="service-card">
            <i className="fas fa-gem"></i>
            <h3>Free Fire Diamond</h3>
            <p>Cheapest Free Fire Diamond topup. Instant delivery within 1 minute</p>
          </div>
          <div className="service-card">
            <i className="fas fa-gamepad"></i>
            <h3>Game Topup</h3>
            <p>PUBG UC, Free Fire Diamond, and other game topup at the best prices</p>
          </div>
          <div className="service-card">
            <i className="fas fa-headset"></i>
            <h3>24/7 Support</h3>
            <p>Contact us anytime on WhatsApp. We are always ready to help</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <p className="footer-phone"><i className="fas fa-phone"></i> 01912-168328</p>
        <p>Red Dot Topup Shop &copy; 2024 | All Rights Reserved</p>
        <p>
          <a href="https://wa.me/8801912168328" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i> WhatsApp</a>
        </p>
      </footer>

      {/* Login Modal */}
      <div className={`modal${loginOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setLoginOpen(false) }}>
        <div className="modal-content">
          <button className="close-btn" onClick={() => setLoginOpen(false)}>&times;</button>
          <div className="login-form">
            <h2><i className="fas fa-user-shield"></i> Admin Login</h2>
            <div className="input-group">
              <i className="fas fa-user"></i>
              <input type="text" placeholder="Username" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} />
            </div>
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input type="password" placeholder="Password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
            </div>
            <button className="login-btn" onClick={handleLogin}>
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
          </div>
        </div>
      </div>

      {/* Admin Panel Modal */}
      <div className={`modal${adminOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setAdminOpen(false) }}>
        <div className="modal-content" style={{maxWidth:'700px'}}>
          <button className="close-btn" onClick={() => setAdminOpen(false)}>&times;</button>
          <div className="admin-panel">
            <h2 style={{textAlign:'center',marginBottom:'25px',fontWeight:900,color:'#333'}}>
              <i className="fas fa-user-shield"></i> Admin Panel
            </h2>
            <div className="admin-tabs">
              <button className={`tab-btn${activeTab === 'orders' ? ' active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
              <button className={`tab-btn${activeTab === 'notification' ? ' active' : ''}`} onClick={() => setActiveTab('notification')}>Notification</button>
              <button className={`tab-btn${activeTab === 'settings' ? ' active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
            </div>

            {/* Orders Tab */}
            <div className={`tab-content${activeTab === 'orders' ? ' active' : ''}`}>
              <h3><i className="fas fa-shopping-cart"></i> Orders</h3>
              {orders.length === 0 ? (
                <p style={{textAlign:'center',color:'#999',padding:'30px'}}>No orders yet</p>
              ) : (
                orders.map((order, index) => {
                  const statusColor = order.status === 'Completed' ? '#28a745' : order.status === 'Cancelled' ? '#dc3545' : '#ffc107'
                  return (
                    <div key={order.id} className="order-item">
                      <strong>{order.item}</strong> - {order.price}
                      <br /><small style={{color:'#666'}}>{order.date}</small>
                      <br /><span style={{color: statusColor, fontWeight:700}}>{order.status}</span>
                      <br />
                      <button className="status-btn success" onClick={() => updateOrder(index, 'Completed')}>Complete</button>
                      <button className="status-btn danger" onClick={() => updateOrder(index, 'Cancelled')}>Cancel</button>
                      <button className="status-btn delete" onClick={() => deleteOrder(index)}>Delete</button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Notification Tab */}
            <div className={`tab-content${activeTab === 'notification' ? ' active' : ''}`}>
              <h3><i className="fas fa-bell"></i> Notification Settings</h3>
              <label style={{fontWeight:700,display:'block',marginBottom:'8px'}}>Notification Text:</label>
              <textarea className="admin-input" rows={4} placeholder="Enter notification message..." value={notifyTextInput} onChange={(e) => setNotifyTextInput(e.target.value)} />
              <label style={{fontWeight:700,display:'block',marginBottom:'8px'}}>Admin Photo URL:</label>
              <input type="text" className="admin-input" placeholder="Enter photo URL..." value={notifyPhotoInput} onChange={(e) => setNotifyPhotoInput(e.target.value)} />
              <div style={{display:'flex',gap:'10px',marginTop:'10px'}}>
                <button className="admin-btn-wide" onClick={saveNotification}>
                  <i className="fas fa-save"></i> Save
                </button>
                <button className="admin-btn-wide" onClick={toggleNotification} style={{background:'linear-gradient(135deg,#28a745,#20c997)'}}>
                  <i className="fas fa-eye"></i> Show/Hide
                </button>
              </div>
            </div>

            {/* Settings Tab */}
            <div className={`tab-content${activeTab === 'settings' ? ' active' : ''}`}>
              <h3><i className="fas fa-cog"></i> Settings</h3>
              <label style={{fontWeight:700,display:'block',marginBottom:'8px'}}>Change Password:</label>
              <input type="password" className="admin-input" placeholder="New password..." value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              <button className="admin-btn-wide" onClick={changePassword}>
                <i className="fas fa-key"></i> Update Password
              </button>
              <hr style={{margin:'25px 0',borderColor:'#eee'}} />
              <button className="admin-btn-wide" onClick={() => { setAdminOpen(false); alert('Logged out successfully!') }} style={{background:'linear-gradient(135deg,#dc3545,#c82333)'}}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
