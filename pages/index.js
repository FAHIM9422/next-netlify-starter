import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const DEFAULT_PRODUCTS = [
  { id: 1, diamonds: '100', price: '120', emoji: '\u{1F48E}' },
  { id: 2, diamonds: '218', price: '250', emoji: '\u{1F48E}\u{1F48E}' },
  { id: 3, diamonds: '522', price: '550', emoji: '\u{1F48E}\u{1F48E}\u{1F48E}' },
  { id: 4, diamonds: '1080', price: '1100', emoji: '\u{1F48E}\u{1F48E}\u{1F48E}\u{1F48E}' },
  { id: 5, diamonds: '2180', price: '2200', emoji: '\u{1F48E}\u{1F48E}\u{1F48E}\u{1F48E}\u{1F48E}' },
]

const SERVICES = [
  { icon: 'fas fa-mobile-alt', title: '\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09B0\u09BF\u099A\u09BE\u09B0\u09CD\u099C', desc: '\u09B8\u0995\u09B2 \u0985\u09AA\u09BE\u09B0\u09C7\u099F\u09B0 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F' },
  { icon: 'fas fa-gem', title: 'Free Fire Diamond', desc: '\u0987\u09A8\u09CD\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF' },
  { icon: 'fas fa-gamepad', title: 'PUBG UC', desc: '\u09B8\u09AC\u099A\u09C7\u09AF\u09BC\u09C7 \u0995\u09AE \u09A6\u09BE\u09AE\u09C7' },
  { icon: 'fas fa-headset', title: '24/7 \u09B8\u09BE\u09AA\u09CB\u09B0\u09CD\u099F', desc: '\u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09B8\u09AE\u09AF\u09BC \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF' },
]

const DEFAULT_PASSWORD = 'admin123'
const PHONE = '01912-168328'
const WA_PHONE = '8801912168328'

function toBanglaNum(num) {
  const banglaDigits = ['\u09E6','\u09E7','\u09E8','\u09E9','\u09EA','\u09EB','\u09EC','\u09ED','\u09EE','\u09EF']
  return String(num).replace(/[0-9]/g, d => banglaDigits[d])
}

