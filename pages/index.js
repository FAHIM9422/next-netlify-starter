import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'

const DEFAULT_PACKAGES = [
  { name: '25 Diamond', price: '25', diamond: '💎', desc: 'শুধু ২৫ টাকা' },
  { name: '50 Diamond', price: '50', diamond: '💎💎', desc: 'শুধু ৫০ টাকা' },
  { name: 'Weekly Lite', price: '50', icon: 'fas fa-calendar-day', desc: 'শুধু ৫০ টাকা', badge: 'নতুন!', variant: 'weekly-lite' },
  { name: '115 Diamond', price: '80', diamond: '💎💎💎', desc: 'শুধু ৮০ টাকা', badge: 'জনপ্রিয়' },
  { name: '240 Diamond', price: '160', diamond: '💎💎💎💎', desc: 'শুধু ১৬০ টাকা' },
  { name: '610 Diamond', price: '390', diamond: '💎×৬', desc: 'শুধু ৩৯০ টাকা' },
  { name: '1240 Diamond', price: '790', diamond: '💎×১২', desc: 'শুধু ৭৯০ টাকা' },
  { name: '2530 Diamond', price: '1560', diamond: '💎×২৫', desc: 'শুধু ১৫৬০ টাকা', badge: 'বেস্ট' },
  { name: 'Weekly Pack', price: '165', icon: 'fas fa-calendar-week', desc: 'শুধু ১৬৫ টাকা' },
  { name: 'Monthly Pack', price: '790', icon: 'fas fa-calendar-alt', desc: 'শুধু ৭৯০ টাকা' },
]