export default function Home() {
  // State
  const [showNotification, setShowNotification] = useState(false)
  const [notificationText, setNotificationText] = useState('\u0986\u09AA\u09A8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BF\u09AF\u09BC Red Dot Topup Shop \u098F \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE! \u09B8\u09AC\u099A\u09C7\u09AF\u09BC\u09C7 \u0995\u09AE \u09A6\u09BE\u09AE\u09C7 Diamond \u09AA\u09BE\u09A8\u0964')
  const [notificationPhoto, setNotificationPhoto] = useState('')
  const [notificationEnabled, setNotificationEnabled] = useState(true)

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const [adminPassword, setAdminPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)

  const [orderProduct, setOrderProduct] = useState(null)
  const [orderName, setOrderName] = useState('')
  const [orderPlayerID, setOrderPlayerID] = useState('')

  // Admin notification edit fields
  const [editNotifText, setEditNotifText] = useState('')
  const [editNotifPhoto, setEditNotifPhoto] = useState('')

  // Admin price edit
  const [editPrices, setEditPrices] = useState({})

  // Admin password change
  const [newPassword, setNewPassword] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('rdt_orders')
      if (savedOrders) setOrders(JSON.parse(savedOrders))

      const savedProducts = localStorage.getItem('rdt_products')
      if (savedProducts) setProducts(JSON.parse(savedProducts))

      const savedNotifText = localStorage.getItem('rdt_notif_text')
      if (savedNotifText) setNotificationText(savedNotifText)

      const savedNotifPhoto = localStorage.getItem('rdt_notif_photo')
      if (savedNotifPhoto) setNotificationPhoto(savedNotifPhoto)

      const savedNotifEnabled = localStorage.getItem('rdt_notif_enabled')
      if (savedNotifEnabled !== null) setNotificationEnabled(savedNotifEnabled === 'true')
    } catch (e) {
      // localStorage not available
    }
  }, [])

  // Show notification after a short delay
  useEffect(() => {
    if (notificationEnabled) {
      const timer = setTimeout(() => setShowNotification(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [notificationEnabled])

  // Save orders to localStorage
  useEffect(() => {
    try { localStorage.setItem('rdt_orders', JSON.stringify(orders)) } catch(e) {}
  }, [orders])

  // Handlers
  const handleOrderClick = useCallback((product) => {
    setOrderProduct(product)
    setOrderName('')
    setOrderPlayerID('')
    setShowOrderModal(true)
  }, [])

  const handleOrderSubmit = useCallback((e) => {
    e.preventDefault()
    if (!orderName.trim() || !orderPlayerID.trim()) return

    const newOrder = {
      id: Date.now(),
      name: orderName.trim(),
      playerID: orderPlayerID.trim(),
      product: `${orderProduct.diamonds} Diamond`,
      price: orderProduct.price,
      status: 'pending',
      date: new Date().toLocaleDateString('bn-BD'),
    }

    setOrders(prev => [newOrder, ...prev])
    setShowOrderModal(false)

    // Open WhatsApp
    const msg = encodeURIComponent(
      `Red Dot Topup Order\n\n` +
      `\u{1F48E} Product: ${orderProduct.diamonds} Diamond\n` +
      `\u{1F4B0} Price: ${orderProduct.price} Taka\n` +
      `\u{1F464} Name: ${orderName.trim()}\n` +
      `\u{1F3AE} Player ID: ${orderPlayerID.trim()}\n\n` +
      `Order from Red Dot Topup Shop`
    )
    window.open(`https://wa.me/${WA_PHONE}?text=${msg}`, '_blank')
  }, [orderName, orderPlayerID, orderProduct])

  const handleAdminLogin = useCallback((e) => {
    e.preventDefault()
    let storedPassword
    try { storedPassword = localStorage.getItem('rdt_admin_password') } catch(e) {}
    const correctPassword = storedPassword || DEFAULT_PASSWORD

    if (adminPassword === correctPassword) {
      setShowLoginModal(false)
      setShowAdminModal(true)
      setAdminPassword('')
      setLoginError('')
      setEditNotifText(notificationText)
      setEditNotifPhoto(notificationPhoto)
      // Init price edit state
      const priceMap = {}
      products.forEach(p => { priceMap[p.id] = p.price })
      setEditPrices(priceMap)
    } else {
      setLoginError('\u09AD\u09C1\u09B2 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1! \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964')
    }
  }, [adminPassword, notificationText, notificationPhoto, products])

  const handleAdminLogout = useCallback(() => {
    setShowAdminModal(false)
    setActiveTab('orders')
  }, [])

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }, [])

  const deleteOrder = useCallback((orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }, [])

  const saveNotification = useCallback(() => {
    setNotificationText(editNotifText)
    setNotificationPhoto(editNotifPhoto)
    try {
      localStorage.setItem('rdt_notif_text', editNotifText)
      localStorage.setItem('rdt_notif_photo', editNotifPhoto)
      localStorage.setItem('rdt_notif_enabled', String(notificationEnabled))
    } catch(e) {}
    alert('\u09A8\u09CB\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u09B8\u09C7\u09AD \u09B9\u09AF\u09BC\u09C7\u099B\u09C7!')
  }, [editNotifText, editNotifPhoto, notificationEnabled])

  const savePrices = useCallback(() => {
    const updated = products.map(p => ({
      ...p,
      price: editPrices[p.id] || p.price,
    }))
    setProducts(updated)
    try { localStorage.setItem('rdt_products', JSON.stringify(updated)) } catch(e) {}
    alert('\u09A6\u09BE\u09AE \u0986\u09AA\u09A1\u09C7\u099F \u09B9\u09AF\u09BC\u09C7\u099B\u09C7!')
  }, [products, editPrices])

  const savePassword = useCallback(() => {
    if (newPassword.length < 4) {
      alert('\u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09EA \u0985\u0995\u09CD\u09B7\u09B0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7!')
      return
    }
    try { localStorage.setItem('rdt_admin_password', newPassword) } catch(e) {}
    setNewPassword('')
    alert('\u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7!')
  }, [newPassword])

  const statusLabel = (status) => {
    if (status === 'pending') return '\u09AA\u09C7\u09A8\u09CD\u09A1\u09BF\u0982'
    if (status === 'processing') return '\u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982'
    return '\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8'
  }

  return (
    <>
      <Head>
        <title>Red Dot Topup Shop - {PHONE} | Free Fire Diamond</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Red Dot Topup Shop - \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09B0\u09BF\u099A\u09BE\u09B0\u09CD\u099C + Free Fire Diamond | \u09B8\u09AC\u099A\u09C7\u09AF\u09BC\u09C7 \u0995\u09AE \u09A6\u09BE\u09AE" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="logo">
          <i className="fas fa-gem"></i>
          <span>{'\u{1F534}'} Red Dot Topup</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <a href={`tel:+${WA_PHONE}`} className="phone">
            <i className="fas fa-phone"></i> {PHONE}
          </a>
          <button className="admin-btn" onClick={() => { setShowLoginModal(true); setLoginError(''); setAdminPassword('') }}>
            <i className="fas fa-user-shield"></i> Admin Panel
          </button>
        </div>
      </header>

      {/* Floating Notification */}
      {showNotification && notificationEnabled && (
        <div className="notify-box active">
          <button className="notify-close" onClick={() => setShowNotification(false)}>&times;</button>
          <div className="notify-header">
            <i className="fas fa-bell"></i>
            <span className="notify-title">{'\u09A8\u09A4\u09C1\u09A8 \u0986\u09AA\u09A1\u09C7\u099F'}</span>
          </div>
          {notificationPhoto && (
            <img className="notify-img" src={notificationPhoto} alt="Admin" />
          )}
          <div className="notify-content">{notificationText}</div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <h1>{'\u{1F534}'} Red Dot Topup Shop</h1>
        <h2>{'\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09B0\u09BF\u099A\u09BE\u09B0\u09CD\u099C + Free Fire Diamond | \u09B8\u09AC\u099A\u09C7\u09AF\u09BC\u09C7 \u0995\u09AE \u09A6\u09BE\u09AE'}</h2>
        <div className="big-phone">{'\u{1F4F1}'} {PHONE}</div>
        <a
          href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent('Red Dot Topup order')}`}
          className="whatsapp-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp"></i> {'\u098F\u0996\u09A8\u0987 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8'}
        </a>
      </section>

      {/* Free Fire Diamonds */}
      <section className="ff-section">
        <h2 className="ff-title">{'\u{1F48E}'} Free Fire Diamond Topup</h2>
        <p className="ff-subtitle">{'\u09E7 \u09AE\u09BF\u09A8\u09BF\u099F\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09C7 Diamond | \u09E7\u09E6\u09E6% \u09B8\u09BF\u0995\u09BF\u0989\u09B0'}</p>
        <div className="ff-grid">
          {products.map(product => (
            <div key={product.id} className="ff-card" onClick={() => handleOrderClick(product)}>
              <span className="ff-diamond">{product.emoji}</span>
              <div className="ff-price">{toBanglaNum(product.diamonds)} Diamond</div>
              <div className="ff-desc">{'\u09B6\u09C1\u09A7\u09C1'} {toBanglaNum(product.price)} {'\u099F\u09BE\u0995\u09BE'}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="services">
        <h2>{'\u{1F6E0}\u{FE0F}'} {'\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09C7\u09AC\u09BE\u09B8\u09AE\u09C2\u09B9'}</h2>
        <div className="service-grid">
          {SERVICES.map((service, idx) => (
            <div key={idx} className="service-card">
              <i className={service.icon}></i>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <p>&copy; 2024 Red Dot Topup Shop. {'\u09B8\u09B0\u09CD\u09AC\u09B8\u09CD\u09AC\u09A4\u09CD\u09AC \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4\u0964'}</p>
        <p>{'\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997:'} <a href={`tel:+${WA_PHONE}`}>{PHONE}</a></p>
      </footer>

      {/* Order Form Modal */}
      {showOrderModal && orderProduct && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowOrderModal(false) }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowOrderModal(false)}>&times;</button>
            <form className="order-form" onSubmit={handleOrderSubmit}>
              <h2>{'\u{1F48E}'} {'\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8'}</h2>
              <div className="order-detail">
                {toBanglaNum(orderProduct.diamonds)} Diamond - {toBanglaNum(orderProduct.price)} {'\u099F\u09BE\u0995\u09BE'}
              </div>
              <div className="input-group">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  placeholder={'\u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09BE\u09AE'}
                  value={orderName}
                  onChange={e => setOrderName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <i className="fas fa-gamepad"></i>
                <input
                  type="text"
                  placeholder="Player ID"
                  value={orderPlayerID}
                  onChange={e => setOrderPlayerID(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-btn">
                <i className="fab fa-whatsapp"></i> {'\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE \u0995\u09B0\u09C1\u09A8'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false) }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>&times;</button>
            <form className="login-form" onSubmit={handleAdminLogin}>
              <h2><i className="fas fa-user-shield"></i> Admin Login</h2>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  placeholder={'\u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09A6\u09BF\u09A8'}
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && <p style={{ color: '#dc3545', marginBottom: '15px', fontWeight: '700' }}>{loginError}</p>}
              <button type="submit" className="login-btn">
                <i className="fas fa-sign-in-alt"></i> {'\u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09C1\u09A8'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminModal && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowAdminModal(false) }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-panel">
              <div className="admin-header">
                <h2><i className="fas fa-user-shield"></i> Admin Panel</h2>
                <button className="admin-logout" onClick={handleAdminLogout}>
                  <i className="fas fa-sign-out-alt"></i> {'\u09B2\u0997\u0986\u0989\u099F'}
                </button>
              </div>

              {/* Tabs */}
              <div className="admin-tabs">
                {['orders', 'notification', 'prices', 'settings'].map(tab => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'orders' && <><i className="fas fa-shopping-cart"></i> {'\u0985\u09B0\u09CD\u09A1\u09BE\u09B0'}</>}
                    {tab === 'notification' && <><i className="fas fa-bell"></i> {'\u09A8\u09CB\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8'}</>}
                    {tab === 'prices' && <><i className="fas fa-tag"></i> {'\u09A6\u09BE\u09AE'}</>}
                    {tab === 'settings' && <><i className="fas fa-cog"></i> {'\u09B8\u09C7\u099F\u09BF\u0982\u09B8'}</>}
                  </button>
                ))}
              </div>

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="tab-content active">
                  <h3><i className="fas fa-shopping-cart"></i> {'\u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09B8\u09AE\u09C2\u09B9'}</h3>
                  {orders.length === 0 ? (
                    <div className="no-orders">{'\u0995\u09CB\u09A8\u09CB \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09A8\u09C7\u0987'}</div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="order-item">
                        <p><strong>{'\u09A8\u09BE\u09AE:'}</strong> {order.name}</p>
                        <p><strong>Player ID:</strong> {order.playerID}</p>
                        <p><strong>{'\u09AA\u09CD\u09B0\u09CB\u09A1\u09BE\u0995\u09CD\u099F:'}</strong> {order.product}</p>
                        <p><strong>{'\u09A6\u09BE\u09AE:'}</strong> {order.price} {'\u099F\u09BE\u0995\u09BE'}</p>
                        <p><strong>{'\u09A4\u09BE\u09B0\u09BF\u0996:'}</strong> {order.date}</p>
                        <p>
                          <strong>{'\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8:'}</strong>
                          <span className={`order-status ${order.status}`}>{statusLabel(order.status)}</span>
                        </p>
                        <div className="order-actions">
                          <button className="status-btn warning" onClick={() => updateOrderStatus(order.id, 'processing')}>
                            {'\u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09BF\u0982'}
                          </button>
                          <button className="status-btn success" onClick={() => updateOrderStatus(order.id, 'completed')}>
                            {'\u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8'}
                          </button>
                          <button className="status-btn danger" onClick={() => deleteOrder(order.id)}>
                            <i className="fas fa-trash"></i> {'\u09A1\u09BF\u09B2\u09BF\u099F'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Notification Tab */}
              {activeTab === 'notification' && (
                <div className="tab-content active">
                  <h3><i className="fas fa-bell"></i> {'\u09A8\u09CB\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u09B8\u09C7\u099F\u09BF\u0982\u09B8'}</h3>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={notificationEnabled}
                        onChange={e => setNotificationEnabled(e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                      />
                      {'\u09A8\u09CB\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u099A\u09BE\u09B2\u09C1 \u0995\u09B0\u09C1\u09A8'}
                    </label>
                  </div>
                  <textarea
                    className="admin-input"
                    placeholder={'\u09A8\u09CB\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u099F\u09C7\u0995\u09CD\u09B8\u099F \u09B2\u09BF\u0996\u09C1\u09A8...'}
                    value={editNotifText}
                    onChange={e => setEditNotifText(e.target.value)}
                  />
                  <input
                    className="admin-input"
                    type="text"
                    placeholder={'\u099B\u09AC\u09BF\u09B0 URL (\u0990\u099A\u09CD\u099B\u09BF\u0995)'}
                    value={editNotifPhoto}
                    onChange={e => setEditNotifPhoto(e.target.value)}
                  />
                  <button className="admin-btn-wide" onClick={saveNotification}>
                    <i className="fas fa-save"></i> {'\u09B8\u09C7\u09AD \u0995\u09B0\u09C1\u09A8'}
                  </button>
                </div>
              )}

              {/* Prices Tab */}
              {activeTab === 'prices' && (
                <div className="tab-content active">
                  <h3><i className="fas fa-tag"></i> {'\u09A1\u09BE\u09AF\u09BC\u09AE\u09A8\u09CD\u09A1 \u09A6\u09BE\u09AE \u0986\u09AA\u09A1\u09C7\u099F'}</h3>
                  {products.map(product => (
                    <div key={product.id} className="price-row">
                      <label>{product.diamonds} Diamond</label>
                      <input
                        type="number"
                        value={editPrices[product.id] || product.price}
                        onChange={e => setEditPrices(prev => ({ ...prev, [product.id]: e.target.value }))}
                      />
                      <span>{'\u099F\u09BE\u0995\u09BE'}</span>
                    </div>
                  ))}
                  <button className="admin-btn-wide" onClick={savePrices} style={{ marginTop: '15px' }}>
                    <i className="fas fa-save"></i> {'\u09A6\u09BE\u09AE \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09C1\u09A8'}
                  </button>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="tab-content active">
                  <h3><i className="fas fa-cog"></i> {'\u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8'}</h3>
                  <input
                    className="admin-input"
                    type="password"
                    placeholder={'\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button className="admin-btn-wide" onClick={savePassword}>
                    <i className="fas fa-key"></i> {'\u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09C1\u09A8'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