export default function Home() {
  const [showNotification, setShowNotification] = useState(false)
  const [notificationData, setNotificationData] = useState({ title: 'নতুন অফার!', content: 'Weekly Lite শুধু ৫০ টাকা! এখনই অর্ডার করুন 💎', enabled: true })
  const [orderModal, setOrderModal] = useState(false)
  const [adminModal, setAdminModal] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [adminTab, setAdminTab] = useState('packages')
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [formData, setFormData] = useState({ playerId: '', playerName: '', phone: '', payment: 'bkash' })
  const [diamondPackages, setDiamondPackages] = useState(DEFAULT_PACKAGES)
  const [editPackages, setEditPackages] = useState([])
  const [editNotification, setEditNotification] = useState({ title: '', content: '', enabled: true })
  const [orders, setOrders] = useState([])
  const [loginError, setLoginError] = useState('')
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [saving, setSaving] = useState(false)

  const loadPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages')
      if (res.ok) {
        const data = await res.json()
        setDiamondPackages(data)
      }
    } catch (e) { /* use defaults */ }
  }, [])

  const loadNotification = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotificationData(data)
      }
    } catch (e) { /* use defaults */ }
  }, [])

  useEffect(() => {
    loadPackages()
    loadNotification()
  }, [loadPackages, loadNotification])

  useEffect(() => {
    if (notificationData.enabled) {
      const timer = setTimeout(() => setShowNotification(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [notificationData.enabled])

  function handleOrder(pkg) {
    setSelectedPackage(pkg)
    setOrderSuccess(false)
    setFormData({ playerId: '', playerName: '', phone: '', payment: 'bkash' })
    setOrderModal(true)
  }

  async function submitOrder(e) {
    e.preventDefault()
    if (!formData.playerId || !formData.phone) return

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          playerId: formData.playerId,
          playerName: formData.playerName,
          phone: formData.phone,
          payment: formData.payment,
        }),
      })
    } catch (e) { /* still show success for WhatsApp flow */ }

    setOrderSuccess(true)
  }

  async function handleAdminLogin(e) {
    e.preventDefault()
    setLoginError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
      const data = await res.json()
      if (data.success) {
        setAdminToken(data.token)
        setAdminLoggedIn(true)
        setAdminModal(false)
        setEditPackages(JSON.parse(JSON.stringify(diamondPackages)))
        setEditNotification({ ...notificationData })
        loadOrders(data.token)
      } else {
        setLoginError('Invalid username or password')
      }
    } catch (e) {
      setLoginError('Login failed. Please try again.')
    }
  }

  async function loadOrders(token) {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token || adminToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (e) { /* ignore */ }
  }

  async function savePackages() {
    setSaving(true)
    try {
      await fetch('/api/packages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(editPackages),
      })
      setDiamondPackages(editPackages)
    } catch (e) { /* ignore */ }
    setSaving(false)
  }

  async function saveNotification() {
    setSaving(true)
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(editNotification),
      })
      setNotificationData(editNotification)
    } catch (e) { /* ignore */ }
    setSaving(false)
  }

  function updatePackage(idx, field, value) {
    const updated = [...editPackages]
    updated[idx] = { ...updated[idx], [field]: value }
    setEditPackages(updated)
  }

  function addPackage() {
    setEditPackages([...editPackages, { name: 'New Package', price: '0', diamond: '💎', desc: 'শুধু ০ টাকা' }])
  }

  function removePackage(idx) {
    setEditPackages(editPackages.filter((_, i) => i !== idx))
  }

  function adminLogout() {
    setAdminLoggedIn(false)
    setAdminToken('')
    setOrders([])
  }

  return (
    <>
      <Head>
        <title>Red Dot Topup Shop - ০১৯১২১৬৮৩২৮ | Free Fire Diamond</title>
        <meta name="description" content="Free Fire Diamond Topup - সবচেয়ে কম দামে Diamond কিনুন। ১ মিনিটে ডেলিভারি। Red Dot Topup Shop।" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="logo">
          <i className="fas fa-gem"></i>
          <span>🔴 Red Dot Topup</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <a href="tel:+8801912168328" className="phone">
            <i className="fas fa-phone"></i> 01912-168328
          </a>
          {adminLoggedIn ? (
            <button className="admin-btn" style={{ background: 'rgba(0,255,0,0.3)', borderColor: '#00ff00' }} onClick={adminLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          ) : (
            <button className="admin-btn" onClick={() => { setAdminModal(true); setLoginError(''); setLoginData({ username: '', password: '' }) }}>
              <i className="fas fa-user-shield"></i> Admin
            </button>
          )}
        </div>
      </header>

      {/* Floating Notification */}
      {notificationData.enabled && (
        <div className={`notify-box${showNotification ? ' active' : ''}`}>
          <button className="notify-close" onClick={() => setShowNotification(false)}>&times;</button>
          <div className="notify-header">
            <i className="fas fa-bell"></i>
            <span className="notify-title">{notificationData.title}</span>
          </div>
          <div className="notify-content">{notificationData.content}</div>
        </div>
      )}

      {/* Admin Panel */}
      {adminLoggedIn && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2><i className="fas fa-user-shield"></i> Admin Panel</h2>
            <button className="admin-close-btn" onClick={adminLogout}><i className="fas fa-times"></i></button>
          </div>
          <div className="admin-tabs">
            <button className={`admin-tab${adminTab === 'packages' ? ' active' : ''}`} onClick={() => setAdminTab('packages')}>
              <i className="fas fa-gem"></i> Packages
            </button>
            <button className={`admin-tab${adminTab === 'notifications' ? ' active' : ''}`} onClick={() => setAdminTab('notifications')}>
              <i className="fas fa-bell"></i> Notifications
            </button>
            <button className={`admin-tab${adminTab === 'orders' ? ' active' : ''}`} onClick={() => { setAdminTab('orders'); loadOrders() }}>
              <i className="fas fa-shopping-cart"></i> Orders
            </button>
          </div>

          <div className="admin-content">
            {/* Packages Tab */}
            {adminTab === 'packages' && (
              <div>
                <h3>Diamond Packages & Prices</h3>
                <p className="admin-hint">Change the amount (price) and diamond values below:</p>
                {editPackages.map((pkg, idx) => (
                  <div key={idx} className="admin-package-row">
                    <div className="admin-field">
                      <label>Package Name</label>
                      <input value={pkg.name} onChange={(e) => updatePackage(idx, 'name', e.target.value)} />
                    </div>
                    <div className="admin-field">
                      <label>Price (টাকা)</label>
                      <input value={pkg.price} onChange={(e) => updatePackage(idx, 'price', e.target.value)} />
                    </div>
                    <div className="admin-field">
                      <label>Diamond Display</label>
                      <input value={pkg.diamond || ''} onChange={(e) => updatePackage(idx, 'diamond', e.target.value)} />
                    </div>
                    <div className="admin-field">
                      <label>Description</label>
                      <input value={pkg.desc} onChange={(e) => updatePackage(idx, 'desc', e.target.value)} />
                    </div>
                    <div className="admin-field">
                      <label>Badge</label>
                      <input value={pkg.badge || ''} onChange={(e) => updatePackage(idx, 'badge', e.target.value)} placeholder="e.g. জনপ্রিয়" />
                    </div>
                    <button className="admin-remove-btn" onClick={() => removePackage(idx)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
                <div className="admin-actions">
                  <button className="admin-add-btn" onClick={addPackage}>
                    <i className="fas fa-plus"></i> Add Package
                  </button>
                  <button className="admin-save-btn" onClick={savePackages} disabled={saving}>
                    <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Packages'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {adminTab === 'notifications' && (
              <div>
                <h3>Notification Settings</h3>
                <p className="admin-hint">Edit the popup notification shown to visitors:</p>
                <div className="admin-notification-form">
                  <div className="admin-field">
                    <label>Title</label>
                    <input value={editNotification.title} onChange={(e) => setEditNotification({ ...editNotification, title: e.target.value })} />
                  </div>
                  <div className="admin-field">
                    <label>Content</label>
                    <textarea rows={3} value={editNotification.content} onChange={(e) => setEditNotification({ ...editNotification, content: e.target.value })} />
                  </div>
                  <div className="admin-field admin-checkbox">
                    <label>
                      <input type="checkbox" checked={editNotification.enabled} onChange={(e) => setEditNotification({ ...editNotification, enabled: e.target.checked })} />
                      <span>Show notification to visitors</span>
                    </label>
                  </div>
                  <button className="admin-save-btn" onClick={saveNotification} disabled={saving}>
                    <i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save Notification'}
                  </button>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {adminTab === 'orders' && (
              <div>
                <h3>Recent Orders</h3>
                <p className="admin-hint">See who ordered items:</p>
                {orders.length === 0 ? (
                  <p className="admin-empty">No orders yet.</p>
                ) : (
                  <div className="admin-orders-list">
                    {orders.map((order, idx) => (
                      <div key={idx} className="admin-order-card">
                        <div className="order-card-header">
                          <span className="order-package-name">{order.packageName}</span>
                          <span className={`order-status order-status-${order.status}`}>{order.status}</span>
                        </div>
                        <div className="order-card-details">
                          <div><i className="fas fa-gamepad"></i> Player ID: <strong>{order.playerId}</strong></div>
                          <div><i className="fas fa-user"></i> Name: <strong>{order.playerName || 'N/A'}</strong></div>
                          <div><i className="fas fa-phone"></i> Phone: <strong>{order.phone}</strong></div>
                          <div><i className="fas fa-wallet"></i> Payment: <strong>{order.payment}</strong></div>
                          <div><i className="fas fa-tag"></i> Price: <strong>{order.packagePrice} টাকা</strong></div>
                          <div><i className="fas fa-clock"></i> Time: <strong>{new Date(order.createdAt).toLocaleString()}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <h1>🔴 Red Dot Topup Shop</h1>
        <h2>Free Fire Diamond | সবচেয়ে কম দাম | ১ মিনিট ডেলিভারি</h2>
        <div className="big-phone">📱 01912-168328</div>
        <a
          href="https://wa.me/8801912168328?text=Red%20Dot%20Topup%20order%20korchi"
          className="whatsapp-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp"></i> এখনই অর্ডার করুন
        </a>
      </section>

      {/* Free Fire Diamonds */}
      <section className="ff-section">
        <h2 className="ff-title">💎 Free Fire Diamond Topup</h2>
        <p className="ff-subtitle">১ মিনিটে আপনার অ্যাকাউন্টে Diamond | ১০০% সিকিউর | COD Available</p>
        <div className="ff-grid">
          {diamondPackages.map((pkg, idx) => (
            <div
              key={idx}
              className={`ff-card${pkg.variant === 'weekly-lite' ? ' ff-card-weekly-lite' : ''}`}
              onClick={() => handleOrder(pkg)}
            >
              {pkg.diamond ? (
                <span className="ff-diamond">{pkg.diamond}</span>
              ) : (
                <i className={pkg.icon} style={{ fontSize: '4.5rem', marginBottom: '18px', color: pkg.variant === 'weekly-lite' ? 'white' : '#ffd700', display: 'block' }}></i>
              )}
              <div className="ff-price">{pkg.name}</div>
              <div className="ff-desc">{pkg.desc}</div>
              {pkg.badge && <span className="popular-badge">{pkg.badge}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '10px' }}>
          <i className="fas fa-gem"></i>
          <span>🔴 Red Dot Topup Shop</span>
        </div>
        <p>📱 01912-168328 | Free Fire Diamond Topup</p>
        <p style={{ marginTop: '10px', opacity: 0.5, fontSize: '0.9rem' }}>© {new Date().getFullYear()} Red Dot Topup. All rights reserved.</p>
      </footer>

      {/* Order Modal */}
      {orderModal && (
        <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) setOrderModal(false) }}>
          <div className="modal-content">
            <button className="close" onClick={() => setOrderModal(false)}>&times;</button>
            {!orderSuccess ? (
              <form className="order-form" onSubmit={submitOrder}>
                <h2>📱 অর্ডার ফর্ম</h2>
                {selectedPackage && (
                  <div className="selected-package">
                    {selectedPackage.name} - {selectedPackage.desc}
                  </div>
                )}
                <div className="input-group">
                  <i className="fas fa-gamepad"></i>
                  <input
                    type="text"
                    placeholder="আপনার Player ID"
                    value={formData.playerId}
                    onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <i className="fas fa-user"></i>
                  <input
                    type="text"
                    placeholder="আপনার নাম"
                    value={formData.playerName}
                    onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <i className="fas fa-phone"></i>
                  <input
                    type="tel"
                    placeholder="মোবাইল নম্বর"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <i className="fas fa-wallet"></i>
                  <select
                    value={formData.payment}
                    onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
                <button type="submit" className="order-btn">
                  <i className="fab fa-whatsapp"></i> অর্ডার কনফার্ম করুন
                </button>
              </form>
            ) : (
              <div className="order-success">
                <i className="fas fa-check-circle"></i>
                <h3>অর্ডার সফল হয়েছে! ✅</h3>
                <p>
                  আপনার <strong>{selectedPackage?.name}</strong> অর্ডার গ্রহণ করা হয়েছে।
                  <br /><br />
                  দ্রুত ডেলিভারির জন্য WhatsApp-এ যোগাযোগ করুন:
                  <br />
                  <strong>01912-168328</strong>
                </p>
                <a
                  href={`https://wa.me/8801912168328?text=${encodeURIComponent(
                    `Red Dot Topup Order:\nPackage: ${selectedPackage?.name}\nPrice: ${selectedPackage?.price} টাকা\nPlayer ID: ${formData.playerId}\nName: ${formData.playerName}\nPhone: ${formData.phone}\nPayment: ${formData.payment}`
                  )}`}
                  className="order-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginTop: '25px', textDecoration: 'none' }}
                >
                  <i className="fab fa-whatsapp"></i> WhatsApp-এ পাঠান
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {adminModal && (
        <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) setAdminModal(false) }}>
          <div className="modal-content">
            <button className="close" onClick={() => setAdminModal(false)}>&times;</button>
            <form className="login-form" onSubmit={handleAdminLogin}>
              <h2>🔐 Admin Login</h2>
              {loginError && <div className="login-error">{loginError}</div>}
              <div className="input-group">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="login-btn">
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
